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
export enum ProjectStatus {
  IN_PROGRESS = "in progress",
  COMPLETED = "completed",
  ON_HOLD = "on hold",
}

/**
 * Common interface for API responses
 * @template T The type of data in the response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Version of the shared package
 */
export const VERSION = "1.0.0";
