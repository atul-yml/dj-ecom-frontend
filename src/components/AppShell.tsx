import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/store/auth"

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isDashboard = location.pathname === "/"

  async function handleLogout() {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:text-neutral-900"
          >
            Dashboard
          </button>
          {!isDashboard && (
            <span className="text-sm text-neutral-400">Back to dashboard</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-neutral-500 sm:inline">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}