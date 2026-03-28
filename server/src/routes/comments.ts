import { Router, Response } from "express";
import Comment from "../models/Comment";
import { protect, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.query;

    if (!reviewId) {
      return res.status(400).json({ error: "reviewId is required" });
    }

    const comments = await Comment.find({ reviewId })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    return res.status(500).json({ error: "Server error fetching comments" });
  }
});

router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId, content } = req.body;
    const userId = req.user!.userId;

    if (!reviewId) {
      return res.status(400).json({ error: "reviewId is required" });
    }

    if (!content || content.trim().length < 1) {
      return res.status(400).json({ error: "content is required" });
    }

    const comment = await Comment.create({
      userId,
      reviewId,
      content: content.trim(),
    });

    const populatedComment = await Comment.findById(comment._id).populate("userId", "username");

    return res.status(201).json(populatedComment);
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("POST COMMENT ERROR:", err);
    return res.status(500).json({ error: "Server error creating comment" });
  }
});

router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    await comment.deleteOne();

    return res.status(204).send();
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    return res.status(500).json({ error: "Server error deleting comment" });
  }
});

router.put("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    const { content } = req.body;

    if (!content || content.trim().length < 3) {
      return res.status(400).json({ error: "Content must be at least 3 characters" });
    }

    comment.content = content.trim();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate("userId", "username");

    return res.status(200).json(populatedComment);
  } catch (err) {
    console.error("PUT COMMENT ERROR:", err);
    return res.status(500).json({ error: "Server error updating comment" });
  }
});

export default router;