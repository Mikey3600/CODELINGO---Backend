

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";


import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";  
import tutorRoutes from "./routes/tutorRoutes.js";

import errorHandler from "./middleware/errorhandler.js";

dotenv.config();
connectDB();

const app = express();


app.use((req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  next();
});


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});


app.use(express.json({ limit: "10kb" }));


app.use((req, res, next) => {
  console.log(`  ${req.method} ${req.path}`);
  next();
});


app.get("/", (_req, res) => {
  res.send("Codelingo Backend Running");
});


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});


app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/lessons", lessonRoutes);  
app.use("/api/tutor", tutorRoutes);


app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    details: { code: "not_found", path: req.path },
  });
});


app.use(errorHandler);

export default app;


