import { ApiResponse } from "../types/ApiResponse.js";

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse["meta"]
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
  };
}
