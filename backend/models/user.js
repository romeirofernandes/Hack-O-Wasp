const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  content: {
    summary: [String],
    tldr: String,
    flashcards: [{
      question: String,
      answer: String
    }],
    quiz: [{
      question: String,
      options: [{
        text: String,
        isCorrect: Boolean,
        label: String,
        userAnswer: {
          type: String,
          enum: ['correct', 'incorrect']
        }
      }],
      correctAnswer: String,
      explanation: String
    }]
  }
});


const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: false },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  },
  documents: [documentSchema]
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);