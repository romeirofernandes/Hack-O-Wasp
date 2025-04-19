const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require("pdf-parse");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post(
  "/",
  express.raw({ type: "application/pdf", limit: "10mb" }),
  async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: "No file data received" });
      }

      // Parse PDF to get raw text
      const pdfData = await pdf(req.body);
      const text = pdfData.text;

      // Initialize the Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Define the prompt to send to Gemini
      const prompt = `Analyze the following text and provide three separate sections:
    1. Bullet-point summary of key points (start each point with '•')
    2. A simple TL;DR explanation
    3. 5-6 flashcard-style Q&A pairs (format as 'Q:' and 'A:')

    Please format your response exactly like this:
    SUMMARY:
    • point 1
    • point 2
    etc.

    TLDR:
    your tldr text here

    FLASHCARDS:
    Q: question 1
    A: answer 1
    Q: question 2
    A: answer 2
    etc.

    Text to analyze: ${text}`;

      // Request content generation from the Gemini model
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log("Full response from Gemini:", response);  // Log full response

      // Initialize the sections object
      const sections = {
        summary: [],
        tldr: "",
        flashcards: [],
      };

      // Split the response into parts
      const parts = response.split("\n\n");

      parts.forEach((part) => {
        // Parse SUMMARY section
        if (part.startsWith("SUMMARY:")) {
          sections.summary = part
            .replace("SUMMARY:", "")
            .split("\n")
            .filter((line) => line.trim().startsWith("•"))
            .map((line) => line.trim().substring(1).trim());
        }
        // Parse TLDR section
        else if (part.startsWith("TLDR:")) {
          sections.tldr = part.replace("TLDR:", "").trim();
        }
        // Parse FLASHCARDS section
        else if (part.startsWith("FLASHCARDS:")) {
          const flashcardsText = part.replace("FLASHCARDS:", "").trim();
          const qa = flashcardsText.split("\n");

          // Debugging the flashcards text
          console.log("Raw flashcards text:", flashcardsText);
          
          // Safely process flashcards
          let tempFlashcards = [];
          for (let i = 0; i < qa.length - 1; i++) {
            // Check if a valid Q: and A: pair is found
            if (qa[i].startsWith("Q:") && qa[i + 1]?.startsWith("A:")) {
              tempFlashcards.push({
                question: qa[i].replace("Q:", "").trim(),
                answer: qa[i + 1].replace("A:", "").trim(),
              });
            }
          }

          // If multiple flashcards are found, push them to the sections
          if (tempFlashcards.length > 0) {
            sections.flashcards = tempFlashcards;
          } else {
            console.warn("No flashcards found in the response or invalid format.");
          }
        }
      });

      console.log("Parsed sections:", sections);  // Log parsed sections for debugging

      // Send the parsed data back to the frontend
      res.json({
        success: true,
        data: sections,
      });
    } catch (error) {
      console.error("Processing failed:", error);
      res.status(500).json({ error: "Failed to process document" });
    }
  }
);

module.exports = router;
