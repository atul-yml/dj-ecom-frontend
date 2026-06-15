export interface TenantUser {
  id: number;
  azure_id: string;
  display_name: string;
  email: string | null;
  user_principal_name: string;
  job_title: string;
  department: string;
  is_account_enabled: boolean;
  synced_at: string;
}

export interface TenantUserListResponse {
  count: number;
  users: TenantUser[];
}

export interface SyncSummary {
  total: number;
  created: number;
  updated: number;
}

export interface SyncResponse {
  message: string;
  summary: SyncSummary;
}

export interface FetchOptions {
  includeDisabled?: boolean;
}