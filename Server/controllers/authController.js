const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Signup failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

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
      process.env.JWT_SECRET,
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
      message: "Login failed",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
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
      process.env.JWT_SECRET,
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

const githubAuth = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 60 * 1000,
  });

  const githubUrl = new URL(
    "https://github.com/login/oauth/authorize"
  );

  githubUrl.searchParams.set(
    "client_id",
    process.env.GITHUB_CLIENT_ID
  );

  githubUrl.searchParams.set(
    "redirect_uri",
    "http://localhost:5000/api/auth/github/callback"
  );

  githubUrl.searchParams.set(
    "scope",
    "read:user user:email"
  );

  githubUrl.searchParams.set("state", state);

  res.redirect(githubUrl.toString());
};

const githubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

if (!code) {
  return res.status(400).json({
    message: "GitHub authorization code is missing",
  });
}

if (!state) {
  return res.status(400).json({
    message: "GitHub OAuth state is missing",
  });
}

// Read the OAuth state stored in the HttpOnly cookie
const cookies = req.headers.cookie || "";

const stateCookie = cookies
  .split(";")
  .map((cookie) => cookie.trim())
  .find((cookie) => cookie.startsWith("github_oauth_state="));

const storedState = stateCookie
  ? decodeURIComponent(stateCookie.split("=")[1])
  : null;

if (!storedState || storedState !== state) {
  return res.status(403).json({
    message: "Invalid GitHub OAuth state",
  });
}

res.clearCookie("github_oauth_state");

    // Exchange authorization code for GitHub access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret:
 process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("GitHub token error:", tokenData);

      return res.status(401).json({
        message: "Failed to get GitHub access token",
      });
    }

    const accessToken = tokenData.access_token;

    // Get GitHub profile
    const profileResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "CodeHive",
        },
      }
    );

    const profile = await profileResponse.json();

    if (!profile.id) {
      return res.status(401).json({
        message: "Failed to get GitHub profile",
      });
    }

    // Get GitHub email
    const emailResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "CodeHive",
        },
      }
    );

    const emails = await emailResponse.json();

    const primaryEmail =
      emails.find((email) => email.primary && email.verified)?.email ||
      emails.find((email) => email.verified)?.email;

    if (!primaryEmail) {
      return res.status(400).json({
        message: "No verified GitHub email found",
      });
    }

    const email = primaryEmail.toLowerCase();

    // Find existing user
    let user = await User.findOne({
      $or: [
        { githubId: String(profile.id) },
        { email },
      ],
    });

    // Create user if they don't exist
    if (!user) {
      user = await User.create({
        name: profile.name || profile.login || "GitHub User",
        email,
        githubId: String(profile.id),
        profilePicture: profile.avatar_url || null,
        password: null,
        authProvider: "github",
      });
    } else {
      // Link GitHub account to existing user
      user.githubId = String(profile.id);
      user.profilePicture =
        profile.avatar_url || user.profilePicture;

      await user.save();
    }

    // Generate CodeHive JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // For now, return the result
    const frontendUrl = "http://localhost:5173";

const userData = {
  id: user._id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture,
};

res.redirect(
  `${frontendUrl}/login#token=${encodeURIComponent(
    token
  )}&user=${encodeURIComponent(JSON.stringify(userData))}`
);s
  } catch (error) {
    
    console.error("GitHub authentication error:", error);

    res.status(500).json({
      message: "GitHub authentication failed",
    });
  }
};



const logout = async (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

const updateProfile = async (req, res) => {
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

module.exports = {
  signup,
  login,
  googleAuth,
  githubAuth,
  githubCallback,
  logout,
  updateProfile,
};