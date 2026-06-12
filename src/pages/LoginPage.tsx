import { useState, type FormEvent } from "react"
import { useAuth } from "@/store/auth"
import { getErrorMessage, getFieldErrors } from "@/lib/errors"

type Mode = "login" | "register"

export default function AuthPage() {
  const { login, register } = useAuth()

  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function switchMode(next: Mode) {
    setMode(next)
    setGlobalError("")
    setFieldErrors({})
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setGlobalError("")
    setFieldErrors({})
    setIsLoading(true)

    try {
      if (mode === "login") {
        await login({ email, password })
      } else {
        await register({ email, password, full_name: fullName })
      }
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setGlobalError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  function handleAzureLogin() {
    setGlobalError("")
    setIsLoading(true)

    const redirectUrl = import.meta.env.VITE_AZURE_LOGIN_URL
      || `${import.meta.env.VITE_API_URL}/auth/azure/login/`

    window.location.href = redirectUrl
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">

        {/* Toggle */}
        <div className="mb-6 flex rounded-lg bg-neutral-100 p-1">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${mode === m
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
                }`}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full name — only in register mode */}
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                required
              />
              {fieldErrors.full_name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "Min. 8 characters" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              required
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {globalError && !fieldErrors.email && !fieldErrors.password && !fieldErrors.full_name && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {globalError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {isLoading
              ? mode === "login" ? "Signing in…" : "Creating account…"
              : mode === "login" ? "Sign in" : "Create account"
            }
          </button>
        </form>

         <div className="my-4 flex items-center gap-2">
          <div className="flex-1 border-t border-neutral-300" />
          <span className="text-xs text-neutral-500">or</span>
          <div className="flex-1 border-t border-neutral-300" />
        </div>

        {/* Azure SSO button */}
        <button
          type="button"
          onClick={handleAzureLogin}
          disabled={isLoading}
          className="w-full rounded-lg border border-neutral-300 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          Sign in with Microsoft (SSO)
        </button>

      </div>
    </div>
  )
}