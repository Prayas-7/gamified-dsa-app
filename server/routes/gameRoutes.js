const express = require('express');
const router = express.Router();
// 1. IMPORT getDashboardData HERE
const { 
  updateProgress, 
  getLeaderboard, 
  getDashboardData 
} = require('../controllers/gameController');

const { protect } = require('../middleware/authMiddleware');

// Protected: Needs Login
router.post('/progress', protect, updateProgress);

// 2. ADD THIS ROUTE HERE (This fixes the "Loading..." issue)
router.get('/dashboard', protect, getDashboardData);

// Public or Protected
router.get('/leaderboard', getLeaderboard);

module.exports = router;