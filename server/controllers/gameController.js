const User = require('../models/User');

// --- HELPER: Calculate Level based on XP ---
const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// --- HELPER: Check if two dates are the same day ---
const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

// 1. GET DASHBOARD DATA
exports.getDashboardData = async (req, res) => {
  // Debug logs
  console.log("-----------------------------------");
  console.log("HIT DASHBOARD ENDPOINT");
  console.log("User ID from Token:", req.user._id);

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. EXACT ORDER from your SkillTree.tsx
    // If you miss one here, the "Continue" button will skip it!
    const curriculum = [
        'arrays', 
        'linear-search', 
        'binary-search', 
        'bubble-sort', 
        'selection-sort', // Added (was missing)
        'linked-lists', 
        'stacks', 
        'hash-tables',    // Added (was missing)
        'trees', 
        'graphs'
    ];

    let nextTopic = 'arrays'; // Default for new users
    let allCompleted = true; // Flag to check if game is finished

    // 2. Logic to find the First Unfinished Level
    if (user.completedLevels && user.completedLevels.length > 0) {
        for (const topic of curriculum) {
          if (!user.completedLevels.includes(topic)) {
            nextTopic = topic;
            allCompleted = false;
            break; // Found the next step! Stop looking.
          }
        }
    } else {
        allCompleted = false;
    }

    // 3. Handle "Game Over" (All levels done)
    if (allCompleted) {
        nextTopic = 'course-completed'; // You can handle this in frontend later
    }

    // Format Activity Graph (Last 7 days)
    const today = new Date();
    const last7DaysActivity = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        
        const active = user.activityLog && user.activityLog.some(logDate => isSameDay(new Date(logDate), d));
        
        last7DaysActivity.push({ 
            day: d.toLocaleDateString('en-US', { weekday: 'short' }), 
            active: active || false 
        });
    }

    res.status(200).json({
      username: user.username,
      xp: user.xp,
      level: calculateLevel(user.xp),
      streak: user.streak || 0,
      completedLevels: user.completedLevels || [],
      nextTopic, 
      activityGraph: last7DaysActivity
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. UPDATE PROGRESS (Unchanged, but included for completeness)
exports.updateProgress = async (req, res) => {
  try {
    const { levelId, xpEarned } = req.body;
    const userId = req.user._id; 

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Streak Logic
    const now = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

    if (!lastActive) {
        user.streak = 1; 
    } else if (!isSameDay(now, lastActive)) {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (isSameDay(lastActive, yesterday)) {
            user.streak += 1; 
        } else {
            user.streak = 1; 
        }
    }
    
    user.lastActiveDate = now;
    if (!user.activityLog) user.activityLog = [];
    user.activityLog.push(now);

    // XP Logic
    user.xp += xpEarned;
    user.level = calculateLevel(user.xp);

    if (levelId && !user.completedLevels.includes(levelId)) {
      user.completedLevels.push(levelId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      message: 'Progress saved!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. GET LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('username xp') 
      .sort({ xp: -1 })
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};