import express from "express";

import {
  signup,
  login,
  googleAuth,
  githubAuth,
  githubCallback,
  discordAuth,
  discordCallback,
  logout,
  updateProfile,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================

router.post("/signup", signup);

router.post("/login", login);

router.post("/google", googleAuth);

// ==================== GITHUB OAUTH ====================

router.get("/github", githubAuth);

router.get("/github/callback", githubCallback);

// ==================== DISCORD OAUTH ====================

router.get("/discord", discordAuth);

router.get("/discord/callback", discordCallback);

// ==================== LOGOUT ====================

router.post("/logout", logout);

// ==================== PROFILE ====================

router.put("/profile", authMiddleware, updateProfile);

export default router;