import { Router, Response } from "express";
import Review from "../models/Review";
import { protect, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId } = req.query;

    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required" });
    }

    const reviews = await Review.find({ mediaId });

    return res.status(200).json(reviews);
  } catch (err) {
    console.error("GET ERROR:", err);
    return res.status(500).json({ error: String(err) });
  }
});

router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId, content, ratings } = req.body;
    const userId = req.user!.userId;

    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required" });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: "Review must be at least 10 characters" });
    }

    const existing = await Review.findOne({ userId, mediaId });
    if (existing) {
      return res.status(409).json({ error: "You already reviewed this title" });
    }

    const review = await Review.create({
      userId,
      mediaId,
      content: content.trim(),
      ratings,
    });

    return res.status(201).json(review);
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error creating review" });
  }
});

router.put("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: "You can only edit your own reviews" });
    }

    const { content, ratings } = req.body;

    if (content !== undefined && content.trim().length < 10) {
      return res.status(400).json({ error: "Review must be at least 10 characters" });
    }

    if (content !== undefined) review.content = content.trim();
    if (ratings !== undefined) review.ratings = ratings;

    await review.save();

    return res.status(200).json(review);
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error updating review" });
  }
});

router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }

    await review.deleteOne();

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Server error deleting review" });
  }
});

export default router;