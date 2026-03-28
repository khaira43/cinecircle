import express from "express";
import { getAllMedia, getMediaById } from "../controllers/mediaController";

const router = express.Router();

router.get("/", getAllMedia);
router.get("/:id", getMediaById);

export default router;