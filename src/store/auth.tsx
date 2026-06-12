/**
 * src/store/auth.tsx
 *
 * Auth state management with React Context + useReducer.
 * No external library needed — this pattern scales well for auth.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth()
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { api, tokenStorage } from "@/lib/api"
import type { User, AuthResponse, LoginPayload, RegisterPayload } from "@/types/api"
// ─── CSRF Helper ──────────────────────────────────────────────────────────────

function getCsrfToken(): string {
  const value = `; ${document.cookie}`
  const parts = value.split(`; csrftoken=`)
  const token = parts.length === 2 ? (parts.pop()?.split(';').shift() ?? '') : ''
  return token
}
// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  isLoading: boolean   // true while checking existing session on mount
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false }
    case "LOGOUT":
      return { user: null, isAuthenticated: false, isLoading: false }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login:    (payload: LoginPayload)    => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout:   ()                         => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,   // start true — we check for existing session first
    isAuthenticated: false,
  })

  // On mount: always ask the server for the current session (cookie-based SSO)
  useEffect(() => {
    api.get<User>("/auth/me/")
      .then((user) => dispatch({ type: "SET_USER", payload: user }))
      .catch(() => {
        // No session — clear any client tokens and stop loading
        tokenStorage.clear()
        dispatch({ type: "SET_LOADING", payload: false })
      })
  }, [])

  // Listen for the auth:logout event fired by the API client when refresh fails
  useEffect(() => {
    const handler = () => dispatch({ type: "LOGOUT" })
    window.addEventListener("auth:logout", handler)
    return () => window.removeEventListener("auth:logout", handler)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await api.post<AuthResponse>("/auth/login/", payload)
    tokenStorage.setTokens(res.tokens)
    dispatch({ type: "SET_USER", payload: res.user })
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>("/auth/register/", payload)
    tokenStorage.setTokens(res.tokens)
    dispatch({ type: "SET_USER", payload: res.user })
  }, [])

  const logout = useCallback(async () => {
    try {
      const csrfToken = getCsrfToken()
      const result = await api.post("/auth/logout/", {}, {
        headers: { 'X-CSRFToken': csrfToken },
      })
      
    } catch (err) {
      console.error('[Logout] Error during logout:', err)
      // ignore network errors — still clear client state
    }

    console.log('[Logout] Clearing local state')
    tokenStorage.clear()
    dispatch({ type: "LOGOUT" })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
