// src/pages/TenantUsersPage.tsx

import { useState, useEffect, type ChangeEvent } from "react";
import { fetchTenantUsers, syncTenantUsers } from "../lib/tenantUserApi";
import TenantUserTable from "../components/TenantUserTable";
import type { TenantUser } from "../types/tenantUser";

export default function TenantUsersPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [includeDisabled, setIncludeDisabled] = useState<boolean>(false);

  useEffect(() => {
    loadUsers();
  }, [includeDisabled]);

  async function loadUsers(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTenantUsers({ includeDisabled });
      setUsers(data.users);
      setCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(): Promise<void> {
    setSyncing(true);
    setError(null);

    try {
      const result = await syncTenantUsers();
      alert(
        `Sync complete: ${result.summary.created} created, ${result.summary.updated} updated, ${result.summary.total} total`
      );
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.display_name.toLowerCase().includes(term) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.department && user.department.toLowerCase().includes(term)) ||
      (user.job_title && user.job_title.toLowerCase().includes(term))
    );
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            All Tenant Users
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {count} users in the current tenant.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {syncing ? "Syncing..." : "Sync from Azure AD"}
        </button>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-lg
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setIncludeDisabled(e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show disabled accounts
          </label>
        </div>

        {searchTerm && (
          <p className="mt-3 text-sm text-gray-500">
            Showing {filteredUsers.length} of {count} users
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading users...</p>
      ) : (
        <TenantUserTable users={filteredUsers} />
      )}
    </main>
  );
}