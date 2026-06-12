/**
 * src/lib/errors.ts
 *
 * Helpers for working with Django's error shape:
 * { error: { code, message, details: { field: string[] } } }
 */

import type { ApiError } from "@/types/api"

/** Pull a human-readable message out of any thrown value */
export function getErrorMessage(err: unknown): string {
  if (isApiError(err)) return err.error.message
  if (err instanceof Error) return err.message
  return "Something went wrong"
}

/** Get field-level errors as a flat { field: firstMessage } map.
 *  Use this to populate form error states.
 *  e.g. { email: "Already in use.", password: "Too short." }
 */
export function getFieldErrors(err: unknown): Record<string, string> {
  if (!isApiError(err)) return {}
  const details = err.error.details
  return Object.fromEntries(
    Object.entries(details).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages[0] : String(messages),
    ])
  )
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "error" in err &&
    typeof (err as ApiError).error?.message === "string"
  )
}
