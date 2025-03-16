import { User, initDatabase } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Initialize the database with seed data
 * @param {boolean} force Whether to force sync the database (drops all tables)
 * @returns {Promise<boolean>} Whether initialization was successful
 */
export const initializeDatabase = async (force = false) => {
  try {
    // Sync database with models
    const dbInitialized = await initDatabase(force);
    if (!dbInitialized) {
      console.error("Failed to initialize database");
      return false;
    }

    // Create default user if it doesn't exist
    const defaultUserEmail = "admin@ideahub.com";
    const existingUser = await User.findOne({
      where: { email: defaultUserEmail },
    });

    if (!existingUser) {
      await User.create({
        id: uuidv4(),
        email: defaultUserEmail,
        clerkId: "default-admin-clerk-id", // Would normally be provided by authentication service
      });
      console.log("Default user created successfully");
    } else {
      console.log("Default user already exists");
    }

    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};
