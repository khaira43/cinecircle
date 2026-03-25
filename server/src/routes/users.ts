import { Router, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import Review from "../models/Review";
import Comment from "../models/Comment";
import Vote from "../models/Vote";

const router = Router();

router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching profile" });
  }
});

router.put("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, bio, avatarUrl } = req.body;
    const userId = req.user!.userId;

    if (username !== undefined) {
      if (username.trim().length < 3 || username.trim().length > 20 || username.includes(" ")) {
        return res.status(400).json({ error: "Username must be 3-20 characters with no spaces" });
      }
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }
    }

    if (email !== undefined) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    if (bio !== undefined && bio.length > 300) {
      return res.status(400).json({ error: "Bio must be under 300 characters" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { username, email, bio, avatarUrl },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    return res.status(200).json(updated);
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error updating profile" });
  }
});

router.put("/me/password", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both currentPassword and newPassword are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Server error updating password" });
  }
});

router.delete("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword) {
      return res.status(400).json({ error: "currentPassword is required to delete account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Password is incorrect" });
    }

    await Review.deleteMany({ userId });
    await Comment.deleteMany({ userId });
    await Vote.deleteMany({ userId });
    await user.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: "Server error deleting account" });
  }
});

export default router;