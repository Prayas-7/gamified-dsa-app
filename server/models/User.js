const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Gamification Stats
  xp: { type: Number, default: 0 },
  hearts: { type: Number, default: 5 },
  streak: { type: Number, default: 0 },
  
  // Changed from ObjectId to String to match Frontend IDs (e.g. "arrays", "linked-lists")
  completedLevels: { type: [String], default: [] }, 
  
   // --- NEW FIELDS FOR OTP ---
  otp: { type: String },
  otpExpires: { type: Date },

  darkMode: { type: Boolean, default: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

