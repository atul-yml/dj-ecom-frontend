/**
 * src/hooks/useApi.ts
 *
 * Generic data-fetching hook + domain-specific hooks for products and orders.
 * Pattern: one generic hook that handles loading/error/data state,
 * then thin wrappers per endpoint.
 *
 * If you add React Query later, replace useQuery() here — the calling code
 * in your components won't change.
 */

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import type {
  PaginatedResponse,
  Product,
  Order,
  CreateOrderPayload,
  ApiError,
} from "@/types/api"

// ─── Generic hook ─────────────────────────────────────────────────────────────

interface UseQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: ApiError | null
  refetch: () => void
}

export function useQuery<T>(url: string | null): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!url) return
    let cancelled = false

    setIsLoading(true)
    setError(null)

    api.get<T>(url)
      .then((res) => { if (!cancelled) setData(res) })
      .catch((err) => { if (!cancelled) setError(err as ApiError) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [url, tick])

  return { data, isLoading, error, refetch }
}

// ─── Mutation hook ────────────────────────────────────────────────────────────
// For POST/PATCH/DELETE — call mutate() manually, not on mount.

interface UseMutationResult<TData, TPayload> {
  mutate: (payload: TPayload) => Promise<TData>
  isLoading: boolean
  error: ApiError | null
  reset: () => void
}

export function useMutation<TData, TPayload>(
  fn: (payload: TPayload) => Promise<TData>
): UseMutationResult<TData, TPayload> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(async (payload: TPayload): Promise<TData> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fn(payload)
      return res
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fn])

  const reset = useCallback(() => setError(null), [])

  return { mutate, isLoading, error, reset }
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function useProducts(categorySlug?: string) {
  const url = categorySlug
    ? `/products/?category=${categorySlug}`
    : "/products/"

  return useQuery<PaginatedResponse<Product>>(url)
}

export function useProduct(id: string | null) {
  return useQuery<Product>(id ? `/products/${id}/` : null)
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useOrders() {
  return useQuery<PaginatedResponse<Order>>("/orders/")
}

export function useOrder(id: string | null) {
  return useQuery<Order>(id ? `/orders/${id}/` : null)
}

export function useCreateOrder() {
  return useMutation<Order, CreateOrderPayload>((payload) =>
    api.post<Order>("/orders/", payload)
  )
}
