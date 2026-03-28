import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
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
const socketRooms: Record<string, string> = {};

io.on("connection", (socket: import("socket.io").Socket) => {
  socket.on("join-media", (mediaId: string) => {
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
    const mediaId = socketRooms[socket.id];
    if (mediaId) {
      viewerCounts[mediaId] = Math.max((viewerCounts[mediaId] || 1) - 1, 0);
      io.to(mediaId).emit("viewer-count", viewerCounts[mediaId]);
      delete socketRooms[socket.id];
    }
  });
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("/{*path}", cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export { app, httpServer, io };