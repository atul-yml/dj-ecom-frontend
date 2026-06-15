// src/components/TenantUserTable.tsx

import type { TenantUser } from "../types/tenantUser";

interface TenantUserTableProps {
  users: TenantUser[];
}

export default function TenantUserTable({ users }: TenantUserTableProps) {
  if (!users || users.length === 0) {
    return (
      <p className="text-gray-500 py-8 text-center">
        No tenant users found. Try syncing first.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Job Title</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Department</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.azure_id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-400">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {user.display_name}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {user.email || user.user_principal_name}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {user.job_title || "-"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {user.department || "-"}
              </td>
              <td className="px-4 py-3">
                {user.is_account_enabled ? (
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700">
                    Disabled
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}