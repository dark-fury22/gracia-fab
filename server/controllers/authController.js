import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { emailQueue, addToQueue } from "../queues/index.js";
import { emailTemplates, sendEmail } from "../services/emailService.js";
import { generateOtpCode, hashOtpCode, otpExpiryDate, OTP_MAX_ATTEMPTS } from "../utils/otp.js";
import logger from "../utils/logger.js";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({ name, email, password });

    if (user) {
      const template = emailTemplates.welcome(user.name);
      await addToQueue(emailQueue, "welcome", {
        to: user.email,
        subject: template.subject,
        html: template.html,
        type: "welcome",
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generates a fresh OTP for a user, saves its hash, and emails it.
// Sent synchronously (not via the queue) — the user is actively waiting
// for this code, so the request should reflect whether it actually went
// out rather than silently succeeding on a dropped background job.
const issueLoginOtp = async (user) => {
  const code = generateOtpCode();
  user.otpCodeHash = hashOtpCode(code);
  user.otpExpiresAt = otpExpiryDate();
  user.otpAttempts = 0;
  await user.save();

  const template = emailTemplates.loginOtp(user.name, code);
  await sendEmail({ to: user.email, subject: template.subject, html: template.html });

  // The real email transport logs only {to, subject} when unconfigured —
  // log the code itself outside production so local dev/testing can
  // actually complete the login flow without real SMTP credentials.
  if (process.env.NODE_ENV !== "production") {
    logger.info({ email: user.email, code }, "OTP generated (dev mode)");
  }
};

// @desc    Login user — step 1: verify password, send a login OTP
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    await issueLoginOtp(user);

    res.json({
      requiresOtp: true,
      email: user.email,
      message: "We've emailed you a verification code.",
    });
  } catch (error) {
    logger.error({ err: error }, "loginUser error");
    res.status(500).json({ message: "Unable to send verification code. Please try again shortly." });
  }
};

// @desc    Login user — step 2: verify the OTP and issue the session
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No verification code found. Please log in again." });
    }

    if (user.otpExpiresAt < new Date()) {
      user.otpCodeHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "Code expired. Please request a new one." });
    }

    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });
    }

    if (hashOtpCode(code) !== user.otpCodeHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Incorrect code. Please try again." });
    }

    // Correct — clear the OTP state so it can't be reused, then issue the token
    user.otpCodeHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error({ err: error }, "verifyOtp error");
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend the login OTP
// @route   POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Don't reveal whether the account exists
    if (!user) {
      return res.json({ message: "If an account exists, a new code has been sent." });
    }

    await issueLoginOtp(user);

    res.json({ message: "A new code has been sent." });
  } catch (error) {
    logger.error({ err: error }, "resendOtp error");
    res.status(500).json({ message: "Unable to send verification code. Please try again shortly." });
  }
};

/// @desc    Get logged in user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      skinType: user.skinType || "normal",
      hairType: user.hairType || "straight",
      isAdmin: user.isAdmin || false,
      wishlist: user.wishlist || [],
      savedRecommendations: user.savedRecommendations || [],
    });
  } catch (error) {
    logger.error({ err: error }, "getUserProfile error");
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.skinType = req.body.skinType || user.skinType;
    user.hairType = req.body.hairType || user.hairType;

    // Update password only if provided
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      skinType: updatedUser.skinType,
      hairType: updatedUser.hairType,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
