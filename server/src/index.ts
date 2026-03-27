import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { app, httpServer } from "./app";

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    httpServer.listen(process.env.PORT || 5050, () => {
      console.log(`Server running on port ${process.env.PORT || 5050}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));