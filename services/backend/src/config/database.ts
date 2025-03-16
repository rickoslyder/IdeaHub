import { Sequelize } from "sequelize-typescript";
import { User, Project, Development } from "../models/index.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize database connection
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ideahub",
  logging: false,
  models: [User, Project, Development], // Add all models here
});

export default sequelize;
