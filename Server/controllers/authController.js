// <<<<<<< HEAD
// const crypto = require("crypto");
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
// =======
// import mongoose from "mongoose";
// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { OAuth2Client } from "google-auth-library";
// >>>>>>> origin/main

// const getGoogleClient = () => {
//   if (process.env.GOOGLE_CLIENT_ID) {
//     return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//   }
//   return null;
// };

// const getJwtSecret = () => {
//   return process.env.JWT_SECRET || "codehive_default_jwt_secret_dev_2026";
// };

// export const signup = async (req, res) => {
//   try {
//     if (mongoose.connection.readyState !== 1) {
//       return res.status(503).json({
//         message: "Database is not connected. Please provide MongoDB credentials in .env.",
//       });
//     }

//     const { name, email, password } = req.body;

//     // Check required fields
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         message: "Name, email and password are required",
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });

//     if (existingUser) {
//       return res.status(400).json({
//         message: "User already exists with this email",
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       name: name.trim(),
//       email: email.toLowerCase().trim(),
//       password: hashedPassword,
//       authProvider: "local",
//     });

//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//       },
//       getJwtSecret(),
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.status(201).json({
//       message: "Signup successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Signup error:", error);

//     res.status(500).json({
//       message: error.message || "Signup failed. Check database connection.",
//     });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     if (mongoose.connection.readyState !== 1) {
//       return res.status(503).json({
//         message: "Database is not connected. Please provide MongoDB credentials in .env.",
//       });
//     }

//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Email and password are required",
//       });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() });

//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid email or password",
//       });
//     }

//     if (!user.password) {
//       return res.status(401).json({
//         message: "Please use Google login for this account",
//       });
//     }

//     const isPasswordCorrect = await bcrypt.compare(
//       password,
//       user.password
//     );

//     if (!isPasswordCorrect) {
//       return res.status(401).json({
//         message: "Invalid email or password",
//       });
//     }

//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//       },
//       getJwtSecret(),
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);

//     res.status(500).json({
//       message: error.message || "Login failed. Check database connection.",
//     });
//   }
// };

// export const googleAuth = async (req, res) => {
//   try {
//     const { credential } = req.body;

//     if (!credential) {
//       return res.status(400).json({
//         message: "Google credential is required",
//       });
//     }

//     const googleClient = getGoogleClient();
//     if (!googleClient) {
//       return res.status(500).json({
//         message: "GOOGLE_CLIENT_ID is not configured on the server",
//       });
//     }

//     const ticket = await googleClient.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();

//     const googleId = payload.sub;
//     const email = payload.email;
//     const name = payload.name;
//     const profilePicture = payload.picture;

//     if (!email) {
//       return res.status(400).json({
//         message: "Google account email not available",
//       });
//     }

//     let user = await User.findOne({
//       $or: [
//         { googleId: googleId },
//         { email: email.toLowerCase() },
//       ],
//     });

//     if (!user) {
//       user = await User.create({
//         name: name || "Google User",
//         email: email.toLowerCase(),
//         googleId,
//         profilePicture: profilePicture || null,
//         password: null,
//         authProvider: "google",
//       });
//     } else {
//       user.googleId = googleId;
//       user.profilePicture = profilePicture || user.profilePicture;
//       await user.save();
//     }

//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//       },
//       getJwtSecret(),
//       {
//         expiresIn: "7d",
//       }
//     );

//     res.status(200).json({
//       message: "Google login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePicture: user.profilePicture,
//       },
//     });
//   } catch (error) {
//     console.error("Google authentication error:", error);

//     res.status(401).json({
//       message: "Google authentication failed",
//     });
//   }
// };

// <<<<<<< HEAD
// const githubAuth = (req, res) => {
//   const state = crypto.randomBytes(32).toString("hex");

//   res.cookie("github_oauth_state", state, {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: false,
//     maxAge: 10 * 60 * 1000,
//   });

//   const githubUrl = new URL(
//     "https://github.com/login/oauth/authorize"
//   );

//   githubUrl.searchParams.set(
//     "client_id",
//     process.env.GITHUB_CLIENT_ID
//   );

//   githubUrl.searchParams.set(
//     "redirect_uri",
//     "http://localhost:5000/api/auth/github/callback"
//   );

//   githubUrl.searchParams.set(
//     "scope",
//     "read:user user:email"
//   );

//   githubUrl.searchParams.set("state", state);

//   res.redirect(githubUrl.toString());
// };

// const githubCallback = async (req, res) => {
//   try {
//     const { code, state } = req.query;

// if (!code) {
//   return res.status(400).json({
//     message: "GitHub authorization code is missing",
//   });
// }

// if (!state) {
//   return res.status(400).json({
//     message: "GitHub OAuth state is missing",
//   });
// }

// // Read the OAuth state stored in the HttpOnly cookie
// const cookies = req.headers.cookie || "";

// const stateCookie = cookies
//   .split(";")
//   .map((cookie) => cookie.trim())
//   .find((cookie) => cookie.startsWith("github_oauth_state="));

// const storedState = stateCookie
//   ? decodeURIComponent(stateCookie.split("=")[1])
//   : null;

// if (!storedState || storedState !== state) {
//   return res.status(403).json({
//     message: "Invalid GitHub OAuth state",
//   });
// }

// res.clearCookie("github_oauth_state");

//     // Exchange authorization code for GitHub access token
//     const tokenResponse = await fetch(
//       "https://github.com/login/oauth/access_token",
//       {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           client_id: process.env.GITHUB_CLIENT_ID,
//           client_secret:
//  process.env.GITHUB_CLIENT_SECRET,
//           code,
//         }),
//       }
//     );

//     const tokenData = await tokenResponse.json();

//     if (!tokenData.access_token) {
//       console.error("GitHub token error:", tokenData);

//       return res.status(401).json({
//         message: "Failed to get GitHub access token",
//       });
//     }

//     const accessToken = tokenData.access_token;

//     // Get GitHub profile
//     const profileResponse = await fetch(
//       "https://api.github.com/user",
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/vnd.github+json",
//           "User-Agent": "CodeHive",
//         },
//       }
//     );

//     const profile = await profileResponse.json();

//     if (!profile.id) {
//       return res.status(401).json({
//         message: "Failed to get GitHub profile",
//       });
//     }

//     // Get GitHub email
//     const emailResponse = await fetch(
//       "https://api.github.com/user/emails",
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/vnd.github+json",
//           "User-Agent": "CodeHive",
//         },
//       }
//     );

//     const emails = await emailResponse.json();

//     const primaryEmail =
//       emails.find((email) => email.primary && email.verified)?.email ||
//       emails.find((email) => email.verified)?.email;

//     if (!primaryEmail) {
//       return res.status(400).json({
//         message: "No verified GitHub email found",
//       });
//     }

//     const email = primaryEmail.toLowerCase();

//     // Find existing user
//     let user = await User.findOne({
//       $or: [
//         { githubId: String(profile.id) },
//         { email },
//       ],
//     });

//     // Create user if they don't exist
//     if (!user) {
//       user = await User.create({
//         name: profile.name || profile.login || "GitHub User",
//         email,
//         githubId: String(profile.id),
//         profilePicture: profile.avatar_url || null,
//         password: null,
//         authProvider: "github",
//       });
//     } else {
//       // Link GitHub account to existing user
//       user.githubId = String(profile.id);
//       user.profilePicture =
//         profile.avatar_url || user.profilePicture;

//       await user.save();
//     }

//     // Generate CodeHive JWT
//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );

//     // For now, return the result
//     const frontendUrl = "http://localhost:5173";

// const userData = {
//   id: user._id,
//   name: user.name,
//   email: user.email,
//   profilePicture: user.profilePicture,
// };

// res.redirect(
//   `${frontendUrl}/login#token=${encodeURIComponent(
//     token
//   )}&user=${encodeURIComponent(JSON.stringify(userData))}`
// );s
//   } catch (error) {
    
//     console.error("GitHub authentication error:", error);

//     res.status(500).json({
//       message: "GitHub authentication failed",
//     });
//   }
// };

// // ==================== DISCORD OAUTH ====================

// const discordAuth = (req, res) => {
//   const state = crypto.randomBytes(32).toString("hex");

//   res.cookie("discord_oauth_state", state, {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: false,
//     maxAge: 10 * 60 * 1000,
//   });

//   const discordUrl = new URL(
//     "https://discord.com/oauth2/authorize"
//   );

//   discordUrl.searchParams.set(
//     "client_id",
//     process.env.DISCORD_CLIENT_ID
//   );

//   discordUrl.searchParams.set(
//     "redirect_uri",
//     "http://localhost:5000/api/auth/discord/callback"
//   );

//   discordUrl.searchParams.set("response_type", "code");

//   discordUrl.searchParams.set(
//     "scope",
//     "identify email"
//   );

//   discordUrl.searchParams.set("state", state);

//   res.redirect(discordUrl.toString());
// };


// const discordCallback = async (req, res) => {
//   try {
//     const { code, state } = req.query;

//     if (!code) {
//       return res.status(400).json({
//         message: "Discord authorization code is missing",
//       });
//     }

//     if (!state) {
//       return res.status(400).json({
//         message: "Discord OAuth state is missing",
//       });
//     }

//     // Read OAuth state from HttpOnly cookie
//     const cookies = req.headers.cookie || "";

//     const stateCookie = cookies
//       .split(";")
//       .map((cookie) => cookie.trim())
//       .find((cookie) =>
//         cookie.startsWith("discord_oauth_state=")
//       );

//     const storedState = stateCookie
//       ? decodeURIComponent(stateCookie.split("=")[1])
//       : null;

//     if (!storedState || storedState !== state) {
//       return res.status(403).json({
//         message: "Invalid Discord OAuth state",
//       });
//     }

//     res.clearCookie("discord_oauth_state");

//     // Exchange authorization code for Discord access token
//     const tokenResponse = await fetch(
//       "https://discord.com/api/v10/oauth2/token",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams({
//           client_id: process.env.DISCORD_CLIENT_ID,
//           client_secret: process.env.DISCORD_CLIENT_SECRET,
//           grant_type: "authorization_code",
//           code,
//           redirect_uri:
//             "http://localhost:5000/api/auth/discord/callback",
//         }),
//       }
//     );

//     const tokenData = await tokenResponse.json();

//     if (!tokenData.access_token) {
//       console.error("Discord token error:", tokenData);

//       return res.status(401).json({
//         message: "Failed to get Discord access token",
//       });
//     }

//     const accessToken = tokenData.access_token;

//     // Get Discord user information
//     const userResponse = await fetch(
//       "https://discord.com/api/v10/users/@me",
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     const discordUser = await userResponse.json();

//     if (!discordUser.id) {
//       return res.status(401).json({
//         message: "Failed to get Discord user",
//       });
//     }

//     if (!discordUser.email) {
//       return res.status(400).json({
//         message: "Discord account email is not available",
//       });
//     }

//     const email = discordUser.email.toLowerCase();

//     // Find existing user by Discord ID or email
//     let user = await User.findOne({
//       $or: [
//         { discordId: String(discordUser.id) },
//         { email },
//       ],
//     });

//     // Create new user
//     if (!user) {
//       user = await User.create({
//         name:
//           discordUser.global_name ||
//           discordUser.username ||
//           "Discord User",
//         email,
//         discordId: String(discordUser.id),
//         profilePicture: discordUser.avatar
//           ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
//           : null,
//         password: null,
//         authProvider: "discord",
//       });
//     } else {
//       // Link Discord account to existing user
//       user.discordId = String(discordUser.id);

//       if (discordUser.avatar) {
//         user.profilePicture =
//           `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
//       }

//       await user.save();
//     }

//     // Generate CodeHive JWT
//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       }
//     );

//     const frontendUrl = "http://localhost:5173";

//     const userData = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       profilePicture: user.profilePicture,
//       authProvider: user.authProvider,
//     };

//     res.redirect(
//       `${frontendUrl}/login#token=${encodeURIComponent(
//         token
//       )}&user=${encodeURIComponent(JSON.stringify(userData))}`
//     );
//   } catch (error) {
//     console.error("Discord authentication error:", error);

//     res.status(500).json({
//       message: "Discord authentication failed",
//     });
//   }
// };



// const logout = async (req, res) => {
// =======
// export const logout = async (req, res) => {
// >>>>>>> origin/main
//   try {
//     res.json({ message: "Logout successful" });
//   } catch (error) {
//     res.status(500).json({ message: "Logout failed" });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { name } = req.body;

//     if (!name || !name.trim()) {
//       return res.status(400).json({
//         message: "Name is required",
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       userId,
//       { name: name.trim() },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Profile update error:", error);

//     res.status(500).json({
//       message: "Profile update failed",
//     });
//   }
// <<<<<<< HEAD
// };

// module.exports = {
//   signup,
//   login,
//   googleAuth,
//   githubAuth,
//   githubCallback,
//   discordAuth,
//   discordCallback,
//   logout,
//   updateProfile,
// =======
// >>>>>>> origin/main
// };



import crypto from "crypto";
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

// ==================== SIGNUP ====================

export const signup = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          "Database is not connected. Please provide MongoDB credentials in .env.",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      message:
        error.message || "Signup failed. Check database connection.",
    });
  }
};

