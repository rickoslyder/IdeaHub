import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Define Development Type enum values
export const DevelopmentType = {
  ARTICLE: "ARTICLE",
  LIBRARY: "LIBRARY",
  FRAMEWORK: "FRAMEWORK",
  TOOL: "TOOL",
  TECHNIQUE: "TECHNIQUE",
  API: "API",
  CONCEPT: "CONCEPT",
  OTHER: "OTHER",
};

// Define the Development model
const Development = sequelize.define(
  "Development",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(Object.values(DevelopmentType)),
      defaultValue: DevelopmentType.OTHER,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sourceUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    tableName: "developments",
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default Development;
