/**
 * @description
 * This is the entry point for the shared package.
 * It exports common types, utilities, and constants used across the Idea Hub application.
 *
 * @notes
 * - This file will be expanded as we add more shared code
 * - All exports should be well-documented with JSDoc comments
 */
// Export enums
export * from "./enums/index.js";
// Export types
export * from "./types/Project.js";
export * from "./types/Development.js";
export * from "./types/ApiResponse.js";
// Export utilities
export * from "./utils/apiHelpers.js";
/**
 * Project status enum representing the possible states of a project
 */
export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["IN_PROGRESS"] = "in progress";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["ON_HOLD"] = "on hold";
})(ProjectStatus || (ProjectStatus = {}));
/**
 * Version of the shared package
 */
export const VERSION = "1.0.0";
//# sourceMappingURL=index.js.map