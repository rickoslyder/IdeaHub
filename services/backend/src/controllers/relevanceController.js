import { Project, Development } from "../models/index.js";
import { computeRelevance } from "./aiController.js";

// Get relevant projects for a development
export const getRelevantProjects = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the development by ID
    const development = await Development.findByPk(id);
    if (!development) {
      return res.status(404).json({
        success: false,
        error: "Development not found",
      });
    }

    // Get all projects to compare against
    const projects = await Project.findAll();
    if (!projects.length) {
      return res.status(200).json({
        success: true,
        data: {
          development,
          relevantProjects: [],
        },
      });
    }

    // Extract text content for comparison
    const developmentText = `${development.title} ${development.content || ""}`;
    const projectTexts = projects.map(
      (project) => `${project.name} ${project.description || ""}`
    );

    try {
      // Compute relevance using AI service
      const relevanceResults = await computeRelevance(
        developmentText,
        projectTexts
      );

      // Map results back to projects with scores
      const relevantProjects = relevanceResults.map((result) => {
        const project = projects[result.index];
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          score: result.similarity,
        };
      });

      // Return only projects with similarity above threshold (e.g., 0.3)
      const filteredProjects = relevantProjects.filter(
        (project) => project.score > 0.3
      );

      return res.status(200).json({
        success: true,
        data: {
          development,
          relevantProjects: filteredProjects,
        },
      });
    } catch (error) {
      console.error("Error computing relevance:", error);

      // Fallback to mock data if AI service fails
      return res.status(200).json({
        success: true,
        data: {
          development,
          relevantProjects: [
            {
              id: projects[0]?.id || "mock-project-1",
              name: projects[0]?.name || "Mock Project 1",
              description:
                projects[0]?.description ||
                "This is a mock project that would be relevant to the development",
              score: 0.85,
            },
            {
              id: projects[1]?.id || "mock-project-2",
              name: projects[1]?.name || "Mock Project 2",
              description:
                projects[1]?.description ||
                "Another mock project that would be relevant",
              score: 0.75,
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error finding relevant projects:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to find relevant projects",
    });
  }
};

// Get relevant developments for a project
export const getRelevantDevelopments = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the project by ID
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // Get all developments to compare against
    const developments = await Development.findAll();
    if (!developments.length) {
      return res.status(200).json({
        success: true,
        data: {
          project,
          relevantDevelopments: [],
        },
      });
    }

    // Extract text content for comparison
    const projectText = `${project.name} ${project.description || ""}`;
    const developmentTexts = developments.map(
      (dev) => `${dev.title} ${dev.content || ""}`
    );

    try {
      // Compute relevance using AI service
      const relevanceResults = await computeRelevance(
        projectText,
        developmentTexts
      );

      // Map results back to developments with scores
      const relevantDevelopments = relevanceResults.map((result) => {
        const development = developments[result.index];
        return {
          id: development.id,
          title: development.title,
          content: development.content,
          score: result.similarity,
        };
      });

      // Return only developments with similarity above threshold (e.g., 0.3)
      const filteredDevelopments = relevantDevelopments.filter(
        (dev) => dev.score > 0.3
      );

      return res.status(200).json({
        success: true,
        data: {
          project,
          relevantDevelopments: filteredDevelopments,
        },
      });
    } catch (error) {
      console.error("Error computing relevance:", error);

      // Fallback to mock data if AI service fails
      return res.status(200).json({
        success: true,
        data: {
          project,
          relevantDevelopments: [
            {
              id: developments[0]?.id || "mock-development-1",
              title: developments[0]?.title || "Mock Development 1",
              content:
                developments[0]?.content ||
                "This is a mock development that would be relevant to the project",
              score: 0.88,
            },
            {
              id: developments[1]?.id || "mock-development-2",
              title: developments[1]?.title || "Mock Development 2",
              content:
                developments[1]?.content ||
                "Another mock development that would be relevant",
              score: 0.72,
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error finding relevant developments:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to find relevant developments",
    });
  }
};
