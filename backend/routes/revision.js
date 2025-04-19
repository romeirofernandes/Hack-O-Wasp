const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get important quiz questions for revision
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.params.userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Collect all quizzes from all documents
        let allQuestions = [];
        user.documents.forEach(doc => {
            if (doc.content && doc.content.quiz) {
                doc.content.quiz.forEach(q => {
                    // Only add questions that haven't been answered or were answered incorrectly
                    const hasIncorrectAnswer = q.options.some(opt => 
                        opt.userAnswer === 'incorrect'
                    );
                    const isUnanswered = !q.options.some(opt => 
                        opt.userAnswer === 'correct' || opt.userAnswer === 'incorrect'
                    );

                    if (hasIncorrectAnswer || isUnanswered) {
                        allQuestions.push({
                            question: q.question,
                            options: q.options,
                            explanation: q.explanation,
                            documentName: doc.name,
                            documentId: doc._id,
                            questionId: q._id
                        });
                    }
                });
            }
        });

        // Randomly select 5 questions if more are available
        let selectedQuestions = allQuestions;
        if (allQuestions.length > 5) {
            selectedQuestions = [];
            const indices = new Set();
            while (indices.size < 5 && indices.size < allQuestions.length) {
                const randomIndex = Math.floor(Math.random() * allQuestions.length);
                if (!indices.has(randomIndex)) {
                    indices.add(randomIndex);
                    selectedQuestions.push(allQuestions[randomIndex]);
                }
            }
        }

        res.json({
            success: true,
            questions: selectedQuestions
        });

    } catch (error) {
        console.error('Error in revision route:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update question attempt status
router.post('/:userId/attempt', async (req, res) => {
    try {
        const { documentId, questionId, isCorrect } = req.body;
        const user = await User.findOne({ firebaseUID: req.params.userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the document and update the question's status
        const doc = user.documents.id(documentId);
        if (doc && doc.content.quiz) {
            const question = doc.content.quiz.id(questionId);
            if (question) {
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption) {
                    // Check if answer is changing from incorrect to correct
                    if (correctOption.userAnswer === 'incorrect' && isCorrect) {
                        console.log(`Question "${question.question}" changed from incorrect to correct!`);
                    }
                    correctOption.userAnswer = isCorrect ? 'correct' : 'incorrect';
                }
            }
        }

        await user.save();
        res.json({ success: true });

    } catch (error) {
        console.error('Error updating attempt:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
