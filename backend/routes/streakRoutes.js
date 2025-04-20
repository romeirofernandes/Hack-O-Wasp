const express = require('express');
const router = express.Router();
const Streak = require('../models/streak');

// Get streak info
router.get('/:userId', async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.params.userId });
    
    if (!streak) {
      streak = new Streak({ 
        userId: req.params.userId,
        currentStreak: 0,
        longestStreak: 0
      });
      await streak.save();
    }

    res.json({ success: true, streak });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update streak
router.post('/updateStreak', async (req, res) => {
  try {
    const { userId } = req.body;
    let streak = await Streak.findOne({ userId });
    const now = new Date();

    if (!streak) {
      // New user gets streak of 1
      streak = new Streak({ 
        userId, 
        currentStreak: 1, 
        lastActivityDate: now,
        longestStreak: 1 
      });
      console.log(`[Streak] New user! Starting streak at 1 for user ${userId}`);
    } else {
      const lastActivity = new Date(streak.lastActivityDate);
      const lastActivityDay = lastActivity.setHours(0, 0, 0, 0);
      const today = now.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActivityDay) / (1000 * 60 * 60 * 24));

      console.log(`[Streak] Days since last activity: ${diffDays}`);
      
      if (diffDays === 0) {
        // Make sure streak is at least 1 even on first day
        if (streak.currentStreak === 0) {
          streak.currentStreak = 1;
          console.log(`[Streak] Initializing streak to 1 for today`);
        } else {
          console.log(`[Streak] Already logged activity today. Current streak: ${streak.currentStreak}`);
        }
      } else if (diffDays === 1) {
        streak.currentStreak += 1;
        streak.lastActivityDate = now;
        console.log(`[Streak] Next day activity! Streak increased to ${streak.currentStreak}`);
      } else {
        console.log(`[Streak] Streak reset after ${diffDays} days gap`);
        streak.currentStreak = 1;
        streak.lastActivityDate = now;
      }
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    await streak.save();
    res.json({ 
      success: true, 
      streak,
      message: `Current streak: ${streak.currentStreak} days`
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
