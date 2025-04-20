const express = require('express');
const router = express.Router();
const Deck = require('../models/deck');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a new deck
router.post('/', async (req, res) => {
  try {
    const { authorId, ...deckData } = req.body;
    
    if (!authorId) {
      return res.status(400).json({ error: 'Author ID is required' });
    }

    const deck = new Deck({
      ...deckData,
      author: authorId
    });
    
    await deck.save();
    res.status(201).json(deck);
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(400).json({ error: error.message });
  }
});

// Generate Mermaid diagram
router.post('/generate-mermaid', async (req, res) => {
  try {
    const { description } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Convert this description into a mermaid.js diagram code: ${description}`;
    const result = await model.generateContent(prompt);
    const mermaidCode = result.response.text();
    
    res.json({ code: mermaidCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all public decks
router.get('/public', async (req, res) => {
  try {
    const decks = await Deck.find({ isPublic: true })
      .sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's decks
router.get('/my-decks', async (req, res) => {
  try {
    const decks = await Deck.find()
      .sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update the my-decks/:userId route
router.get('/my-decks/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const decks = await Deck.find({ author: userId })
      .select('title description isPublic createdAt updatedAt')
      .sort({ createdAt: -1 });
      
    res.json(decks);
  } catch (error) {
    console.error('Error fetching user decks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single deck
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.json(deck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update deck
router.put('/:id', async (req, res) => {
  try {
    const { authorId, ...updateData } = req.body;
    const deck = await Deck.findOneAndUpdate(
      { _id: req.params.id, author: authorId },
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found or unauthorized' });
    }
    res.json(deck);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete deck
router.delete('/:id', async (req, res) => {
  try {
    const deck = await Deck.findByIdAndDelete(req.params.id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;