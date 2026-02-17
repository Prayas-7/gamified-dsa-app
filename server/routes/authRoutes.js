const express = require('express');
const router = express.Router();

// 1. IMPORT ALL FUNCTIONS correctly
const { 
  registerUser, 
  loginUser, 
  googleLogin,      // Matches controller export
  forgotPassword,   // Matches controller export
  resetPassword     // Matches controller export
} = require('../controllers/authController');

// 2. DEFINE ROUTES using the imported functions

// Standard Auth
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Google Auth
router.post('/google', googleLogin); // <--- This fixes the 404

// Password Reset Flow
router.post('/forgot-password', forgotPassword); // Sends the OTP
router.post('/reset-password', resetPassword);   // Verifies OTP & updates password

// Routes we haven't built controllers for yet (Commented out to prevent crash)
// router.post('/refresh-token', refreshToken);
// router.post('/logout', logoutUser);

module.exports = router;