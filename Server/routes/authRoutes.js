const express = require("express");

const {
  signup,
  login,
  googleAuth,
  githubAuth,
  githubCallback,
  logout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);
router.post("/logout", logout);

module.exports = router;