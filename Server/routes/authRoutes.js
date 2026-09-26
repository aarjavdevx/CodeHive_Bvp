const express = require("express");

const {
  signup,
  login,
  googleAuth,
  logout,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);

module.exports = router;