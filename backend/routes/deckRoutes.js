const express = require('express');
const router = express.Router();
const Deck = require('../models/deck');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a new deck
router.post('/', async (req, res) => {
  try {
    const deck = new Deck({
      ...req.body,
      author: req.user.id
    });
    await deck.store();
    res.status(201).json(deck);
  } catch (error) {
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
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's decks
router.get('/my-decks', async (req, res) => {
  try {
    const decks = await Deck.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(decks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single deck
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id)
      .populate('author', 'name');
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.json(deck);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;