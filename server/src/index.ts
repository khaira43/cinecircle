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
import userRoutes from "./routes/users";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const viewerCounts: Record<string, number> = {};
const socketRooms: Record<string, string> = {}; // maps socket.id -> mediaId

io.on("connection", (socket: import("socket.io").Socket) => {
  socket.on("join-media", (mediaId: string) => {
    // If this socket was already in a room, leave it first
    const previousRoom = socketRooms[socket.id];
    if (previousRoom) {
      socket.leave(previousRoom);
      viewerCounts[previousRoom] = Math.max((viewerCounts[previousRoom] || 1) - 1, 0);
      io.to(previousRoom).emit("viewer-count", viewerCounts[previousRoom]);
    }

    socket.join(mediaId);
    socketRooms[socket.id] = mediaId;
    viewerCounts[mediaId] = (viewerCounts[mediaId] || 0) + 1;
    io.to(mediaId).emit("viewer-count", viewerCounts[mediaId]);
  });

  socket.on("leave-media", (mediaId: string) => {
    socket.leave(mediaId);
    delete socketRooms[socket.id];
    viewerCounts[mediaId] = Math.max((viewerCounts[mediaId] || 1) - 1, 0);
    io.to(mediaId).emit("viewer-count", viewerCounts[mediaId]);
  });

  socket.on("disconnect", () => {
    // socket.rooms is already empty when disconnect fires, so use socketRooms instead
    const mediaId = socketRooms[socket.id];
    if (mediaId) {
      viewerCounts[mediaId] = Math.max((viewerCounts[mediaId] || 1) - 1, 0);
      io.to(mediaId).emit("viewer-count", viewerCounts[mediaId]);
      delete socketRooms[socket.id];
    }
  });
});

export { io };

// CORS must be first, before anything else
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle preflight requests explicitly
app.options("/{*path}", cors());

// Then your other middleware
app.use(express.json());

// Then your routes
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/reviews", reviewRoutes); 
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    httpServer.listen(process.env.PORT || 5050, () => {
      console.log(`Server running on port ${process.env.PORT || 5050}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));