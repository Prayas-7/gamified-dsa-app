const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
// 1. IMPORT ALL FUNCTIONS correctly
const { 
  registerUser, 
  loginUser, 
  googleLogin,      // Matches controller export
  forgotPassword,   // Matches controller export
  resetPassword,
  logoutUser,
  deleteAccount,
  renameUser,
     // Matches controller export
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

// Logout Route
router.post('/logout', logoutUser);

router.delete('/delete-account', protect, deleteAccount);
router.put('/rename', protect, renameUser);

// Routes we haven't built controllers for yet (Commented out to prevent crash)
// router.post('/refresh-token', refreshToken);
// router.post('/logout', logoutUser);

module.exports = router;