import { Request, Response } from "express";
import Media from "../models/Media";
import { getAverageRatings } from "../services/ratingService";

export const getAllMedia = async (_req: Request, res: Response) => {
  try {
    const mediaItems = await Media.find({}, "title type genre posterUrl");

    const mediaWithRatings = await Promise.all(
      mediaItems.map(async (item) => {
        const ratings = await getAverageRatings(item._id.toString());

        return {
          _id: item._id,
          title: item.title,
          type: item.type,
          genre: item.genre,
          posterUrl: item.posterUrl,
          averageRatings: {
            story: ratings.avgStory,
            acting: ratings.avgActing,
            cinematography: ratings.avgCinematography,
            overall: ratings.avgOverall,
            reviewCount: ratings.reviewCount,
          },
        };
      })
    );

    res.json(mediaWithRatings);
  } catch (err) {
    console.error("Failed to fetch media:", err);
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

export const getMediaById = async (req: Request, res: Response) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const ratings = await getAverageRatings(media._id.toString());

    res.json({
      _id: media._id,
      title: media.title,
      type: media.type,
      genre: media.genre,
      synopsis: media.synopsis,
      releaseYear: media.releaseYear,
      posterUrl: media.posterUrl,
      averageRatings: {
        story: ratings.avgStory,
        acting: ratings.avgActing,
        cinematography: ratings.avgCinematography,
        overall: ratings.avgOverall,
        reviewCount: ratings.reviewCount,
      },
    });
  } catch (err) {
    console.error("Failed to fetch media item:", err);
    res.status(500).json({ message: "Failed to fetch media item" });
  }
};