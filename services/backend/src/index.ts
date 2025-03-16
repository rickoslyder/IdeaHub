import sequelize from "./config/database.js";
import app from "./server.js";

// Set port from environment or default
const PORT = process.env.PORT || 3000;

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

    // Explicitly start server
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT} and bound to 0.0.0.0`);
      console.log(`Server listening at http://0.0.0.0:${PORT}`);
    });

    // Log server address information for debugging
    setTimeout(() => {
      // Check the server address
      const serverAddress = server.address();
      if (serverAddress && typeof serverAddress !== "string") {
        console.log(
          `Server address info - Port: ${serverAddress.port}, Address: ${serverAddress.address}, Family: ${serverAddress.family}`
        );
      } else {
        console.log(`Server address: ${serverAddress}`);
      }
    }, 1000);

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
    // Don't exit the process on initial error
    console.log("Application continuing despite initialization errors");
  }
}

bootstrap();
