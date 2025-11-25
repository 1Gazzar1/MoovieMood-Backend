// src/db/db.ts
import { configDotenv } from "dotenv";
import mongoose from "mongoose";

configDotenv();

const DB_URL = process.env.DATABASE_URL;
export async function connectDB() {
    try {
        // Connect and store the connection
        await mongoose.connect(DB_URL);
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // optional: exit if DB fails to connect
    }
}
