import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import reviewRoutes from "./routes/reviewRoutes"; 
import commentRoutes from "./routes/comments";
import voteRoutes from "./routes/votes";

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
app.use("/api/media", mediaRoutes);
app.use("/api/reviews", reviewRoutes); 
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
