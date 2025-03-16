import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration
let sequelize;

console.log("Database configuration starting...");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Check if Render's DATABASE_URL is available
if (process.env.DATABASE_URL) {
  console.log("Using Render PostgreSQL database with DATABASE_URL");

  // Log a sanitized version of the URL (hiding credentials)
  try {
    const dbUrlObj = new URL(process.env.DATABASE_URL);
    console.log(
      `Database host: ${dbUrlObj.hostname}, database name: ${dbUrlObj.pathname.substring(1)}`
    );
  } catch (e) {
    console.log("Could not parse DATABASE_URL");
  }

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
} else if (process.env.RENDER_DB_SERVICE_INTERNAL_DB_URL) {
  // Fallback to the explicit RENDER_DB_SERVICE_INTERNAL_DB_URL from .env if DATABASE_URL isn't set
  console.log("Falling back to RENDER_DB_SERVICE_INTERNAL_DB_URL");

  // Use the explicit Render URL from .env
  sequelize = new Sequelize(process.env.RENDER_DB_SERVICE_INTERNAL_DB_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
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
