// For now, we'll create dummy model exports until we can properly build the TypeScript code
// This is just to test the routes

import User from "./user.model.js";
import Project from "./project.model.js";
import Development from "./development.model.js";
import sequelize from "../config/database.js";

// Define associations
User.hasMany(Project, { foreignKey: "userId" });
Project.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Development, { foreignKey: "userId" });
Development.belongsTo(User, { foreignKey: "userId" });

// Export the models
export { User, Project, Development };

// Export the sequelize instance
export { sequelize };

// Export a function to initialize the database
export const initDatabase = async (force = false) => {
  try {
    // Sync all models with the database
    // 'force: true' will drop the table if it already exists
    // 'alter: true' will alter the table if it already exists
    // Use force only in development/testing environments!
    await sequelize.sync({ force, alter: !force });
    console.log("Database synchronized successfully");
    return true;
  } catch (error) {
    console.error("Error synchronizing database:", error);
    return false;
  }
};
