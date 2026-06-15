import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface MenuItem {
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  available: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: "Tenant Users",
    description: "View and sync all Azure AD tenant users from your organisation.",
    path: "/users",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    available: true,
  },
  {
    title: "Products",
    description: "Browse, manage, and update your product catalogue.",
    path: "/products",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
    available: true,
  },
  {
    title: "Orders",
    description: "Track, manage, and review all customer orders.",
    path: "/orders",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
    available: false,
  },
  {
    title: "Analytics",
    description: "View sales insights, trends, and performance metrics.",
    path: "/analytics",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    available: false,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Welcome back. Choose where you want to go.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => item.available && navigate(item.path)}
              disabled={!item.available}
              className={`
                relative flex flex-col items-start gap-4 p-6 rounded-lg border
                text-left transition-all duration-200
                ${
                  item.available
                    ? "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer"
                    : "bg-gray-50 border-dashed border-gray-300 cursor-not-allowed opacity-70"
                }
              `}
            >
              {!item.available && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              )}

              <div
                className={`p-3 rounded-lg ${
                  item.available
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {item.icon}
              </div>

              <div>
                <h2
                  className={`text-lg font-semibold ${
                    item.available ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {item.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              </div>
            </button>
          ))}
      </div>
    </main>
  );
}