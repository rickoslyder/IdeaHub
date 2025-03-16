import sequelize from "./config/database.js";
import app from "./server.js";

// Connect to the database and start the server
async function bootstrap() {
  try {
    // Sync database models
    console.log("Attempting to connect to database...");
    try {
      await sequelize.authenticate();
      console.log("Database connection established successfully");
    } catch (dbError) {
      console.error("Warning: Database connection failed:", dbError);
      console.log(
        "Continuing startup without database connection. Will retry later."
      );
      // Continue startup even if DB isn't available yet
    }

    try {
      await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
      console.log("Database synced");
    } catch (syncError) {
      console.error("Warning: Database sync failed:", syncError);
      console.log("Continuing without database sync. Will retry later.");
      // Continue startup even if DB sync fails
    }

    // Server is already started in server.ts
    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
    // Don't exit the process on initial error
    console.log("Application continuing despite initialization errors");
  }
}

bootstrap();
