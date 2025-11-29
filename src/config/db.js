
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(" MONGO_URI is missing in .env file");
    }

    
    await mongoose.connect(process.env.MONGO_URI);

    console.log(" MongoDB Connected Successfully");
  } catch (err) {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  }

  
  mongoose.connection.on("disconnected", () => {
    console.log(" MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error(" MongoDB error:", err.message);
  });
};

export default connectDB;

