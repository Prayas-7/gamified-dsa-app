const User = require('../models/User');

// @desc    Update User Progress (XP + Level Completion)
// @route   POST /api/game/progress
exports.updateProgress = async (req, res) => {
  try {
    const { levelId, xpEarned } = req.body;
    const userId = req.user._id; 

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Add XP
    // Prevent abuse: You might want to limit XP if level is already done, 
    // but for now we allow replaying for XP to keep it fun.
    user.xp += xpEarned;

    // 2. Mark Level as Completed
    // We only add it if it's not already there to avoid duplicates
    if (levelId && !user.completedLevels.includes(levelId)) {
      user.completedLevels.push(levelId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      xp: user.xp,
      completedLevels: user.completedLevels,
      message: 'Progress saved successfully'
    });
  } catch (error) {
    console.error('Progress Error:', error);
    res.status(500).json({ message: 'Server error saving progress' });
  }
};

// @desc    Get Global Leaderboard
// @route   GET /api/game/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    // Fetch top 10 users sorted by XP (Descending)
    const users = await User.find({})
      .select('username xp') // Only select necessary fields
      .sort({ xp: -1 })
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};