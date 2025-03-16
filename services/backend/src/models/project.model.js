import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Define Project Status enum values
export const ProjectStatus = {
  IN_PROGRESS: "in progress",
  COMPLETED: "completed",
  ON_HOLD: "on hold",
};

// Define the Project model
const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(Object.values(ProjectStatus)),
      defaultValue: ProjectStatus.IN_PROGRESS,
      allowNull: false,
    },
    githubRepoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    localFolderPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    documentation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    lastSynced: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "projects",
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default Project;
