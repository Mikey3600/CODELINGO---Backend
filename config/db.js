import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables");
}

let cached = global._mongo;

export default async function connectDB() {
  if (cached && cached.conn) return cached.conn;

  if (!cached) cached = global._mongo = { conn: null, promise: null };

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      // options are optional for modern drivers
    }).then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  console.log("MongoDB Connected:", cached.conn.host);
  return cached.conn;
}
