import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ path: "./.env" }); 

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT || 8080}`);
});
