import { ProjectStatus } from "../index.js";
/**
 * Interface representing a Project in the Idea Hub system
 */
export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    githubRepoUrl?: string;
    localFolderPath?: string;
    documentation?: string;
    tags: string[];
    lastSynced?: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Interface for creating a new project (subset of fields required)
 */
export interface CreateProjectInput {
    name: string;
    description: string;
    status: ProjectStatus;
    tags?: string[];
    githubRepoUrl?: string;
    localFolderPath?: string;
}
/**
 * Interface for updating an existing project (all fields optional)
 */
export interface UpdateProjectInput {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    tags?: string[];
    githubRepoUrl?: string;
    localFolderPath?: string;
    documentation?: string;
    lastSynced?: string;
}
