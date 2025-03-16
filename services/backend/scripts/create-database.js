import { Client } from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function createDatabase() {
  // Connection config for the default "postgres" database
  const defaultConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres", // Connect to the default postgres database
  };

  const targetDatabase = process.env.DB_NAME || "ideahub";

  // Create the client to connect to the default database
  const client = new Client(defaultConfig);

  try {
    await client.connect();
    console.log("Connected to PostgreSQL server");

    // Check if the database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDatabase]
    );

    if (result.rows.length === 0) {
      console.log(`Database ${targetDatabase} does not exist, creating it now`);
      // Create the database
      await client.query(`CREATE DATABASE ${targetDatabase}`);
      console.log(`Database ${targetDatabase} created successfully`);
    } else {
      console.log(`Database ${targetDatabase} already exists`);
    }
  } catch (error) {
    console.error("Error creating database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the function
createDatabase();
