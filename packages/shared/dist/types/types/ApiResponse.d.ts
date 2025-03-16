/**
 * Standard API Response interface for consistency across all endpoints
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}
