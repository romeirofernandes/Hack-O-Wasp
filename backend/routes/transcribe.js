const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { transcript, topic, title } = req.body;

    if (!transcript || !topic) {
      return res.status(400).json({ 
        error: "Missing required fields: transcript and topic are required" 
      });
    }

    console.log("Received transcription request:", {
      title,
      topicLength: topic.length,
      transcriptLength: transcript.length,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert tutor evaluating a student's understanding using the Feynman Technique. 
    
The student was asked to explain this concept in their own words:
"${topic}"

From the document: "${title}"

The student's explanation was:
"${transcript}"

Please analyze this explanation and provide:
1. A score from 1-10 indicating how well the student understands the concept
2. Constructive feedback on the explanation (what was good, what could be improved)
3. Any misconceptions or gaps in understanding you identified
4. Suggestions for how to better explain this concept in their own words

Format your response as a helpful, encouraging mentor. Focus on concrete ways to improve understanding, but also highlight what the student got right.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract a numeric score if present (1-10)
    let score = null;
    const scoreMatch = response.match(/\b([1-9]|10)(?:\s*\/\s*10|\s*out of\s*10)?\b/);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
    }

    res.json({
      success: true,
      feedback: response,
      score
    });
  } catch (error) {
    console.error("Transcription processing failed:", error);
    res.status(500).json({ 
      error: "Failed to process explanation",
      message: error.message
    });
  }
});

module.exports = router;