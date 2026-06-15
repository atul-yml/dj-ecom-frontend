/**
 * src/pages/ProductsPage.tsx
 *
 * Demonstrates:
 * - useProducts() hook (paginated Django list response)
 * - Decimal price handling (string → display)
 * - useCreateOrder() mutation
 * - useAuth().logout()
 */

import { useState } from "react"
import { useAuth } from "@/store/auth"
import { useProducts, useCreateOrder } from "@/hooks/useApi"
import { getErrorMessage } from "@/lib/errors"
import type { UUID } from "@/types/api"

export default function ProductsPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useProducts()

  // Simple cart: { productId → quantity }
  const [cart, setCart] = useState<Record<UUID, number>>({})
  const [orderSuccess, setOrderSuccess] = useState(false)
  const { mutate: createOrder, isLoading: ordering, error: orderError } = useCreateOrder()

  function addToCart(productId: UUID) {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }))
  }

  function removeFromCart(productId: UUID) {
    setCart((prev) => {
      const next = { ...prev }
      if ((next[productId] ?? 0) <= 1) delete next[productId]
      else next[productId]--
      return next
    })
  }

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0)

  async function handlePlaceOrder() {
    const items = Object.entries(cart).map(([product_id, quantity]) => ({
      product_id,
      quantity,
    }))
    await createOrder({ items })
    setCart({})
    setOrderSuccess(true)
    setTimeout(() => setOrderSuccess(false), 4000)
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
          <p className="mt-1 text-sm text-neutral-500">Browse the current catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-500 sm:inline">{user?.email}</span>
          {cartItemCount > 0 && (
            <button
              onClick={handlePlaceOrder}
              disabled={ordering}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {ordering ? "Placing…" : `Place order (${cartItemCount})`}
            </button>
          )}
        </div>
      </div>

      {orderSuccess && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200">
          Order placed successfully!
        </div>
      )}
      {orderError && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {getErrorMessage(orderError)}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900" />
        </div>
      )}

      {error && (
        <p className="py-10 text-center text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}

      {data && (
        <>
          <p className="mb-4 text-sm text-neutral-500">{data.count} products</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.results.map((product) => {
              const qty = cart[product.id] ?? 0
              return (
                <div
                  key={product.id}
                  className="rounded-2xl bg-white p-5 ring-1 ring-neutral-200"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium text-neutral-900">{product.name}</h2>
                      {product.category && (
                        <span className="text-xs text-neutral-400">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-neutral-900">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </span>
                  </div>

                  {product.description && (
                    <p className="mb-3 text-sm text-neutral-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${product.in_stock ? "text-green-600" : "text-red-500"}`}
                    >
                      {product.in_stock ? `${product.stock} in stock` : "Out of stock"}
                    </span>

                    {product.in_stock && (
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-sm hover:bg-neutral-200"
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-sm font-medium">
                              {qty}
                            </span>
                          </>
                        )}
                        <button
                          onClick={() => addToCart(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-sm text-white hover:bg-neutral-700"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {data.next && (
            <p className="mt-6 text-center text-sm text-neutral-400">
              Showing {data.results.length} of {data.count} — pagination available via{" "}
              <code className="text-xs">?page=2</code>
            </p>
          )}
        </>
      )}
    </main>
  )
}
