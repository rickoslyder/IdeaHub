import { DevelopmentType } from "../enums/index.js";
/**
 * Interface representing a Development in the Idea Hub system
 */
export interface Development {
    id: string;
    title: string;
    content: string;
    type: DevelopmentType;
    source?: string;
    sourceUrl?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
/**
 * Interface for creating a new development
 */
export interface CreateDevelopmentInput {
    title: string;
    content: string;
    type: DevelopmentType;
    source?: string;
    sourceUrl?: string;
    tags?: string[];
}
/**
 * Interface for updating an existing development
 */
export interface UpdateDevelopmentInput {
    title?: string;
    content?: string;
    type?: DevelopmentType;
    source?: string;
    sourceUrl?: string;
    tags?: string[];
}
