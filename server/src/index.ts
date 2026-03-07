import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import reviewRoutes from "./routes/reviewRoutes"; 

const app = express();

// ✅ CORS must be first, before anything else
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Handle preflight requests explicitly
app.options("/{*path}", cors());

// ✅ Then your other middleware
app.use(express.json());

// ✅ Then your routes
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes); 

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
