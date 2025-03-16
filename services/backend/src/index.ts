import sequelize from "./config/database.js";
import app from "./server.js";

// Connect to the database and start the server
async function bootstrap() {
  try {
    // Sync database models
    await sequelize.authenticate();
    console.log("Database connection established successfully");

    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("Database synced");

    // Server is already started in server.ts
    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
    process.exit(1);
  }
}

bootstrap();
