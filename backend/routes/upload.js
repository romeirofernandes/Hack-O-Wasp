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

      const pdfData = await pdf(req.body);
      const text = pdfData.text;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Analyze the following text and provide six separate sections:
1. Bullet-point summary of key points (start each point with '•')
2. A simple TL;DR explanation
3. 5-6 flashcard-style Q&A pairs (format as 'Q:' and 'A:')
4. QUIZ TIME
   - Each question:
     - Has 4 options
     - Instant feedback on selection
     - Bonus: "Why this is correct" explanations
5. ✅ Correct Answers


Please format your response exactly like this:

SUMMARY:
* point 1  
* point 2  
* etc.

TLDR:
your tldr text here

FLASHCARDS:
Q: question 1  
A: answer 1

Q: question 2  
A: answer 2  
(and generate at least 5 total cards)

QUIZ TIME:
Q1. Question text?  
A. Option A  
B. Option B  
C. Option C ✅  
D. Option D  

Correct Answer: C  
Why this is correct: Explanation here

(Repeat for 5 questions)

✅ Correct Answers:
1. C  
2. A  
3. ...

Text to analyze: ${text}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log("Raw response from Gemini:", response); // Debug log

      // Improved parsing logic
      const sections = {
        summary: [],
        tldr: "",
        flashcards: [],
        quiz: [],
        answers: [],
      };

      // Extract summary
      const summaryMatch = response.match(/SUMMARY:([\s\S]*?)(?=\n\nTLDR:|$)/);
      if (summaryMatch && summaryMatch[1]) {
        sections.summary = summaryMatch[1]
          .split("\n")
          .filter((line) => line.trim().startsWith("*"))
          .map((line) => line.trim().substring(1).trim());
      }

      // Extract TLDR
      const tldrMatch = response.match(/TLDR:([\s\S]*?)(?=\n\nFLASHCARDS:|$)/);
      if (tldrMatch && tldrMatch[1]) {
        sections.tldr = tldrMatch[1].trim();
      }

      // Extract flashcards
      const flashcardsMatch = response.match(
        /FLASHCARDS:([\s\S]*?)(?=\n\nQUIZ TIME:|$)/
      );
      if (flashcardsMatch && flashcardsMatch[1]) {
        const flashcardsContent = flashcardsMatch[1].trim();
        const qaPairs = flashcardsContent.split(/\n\nQ:|\nQ:/).filter(Boolean);

        qaPairs.forEach((pair) => {
          let qaPair = pair;
          if (!pair.startsWith("Q:")) {
            qaPair = "Q:" + pair;
          }

          const parts = qaPair.split(/\nA:|A:/);
          if (parts.length >= 2) {
            const question = parts[0].replace("Q:", "").trim();
            const answer = parts[1].trim();
            sections.flashcards.push({ question, answer });
          }
        });
      }

      // Extract quiz questions
      const quizMatch = response.match(
        /QUIZ TIME:([\s\S]*?)(?=\n\n✅ Correct Answers:|$)/
      );
      if (quizMatch && quizMatch[1]) {
        const quizContent = quizMatch[1].trim();
        const questions = quizContent
          .split(/\n\nQ\d+\.|\nQ\d+\./)
          .filter(Boolean);

        let questionCounter = 0;
        questions.forEach((q) => {
          questionCounter++;
          const lines = q
            .trim()
            .split("\n")
            .filter((line) => line.trim());

          if (lines.length < 5) return; // Skip if not enough lines for a complete question

          const questionText = lines[0].trim();
          const options = [];

          // Find the options (A-D)
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const optionMatch = line.match(/^([A-D])\.\s*(.*)/);

            if (optionMatch) {
              options.push({
                text: optionMatch[2].replace("✅", "").trim(),
                isCorrect: line.includes("✅"),
                label: optionMatch[1],
              });
            }
          }

          // Extract correct answer and explanation
          let correctAnswer = "";
          let explanation = "";

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("Correct Answer:")) {
              correctAnswer = lines[i].replace("Correct Answer:", "").trim();
            }
            if (lines[i].startsWith("Why this is correct:")) {
              explanation = lines[i].replace("Why this is correct:", "").trim();
            }
          }

          if (questionText && options.length >= 3) {
            // Allow for some flexibility in the number of options
            sections.quiz.push({
              question: questionText,
              options,
              correctAnswer,
              explanation,
            });
          }
        });
      }

      // Extract correct answers section
      const answersMatch = response.match(/✅ Correct Answers:([\s\S]*?)$/);
      if (answersMatch && answersMatch[1]) {
        const answersContent = answersMatch[1].trim();
        const answerLines = answersContent.split("\n").filter(Boolean);

        answerLines.forEach((line) => {
          const answerMatch = line.match(/(\d+)\.\s*([A-D])/);
          if (answerMatch) {
            sections.answers.push({
              question: parseInt(answerMatch[1]),
              answer: answerMatch[2],
            });
          }
        });
      }

      // Add detailed debug logging
      console.log("Parsed sections details:", {
        summary: `Found ${sections.summary.length} bullet points`,
        tldr: `TLDR length: ${sections.tldr.length} chars`,
        flashcards: `Found ${sections.flashcards.length} flashcards`,
        flashcardsData: sections.flashcards.map((f) => ({
          q: f.question.slice(0, 30) + "...",
        })),
        quiz: `Found ${sections.quiz.length} quiz questions`,
        quizData: sections.quiz.map((q) => ({
          q: q.question.slice(0, 30) + "...",
        })),
        answers: `Found ${sections.answers.length} correct answers`,
      });

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
