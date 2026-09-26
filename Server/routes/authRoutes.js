import express from "express";
import {
  signup,
  login,
  googleAuth,
  logout,
  updateProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.put("/profile", authMiddleware, updateProfile);

export default router;