import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import reviewRoutes from "./routes/reviewRoutes"; 
import commentRoutes from "./routes/comments";
import voteRoutes from "./routes/votes";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const viewerCounts: Record<string, number> = {};
io.on("connection", (socket) => {
  socket.on("join-media", (mediaId: string) => {
    socket.join(mediaId);

    viewerCounts[mediaId] = (viewerCounts[mediaId] || 0) + 1;
    io.to(mediaId).emit("viewer-count", viewerCounts[mediaId]);
  });

  socket.on("leave-media", (mediaId: string) => {
    socket.leave(mediaId);

    viewerCounts[mediaId] = Math.max((viewerCounts[mediaId] || 1) - 1, 0);
    io.to(mediaId).emit("viewer-count", viewerCounts[mediaId]);
  });

  socket.on("disconnect", () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);

    rooms.forEach((mediaId) => {
      viewerCounts[mediaId] = Math.max((viewerCounts[mediaId] || 1) - 1, 0);
      io.to(mediaId).emit("viewer-count", viewerCounts[mediaId]);
    });
  });
});

export { io };

// ✅ CORS must be first, before anything else
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
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
    httpServer.listen(process.env.PORT || 5050, () => {
  console.log(`Server running on port ${process.env.PORT || 5050}`);
});
  })
  .catch((err) => console.error("MongoDB connection error:", err));
