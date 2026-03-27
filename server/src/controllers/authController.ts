import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import User  from "../models/User";

const signToken = (userId: string, username: string): string => {
  const signOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d",
  };

  return jwt.sign(
    { userId, username },
    process.env.JWT_SECRET as string,
    signOptions
  );
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Hash the password (10 salt rounds is standard)
    const passwordHash = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = await User.create({ username, email, passwordHash });

    // Sign a JWT
    const token = signToken(newUser._id.toString(), newUser.username);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error during registration" });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Use a vague message on purpose — don't reveal whether email exists
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password to the stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Sign a JWT
    const token = signToken(user._id.toString(), user.username);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error during login" });
  }
};