// ==================== LOGIN ====================

export const login = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          "Database is not connected. Please provide MongoDB credentials in .env.",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

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
      message:
        error.message || "Login failed. Check database connection.",
    });
  }
};

// ==================== GOOGLE OAUTH ====================

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
      user.profilePicture =
        profilePicture || user.profilePicture;

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

// ==================== GITHUB OAUTH ====================

export const githubAuth = (req, res) => {
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

export const githubCallback = async (req, res) => {
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

    // Read OAuth state from HttpOnly cookie
    const cookies = req.headers.cookie || "";

    const stateCookie = cookies
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) =>
        cookie.startsWith("github_oauth_state=")
      );

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
          client_secret: process.env.GITHUB_CLIENT_SECRET,
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
      emails.find(
        (email) => email.primary && email.verified
      )?.email ||
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
        name:
          profile.name ||
          profile.login ||
          "GitHub User",
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
      getJwtSecret(),
      {
        expiresIn: "7d",
      }
    );

    const frontendUrl = "http://localhost:5173";

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
    };

    res.redirect(
      `${frontendUrl}/login#token=${encodeURIComponent(
        token
      )}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`
    );
  } catch (error) {
    console.error(
      "GitHub authentication error:",
      error
    );

    res.status(500).json({
      message: "GitHub authentication failed",
    });
  }
};

