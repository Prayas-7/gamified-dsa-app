const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  puzzle: { type: mongoose.Schema.Types.ObjectId, ref: 'Puzzle', required: true },
  status: { type: String, enum: ['locked', 'active', 'completed'], default: 'locked' },
  attempts: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);