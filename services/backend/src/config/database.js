import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration
let sequelize;

// Check if Render's DATABASE_URL is available
if (process.env.DATABASE_URL) {
  console.log("Using Render PostgreSQL database");
  // Use Render's DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Needed for Render PostgreSQL
      },
    },
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  });
} else {
  console.log("Using local PostgreSQL database");
  // Use local database config
  sequelize = new Sequelize(
    process.env.DB_NAME || "ideahub",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "postgres",
    {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432", 10),
      dialect: "postgres",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: process.env.NODE_ENV === "development" ? console.log : false,
    }
  );
}

// Test the database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
};

export default sequelize;
