import { Router, Response } from "express";
import Vote from "../models/Vote";
import { protect, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId, value } = req.body;
    const userId = req.user!.userId;

    if (!reviewId) {
      return res.status(400).json({ error: "reviewId is required" });
    }

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: "value must be 1 or -1" });
    }

    const vote = await Vote.findOneAndUpdate(
      { userId, reviewId },
      { userId, reviewId, value },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json(vote);
  } catch (err: any) {
    console.error("POST VOTE ERROR:", err);
    return res.status(500).json({ error: "Server error saving vote" });
  }
});

router.delete("/:reviewId", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { reviewId } = req.params;

    const deletedVote = await Vote.findOneAndDelete({ userId, reviewId });

    if (!deletedVote) {
      return res.status(404).json({ error: "Vote not found" });
    }

    return res.status(200).json({ message: "Vote deleted successfully" });
  } catch (err) {
    console.error("DELETE VOTE ERROR:", err);
    return res.status(500).json({ error: "Server error deleting vote" });
  }
});

router.get("/count/:reviewId", async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    const upvotes = await Vote.countDocuments({ reviewId, value: 1 });
    const downvotes = await Vote.countDocuments({ reviewId, value: -1 });

    return res.status(200).json({
      upvotes,
      downvotes,
      score: upvotes - downvotes,
    });
  } catch (err) {
    console.error("GET VOTE COUNT ERROR:", err);
    return res.status(500).json({ error: "Server error fetching vote counts" });
  }
});

router.get("/user", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const votes = await Vote.find({ userId });

    return res.status(200).json(votes);
  } catch (err) {
    console.error("GET USER VOTES ERROR:", err);
    return res.status(500).json({ error: "Server error fetching user votes" });
  }
});

export default router;