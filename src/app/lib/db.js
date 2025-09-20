import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  try {
    cached.conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
