// ESM wrapper for CommonJS compatibility
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Create __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up require for CommonJS modules
const require = createRequire(import.meta.url);

console.log("Starting worker service...");
console.log("NODE_ENV:", process.env.NODE_ENV);

// Manually set up database connection instead of using models directly
// This avoids the circular dependency issues
const { Sequelize } = require("sequelize");

// Database connection logic
console.log("Starting database configuration");

let dbConfig = {};
let sequelize = null;

try {
  // Check which db connection method to use
  if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL exists: true");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log(
      "Using DATABASE_URL:",
      process.env.DATABASE_URL.replace(/:[^:]*@/, ":****@")
    );

    // Use DATABASE_URL for connection
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: process.env.NODE_ENV === "production" ? false : console.log,
      dialectOptions: {
        ssl:
          process.env.NODE_ENV === "production"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },
    });
  } else {
    // Fallback to individual connection parameters
    console.log("Using individual connection parameters");

    const host = process.env.RENDER_DB_SERVICE_HOSTNAME || "localhost";
    const port = process.env.RENDER_DB_SERVICE_PORT || 5432;
    const username = process.env.RENDER_DB_SERVICE_USER || "postgres";
    const password = process.env.RENDER_DB_SERVICE_PASSWORD || "postgres";
    const database = process.env.RENDER_DB_SERVICE_DATABASE || "idea_hub_db";

    sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: "postgres",
      logging: process.env.NODE_ENV === "production" ? false : console.log,
      dialectOptions: {
        ssl:
          process.env.NODE_ENV === "production"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },
    });
  }

  // Test the connection
  await sequelize.authenticate();
  console.log("Database connection established successfully.");

  // Define a simplified worker process
  const runWorker = async () => {
    try {
      console.log("Worker started. Processing tasks...");

      // For now, just log a message every 30 seconds
      // In the future, this would handle background tasks
      setInterval(() => {
        console.log(
          "Worker heartbeat. Still running at:",
          new Date().toISOString()
        );
      }, 30000);
    } catch (error) {
      console.error("Error in worker process:", error);
    }
  };

  // Start the worker
  runWorker();
} catch (error) {
  console.error("Unable to connect to the database:", error);
}
