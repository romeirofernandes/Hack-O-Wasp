const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: { type: Boolean, default: true },
  content: {
    notes: [{ type: String }],
    mermaidDiagrams: [{
      description: String,
      code: String
    }],
    bullets: [{ type: String }],
    tldr: String,
    flashcards: [{
      question: String,
      answer: String
    }],
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: Number
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deck', deckSchema);