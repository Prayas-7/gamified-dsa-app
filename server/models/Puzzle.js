const mongoose = require('mongoose');

const PuzzleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  topic: { type: String, enum: ['arrays', 'linked-lists', 'sorting', 'trees'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  
  // Game Logic
  initialConfig: { type: mongoose.Schema.Types.Mixed, required: true }, // e.g. [5, 2, 8]
  targetConfig: { type: mongoose.Schema.Types.Mixed, required: true },  // e.g. [2, 5, 8]
  
  xpReward: { type: Number, default: 20 }
});

module.exports = mongoose.model('Puzzle', PuzzleSchema);