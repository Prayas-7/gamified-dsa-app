const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ==============================================
   HELPER: SEND TOKEN IN COOKIE
   ============================================== */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days
    httpOnly: true, // Critical: JS cannot read this
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict' // CSRF protection
  };

  res
    .status(statusCode)
    .cookie('token', token, options) // <--- SETS THE COOKIE
    .json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      completedLevels: user.completedLevels,
      // Note: We do NOT send the token in the JSON anymore
    });
};

/* ==============================================
   REGISTER FLOW (Standard)
   ============================================== */
// @desc    Register a new user
// @route   POST /api/auth/signup
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    if (user) {
      // Use Helper to set cookie
      sendTokenResponse(user, 201, res);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================================
   LOGIN FLOW (Standard)
   ============================================== */
// @desc    Login User & Set Cookie
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Use Helper to set cookie
      sendTokenResponse(user, 200, res);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================================
   GOOGLE AUTH FLOW
   ============================================== */
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // ID Token from Frontend

    // 1. Verify Token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { name, email } = ticket.getPayload(); 

    // 2. Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists -> Log them in via Cookie
      sendTokenResponse(user, 200, res);
    } else {
      // User doesn't exist -> Register them
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        username: name, // Google name
        email: email,
        password: hashedPassword,
      });

      // Register via Cookie
      sendTokenResponse(user, 201, res);
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
};

/* ==============================================
   FORGOT PASSWORD (OTP)
   ============================================== */
// @desc    Send OTP to email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save OTP to DB (Expires in 10 mins)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // 3. Send Email
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>You requested a password reset. Use the code below to reset your password:</p>
          <h1 style="background: #eee; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Password Reset Code (Gamified DSA)',
        message,
      });
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (emailError) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==============================================
   RESET PASSWORD
   ============================================== */
// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // 1. Find user with this email AND valid OTP
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }, // Check if expiry is in the future
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 3. Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password Reset Successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};