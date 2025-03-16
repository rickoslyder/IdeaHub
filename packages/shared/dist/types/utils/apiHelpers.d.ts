import { ApiResponse } from "../types/ApiResponse.js";
/**
 * Create a successful API response
 */
export declare function createSuccessResponse<T>(data: T, meta?: ApiResponse["meta"]): ApiResponse<T>;
/**
 * Create an error API response
 */
export declare function createErrorResponse(error: string): ApiResponse;
