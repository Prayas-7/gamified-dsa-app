const express = require('express');
const router = express.Router();
const { updateProgress, getLeaderboard } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

// Protected: Needs Login
router.post('/progress', protect, updateProgress);

// Public or Protected (Your choice, keeping it open usually increases engagement)
router.get('/leaderboard', getLeaderboard);

module.exports = router;