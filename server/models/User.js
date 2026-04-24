const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- GAMIFICATION ---
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 }, // Added Level field to DB
  hearts: { type: Number, default: 5 },
  
  // --- STREAK & GRAPH DATA ---
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },       // To check if streak is broken
  activityLog: [{ type: Date }],        // Stores dates of activity for the graph

  // --- PROGRESS ---
  // Array of IDs: ["arrays-1", "linked-lists-2"]
  completedLevels: { type: [String], default: [] }, 
  
  // --- SETTINGS/AUTH ---
  otp: { type: String },
  otpExpires: { type: Date },
  darkMode: { type: Boolean, default: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);