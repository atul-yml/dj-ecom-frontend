/**
 * src/App.tsx
 *
 * Root component. Wraps everything in AuthProvider.
 * Uses basic conditional rendering for routing — swap for
 * react-router-dom if you need URL-based navigation.
 */

import { AuthProvider, useAuth } from "@/store/auth"
import LoginPage from "@/pages/LoginPage"
import ProductsPage from "@/pages/ProductsPage"

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />
      </div>
    )
  }

  // Swap this for react-router <Routes> when you add more pages
  return isAuthenticated ? <ProductsPage /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
