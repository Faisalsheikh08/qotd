// src/lib/db/connection.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
let isConnected = false; // Track the connection status

const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect("mongodb://localhost:27017/qotd-3", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default connectDB;
