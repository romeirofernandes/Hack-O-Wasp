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

Please provide a detailed evaluation with scores in the following format:

SCORES
Understanding: [Score 1-10] - How well they grasp the core concept
Application: [Score 1-10] - How well they can apply it to real scenarios
Clarity: [Score 1-10] - How clear and coherent their explanation is

Then provide your feedback in these sections:
1. Strengths - What they explained well
2. Areas for Improvement - Specific points to enhance
3. Suggestions - Concrete ways to better understand and explain the concept

Format your response starting with the scores exactly as shown above, then provide the detailed feedback.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract scores for different dimensions
    const scores = {
      understanding: null,
      application: null,
      clarity: null
    };

    const scorePatterns = {
      understanding: /Understanding:\s*(\d+)/i,
      application: /Application:\s*(\d+)/i,
      clarity: /Clarity:\s*(\d+)/i
    };

    Object.entries(scorePatterns).forEach(([dimension, pattern]) => {
      const match = response.match(pattern);
      if (match) {
        scores[dimension] = parseInt(match[1], 10);
      }
    });

    res.json({
      success: true,
      feedback: response,
      scores
    });
  } catch (error) {
    console.error("Transcription processing failed:", error);
    res.status(500).json({ 
      error: "Failed to process explanation",
      message: error.message
    });
  }
});

// Update enhance-topic route to match frontend path
router.post('/enhance-topic', async (req, res) => {
  try {
    const { topic, title } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const response = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `
            I need to prepare to explain the following concept from ${title}:
            "${topic}"
            
            Provide me with:
            1. 3-4 key points I should address in my explanation (concise bullet points)
            2. 2-3 helpful examples or analogies I could use 
            
            Format as JSON with "keyPoints" array and "examples" array.
          `
        }]
      }]
    });
    
    const result = response.response.text();
    const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || 
                      result.match(/\{[\s\S]*\}/);
    
    let enhancedTopic;
    try {
      enhancedTopic = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : {
        keyPoints: ["Key point 1", "Key point 2", "Key point 3"],
        examples: ["Example 1", "Example 2"]
      };
    } catch (e) {
      console.error("Error parsing JSON from Gemini:", e);
      enhancedTopic = {
        keyPoints: ["Key point 1", "Key point 2", "Key point 3"],
        examples: ["Example 1", "Example 2"]
      };
    }
    
    res.json(enhancedTopic);
  } catch (error) {
    console.error('Error enhancing topic:', error);
    res.status(500).json({ error: 'Failed to enhance topic' });
  }
});

module.exports = router;