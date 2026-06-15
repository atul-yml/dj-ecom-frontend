
import type {
  TenantUserListResponse,
  SyncResponse,
  FetchOptions,
} from "../types/tenantUser";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getCsrfToken(): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  return parts.length === 2 ? (parts.pop()?.split(";").shift() ?? "") : "";
}

export async function fetchTenantUsers(
  options: FetchOptions = {}
): Promise<TenantUserListResponse> {
  const { includeDisabled = false } = options;
  const params = includeDisabled ? "?include_disabled=true" : "";

  const response = await fetch(`${BASE_URL}/auth/tenant-users/${params}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tenant users: ${response.status}`);
  }

  return response.json();
}

export async function syncTenantUsers(): Promise<SyncResponse> {
  const csrfToken = getCsrfToken();

  const response = await fetch(`${BASE_URL}/auth/tenant-users/sync/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  return response.json();
}