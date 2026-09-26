import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const getGoogleClient = () => {
  if (process.env.GOOGLE_CLIENT_ID) {
    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return null;
};

const getJwtSecret = () => {
  return process.env.JWT_SECRET || "codehive_default_jwt_secret_dev_2026";
};

export const signup = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is not connected. Please provide MongoDB credentials in .env.",
      });
    }

    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: "local",
    });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      getJwtSecret(),
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: error.message || "Signup failed. Check database connection.",
    });
  }
};

export const login = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is not connected. Please provide MongoDB credentials in .env.",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Please use Google login for this account",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      getJwtSecret(),
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: error.message || "Login failed. Check database connection.",
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const googleClient = getGoogleClient();
    if (!googleClient) {
      return res.status(500).json({
        message: "GOOGLE_CLIENT_ID is not configured on the server",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const profilePicture = payload.picture;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not available",
      });
    }

    let user = await User.findOne({
      $or: [
        { googleId: googleId },
        { email: email.toLowerCase() },
      ],
    });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        profilePicture: profilePicture || null,
        password: null,
        authProvider: "google",
      });
    } else {
      user.googleId = googleId;
      user.profilePicture = profilePicture || user.profilePicture;
      await user.save();
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      getJwtSecret(),
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    res.status(401).json({
      message: "Google authentication failed",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      message: "Profile update failed",
    });
  }
};