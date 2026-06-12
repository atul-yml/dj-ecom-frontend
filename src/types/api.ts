// ─── Primitives ──────────────────────────────────────────────────────────────
// Django UUIDs come as plain strings in JSON
// Django DecimalField comes as string ("299.99") not number — intentional, floats lose precision
// Always use parseFloat(price).toFixed(2) when displaying, or use decimal.js for math

export type UUID = string
export type ISODateString = string
export type DecimalString = string  // e.g. "299.99"

// ─── Pagination ───────────────────────────────────────────────────────────────
// Every Django list endpoint returns this shape (StandardPagination in common/pagination.py)

export interface PaginatedResponse<T> {
  count: number         // total items across all pages
  next: string | null   // full URL to next page, null if last page
  previous: string | null
  results: T[]
}

// ─── Error ───────────────────────────────────────────────────────────────────
// Every error from Django comes in this shape (common/exceptions.py)
// code = machine-readable string e.g. "validation_error", "not_found", "authentication_failed"
// details = field-level errors for forms e.g. { email: ["Already in use."] }

export interface ApiError {
  error: {
    code: string
    message: string
    details: Record<string, string[]> | Record<string, unknown>
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: UUID
  email: string
  full_name: string
  phone: string
  created_at: ISODateString
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Category {
  id: UUID
  name: string
  slug: string
}

export interface Product {
  id: UUID
  name: string
  description: string
  price: DecimalString   // ← comes as "299.99", not 299.99
  stock: number
  in_stock: boolean      // computed @property on Django model
  category: Category | null
  is_active: boolean
  created_at: ISODateString
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export interface OrderItem {
  id: UUID
  product: UUID
  product_name: string
  quantity: number
  unit_price: DecimalString
  subtotal: DecimalString
}

export interface Order {
  id: UUID
  status: OrderStatus
  total: DecimalString
  notes: string
  items: OrderItem[]
  created_at: ISODateString
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface CreateOrderPayload {
  items: { product_id: UUID; quantity: number }[]
  notes?: string
}
