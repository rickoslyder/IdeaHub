import { Request, Response } from "express";
import { Project } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

// Get all projects
export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const projects = await Project.findAll();
    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
    });
  }
};

// Get a single project by ID
export const getProjectById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch project",
    });
  }
};

// Create a new project
export const createProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, description, status, tags, githubRepoUrl, localFolderPath } =
      req.body;

    // Basic validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: "Name and description are required",
      });
    }

    // For now, we'll hardcode the userId until we implement authentication
    const userId = "00000000-0000-0000-0000-000000000000";

    const project = await Project.create({
      id: uuidv4(),
      userId,
      name,
      description,
      status: status || "in progress",
      tags: tags || [],
      githubRepoUrl,
      localFolderPath,
    });

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create project",
    });
  }
};

// Update a project
export const updateProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      tags,
      githubRepoUrl,
      localFolderPath,
      documentation,
      lastSynced,
    } = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Update project fields
    await project.update({
      name: name || project.name,
      description: description || project.description,
      status: status || project.status,
      tags: tags || project.tags,
      githubRepoUrl:
        githubRepoUrl !== undefined ? githubRepoUrl : project.githubRepoUrl,
      localFolderPath:
        localFolderPath !== undefined
          ? localFolderPath
          : project.localFolderPath,
      documentation:
        documentation !== undefined ? documentation : project.documentation,
      lastSynced: lastSynced !== undefined ? lastSynced : project.lastSynced,
    });

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update project",
    });
  }
};

// Delete a project
export const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    await project.destroy();

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete project",
    });
  }
};
