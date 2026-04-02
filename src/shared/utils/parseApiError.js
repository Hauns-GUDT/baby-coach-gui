/**
 * Parses an axios error response into a structured error object.
 *
 * Returns one of:
 *   { fieldErrors: { [field]: code } }  — for validation errors (400 with errors array)
 *   { code: string }                    — for business logic errors (single error code)
 *   {}                                  — if the error format is unrecognized
 */
export function parseApiError(error) {
  const data = error?.response?.data;
  if (!data) return {};

  // Validation errors: array of { field, code } from NestJS ValidationPipe
  if (Array.isArray(data.errors)) {
    const fieldErrors = {};
    for (const { field, code } of data.errors) {
      if (field && code) fieldErrors[field] = code;
    }
    return { fieldErrors };
  }

  // Business logic error: single error code
  if (data.code) {
    return { code: data.code };
  }

  return {};
}
