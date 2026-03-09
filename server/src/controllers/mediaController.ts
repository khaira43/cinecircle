import { Request, Response } from "express";
import Media from "../models/Media";

export const getAllMedia = async (_req: Request, res: Response) => {
  try {
    const media = await Media.find({}, "title type genre posterUrl");
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

export const getMediaById = async (req: Request, res: Response) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    res.json(media);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch media item" });
  }
};