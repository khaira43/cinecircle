import mongoose from "mongoose";
import Review from "../models/Review";

export async function getAverageRatings(mediaId: string) {
  const result = await Review.aggregate([
    {
      $match: {
        mediaId: new mongoose.Types.ObjectId(mediaId),
      },
    },
    {
      $project: {
        mediaId: 1,
        "ratings.story": 1,
        "ratings.acting": 1,
        "ratings.cinematography": 1,
        overallPerReview: {
          $avg: [
            "$ratings.story",
            "$ratings.acting",
            "$ratings.cinematography",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$mediaId",
        avgStory: { $avg: "$ratings.story" },
        avgActing: { $avg: "$ratings.acting" },
        avgCinematography: { $avg: "$ratings.cinematography" },
        avgOverall: { $avg: "$overallPerReview" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return (
    result[0] || {
      avgStory: null,
      avgActing: null,
      avgCinematography: null,
      avgOverall: null,
      reviewCount: 0,
    }
  );
}