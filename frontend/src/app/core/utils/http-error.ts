import { HttpErrorResponse } from '@angular/common/http';

// FastAPI error payloads use { detail: string } for custom errors and
// { detail: [{ msg: string, ... }] } for Pydantic validation errors.
export function extractErrorMessage(
  err: HttpErrorResponse,
  fallback: string,
  messageMap: Record<string, string> = {}
): string {
  if (err.status === 0) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  const detail = err.error?.detail;
  const message = typeof detail === 'string' ? detail
    : Array.isArray(detail) && typeof detail[0]?.msg === 'string' ? detail[0].msg
    : undefined;

  if (!message) return fallback;
  return messageMap[message] ?? message;
}