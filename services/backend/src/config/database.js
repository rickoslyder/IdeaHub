import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Debug logs for database configuration
console.log("Starting database configuration");
console.log(`DATABASE_URL exists: ${Boolean(process.env.DATABASE_URL)}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set"}`);

// If DATABASE_URL exists, sanitize it for logging (hide password)
if (process.env.DATABASE_URL) {
  const sanitizedDbUrl = process.env.DATABASE_URL.replace(
    /(postgres:\/\/[^:]+:)([^@]+)(@.+)/,
    "$1*****$3"
  );
  console.log(`Using DATABASE_URL: ${sanitizedDbUrl}`);
}

// Also check for Render-specific internal URL
if (process.env.RENDER_DB_SERVICE_INTERNAL_DB_URL) {
  const sanitizedInternalUrl =
    process.env.RENDER_DB_SERVICE_INTERNAL_DB_URL.replace(
      /(postgres:\/\/[^:]+:)([^@]+)(@.+)/,
      "$1*****$3"
    );
  console.log(
    `RENDER_DB_SERVICE_INTERNAL_DB_URL exists: ${sanitizedInternalUrl}`
  );
}

// Check each individual database config component
if (process.env.RENDER_DB_SERVICE_HOSTNAME) {
  console.log(
    `RENDER_DB_SERVICE_HOSTNAME: ${process.env.RENDER_DB_SERVICE_HOSTNAME}`
  );
  console.log(`RENDER_DB_SERVICE_PORT: ${process.env.RENDER_DB_SERVICE_PORT}`);
  console.log(`RENDER_DB_SERVICE_USER: ${process.env.RENDER_DB_SERVICE_USER}`);
  console.log(
    `RENDER_DB_SERVICE_DATABASE: ${process.env.RENDER_DB_SERVICE_DATABASE}`
  );
  console.log(
    `RENDER_DB_SERVICE_PASSWORD exists: ${Boolean(process.env.RENDER_DB_SERVICE_PASSWORD)}`
  );
}

// Database configuration
let sequelize;

// First, try the Render DATABASE_URL
if (process.env.DATABASE_URL) {
  console.log(
    "Using DATABASE_URL environment variable for database connection"
  );
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
    models: [__dirname + "/../models"],
  });
  // Then, try the explicit Render internal URL
} else if (process.env.RENDER_DB_SERVICE_INTERNAL_DB_URL) {
  console.log(
    "Using RENDER_DB_SERVICE_INTERNAL_DB_URL for database connection"
  );
  sequelize = new Sequelize(process.env.RENDER_DB_SERVICE_INTERNAL_DB_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
    models: [__dirname + "/../models"],
  });
  // Finally, try to build a connection string from individual components
} else if (
  process.env.RENDER_DB_SERVICE_HOSTNAME &&
  process.env.RENDER_DB_SERVICE_PORT &&
  process.env.RENDER_DB_SERVICE_USER &&
  process.env.RENDER_DB_SERVICE_PASSWORD &&
  process.env.RENDER_DB_SERVICE_DATABASE
) {
  console.log(
    "Building database connection from individual environment variables"
  );
  const connectionString = `postgresql://${process.env.RENDER_DB_SERVICE_USER}:${
    process.env.RENDER_DB_SERVICE_PASSWORD
  }@${process.env.RENDER_DB_SERVICE_HOSTNAME}:${
    process.env.RENDER_DB_SERVICE_PORT
  }/${process.env.RENDER_DB_SERVICE_DATABASE}`;

  sequelize = new Sequelize(connectionString, {
    dialect: "postgres",
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
    models: [__dirname + "/../models"],
  });
  // Fall back to local development database
} else {
  console.log(
    "No database connection details found in environment, using local development configuration"
  );
  sequelize = new Sequelize("postgres", "postgres", "postgres", {
    host: "localhost",
    dialect: "postgres",
    logging: false,
    models: [__dirname + "/../models"],
  });
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
