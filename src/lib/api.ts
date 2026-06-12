/**
 * src/lib/api.ts
 *
 * Central HTTP client. All requests go through apiFetch().
 * - Attaches Bearer token automatically
 * - On 401, attempts token refresh once, then retries
 * - On refresh failure, clears tokens (user effectively logged out)
 * - Throws ApiError shape on all non-2xx responses
 */

import type { ApiError, AuthTokens } from "@/types/api"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1"

// ─── Token storage ────────────────────────────────────────────────────────────
// Simple localStorage wrappers. Swap for a more secure store (httpOnly cookies)
// in production if needed. For an SPA this is the standard approach.

export const tokenStorage = {
  getAccess: () => localStorage.getItem("access_token"),
  getRefresh: () => localStorage.getItem("refresh_token"),
  setTokens: (t: AuthTokens) => {
    localStorage.setItem("access_token", t.access)
    localStorage.setItem("refresh_token", t.refresh)
  },
  clear: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function notifySubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) throw new Error("No refresh token")

  const res = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) {
    tokenStorage.clear()
    // Dispatch a custom event so your auth store can react (redirect to login etc.)
    window.dispatchEvent(new Event("auth:logout"))
    throw new Error("Session expired")
  }

  const data = await res.json()
  // Django SimpleJWT returns { access, refresh } when ROTATE_REFRESH_TOKENS=True
  tokenStorage.setTokens({ access: data.access, refresh: data.refresh ?? refresh })
  return data.access
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  _retry = true,        // internal flag to prevent infinite refresh loops
): Promise<T> {
  const token = tokenStorage.getAccess()

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // ── Token expired → refresh and retry once ────────────────────────────────
  if (res.status === 401 && _retry) {
    if (isRefreshing) {
      // Another request already kicked off a refresh — wait for it
      return new Promise((resolve, reject) => {
        subscribeToRefresh(async (newToken) => {
          try {
            resolve(await apiFetch<T>(endpoint, options, false))
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    isRefreshing = true
    try {
      const newToken = await refreshAccessToken()
      notifySubscribers(newToken)
      return await apiFetch<T>(endpoint, options, false)
    } finally {
      isRefreshing = false
    }
  }

  // ── Error responses ───────────────────────────────────────────────────────
  if (!res.ok) {
    let errorBody: ApiError
    try {
      errorBody = await res.json()
    } catch {
      errorBody = {
        error: { code: "unknown", message: `HTTP ${res.status}`, details: {} },
      }
    }
    throw errorBody
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json()
}

// ─── Convenience helpers ──────────────────────────────────────────────────────
// These just wrap apiFetch with the right method + body serialization.
// Use directly in your hooks: api.post<AuthResponse>("/auth/login/", payload)

export const api = {
  get: <T>(url: string, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),

  patch: <T>(url: string, body: unknown, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(url: string, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: "DELETE" }),
}