// ==================== DISCORD OAUTH ====================

export const discordAuth = (req, res) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("discord_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 60 * 1000,
  });

  const discordUrl = new URL(
    "https://discord.com/oauth2/authorize"
  );

  discordUrl.searchParams.set(
    "client_id",
    process.env.DISCORD_CLIENT_ID
  );

  discordUrl.searchParams.set(
    "redirect_uri",
    "http://localhost:5000/api/auth/discord/callback"
  );

  discordUrl.searchParams.set(
    "response_type",
    "code"
  );

  discordUrl.searchParams.set(
    "scope",
    "identify email"
  );

  discordUrl.searchParams.set("state", state);

  res.redirect(discordUrl.toString());
};

export const discordCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        message: "Discord authorization code is missing",
      });
    }

    if (!state) {
      return res.status(400).json({
        message: "Discord OAuth state is missing",
      });
    }

    // Read OAuth state from HttpOnly cookie
    const cookies = req.headers.cookie || "";

    const stateCookie = cookies
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) =>
        cookie.startsWith("discord_oauth_state=")
      );

    const storedState = stateCookie
      ? decodeURIComponent(stateCookie.split("=")[1])
      : null;

    if (!storedState || storedState !== state) {
      return res.status(403).json({
        message: "Invalid Discord OAuth state",
      });
    }

    res.clearCookie("discord_oauth_state");

    // Exchange authorization code for Discord access token
    const tokenResponse = await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret:
            process.env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri:
            "http://localhost:5000/api/auth/discord/callback",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error(
        "Discord token error:",
        tokenData
      );

      return res.status(401).json({
        message: "Failed to get Discord access token",
      });
    }

    const accessToken = tokenData.access_token;

    // Get Discord user information
    const userResponse = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const discordUser = await userResponse.json();

    if (!discordUser.id) {
      return res.status(401).json({
        message: "Failed to get Discord user",
      });
    }

    if (!discordUser.email) {
      return res.status(400).json({
        message:
          "Discord account email is not available",
      });
    }

    const email = discordUser.email.toLowerCase();

    // Find existing user by Discord ID or email
    let user = await User.findOne({
      $or: [
        {
          discordId: String(discordUser.id),
        },
        { email },
      ],
    });

    // Create new user
    if (!user) {
      user = await User.create({
        name:
          discordUser.global_name ||
          discordUser.username ||
          "Discord User",
        email,
        discordId: String(discordUser.id),
        profilePicture: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null,
        password: null,
        authProvider: "discord",
      });
    } else {
      // Link Discord account to existing user
      user.discordId = String(discordUser.id);

      if (discordUser.avatar) {
        user.profilePicture =
          `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
      }

      await user.save();
    }

    // Generate CodeHive JWT
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

    const frontendUrl = "http://localhost:5173";

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
    };

    res.redirect(
      `${frontendUrl}/login#token=${encodeURIComponent(
        token
      )}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`
    );
  } catch (error) {
    console.error(
      "Discord authentication error:",
      error
    );

    res.status(500).json({
      message: "Discord authentication failed",
    });
  }
};

// ==================== LOGOUT ====================

export const logout = async (req, res) => {
  try {
    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",
    });
  }
};

// ==================== UPDATE PROFILE ====================

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
      {
        name: name.trim(),
      },
      {
        new: true,
      }
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
    console.error(
      "Profile update error:",
      error
    );

    res.status(500).json({
      message: "Profile update failed",
    });
  }
};