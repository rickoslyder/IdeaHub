import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Define the User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    clerkId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    tableName: "users",
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default User;
