/**
 * Create a successful API response
 */
export function createSuccessResponse(data, meta) {
    return {
        success: true,
        data,
        ...(meta ? { meta } : {}),
    };
}
/**
 * Create an error API response
 */
export function createErrorResponse(error) {
    return {
        success: false,
        error,
    };
}
//# sourceMappingURL=apiHelpers.js.map