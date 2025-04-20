const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Streak', streakSchema);
