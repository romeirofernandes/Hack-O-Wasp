# ClarityAI: Your AI-Powered Learning Companion

ClarityAI leverages the power of Google's Gemini AI to turn static documents (PDFs) into dynamic learning tools. Upload your notes, textbooks, or articles, and let ClarityAI generate concise summaries, TLDRs, flashcards, and quizzes to enhance your understanding and retention. Engage actively with the material using our unique Active Recall feature, powered by the Feynman Technique and speech-to-text technology, receiving AI-driven feedback on your explanations.

**Live Demo:** [https://clarity-ai-virid.vercel.app](https://clarityai.vercel.app)

---

## Features

*   **📄 Document Upload:** Upload PDF files directly through the web interface.

*   **🧠 AI-Powered Analysis:** Utilizes Google Gemini to process document text.

*   **📝 Summaries & TLDRs:** Get concise overviews and ultra-short summaries of your documents.

*   **🔄 Flashcards:** Automatically generate flashcards for key terms and concepts.

*   **❓ Quizzes:** Test your knowledge with multiple-choice quizzes, complete with correct answers and explanations.

*   **🎤 Active Recall (Feynman Technique):**
    *   Select a topic from your document or flashcards.

    *   Explain the concept in your own words using speech-to-text.

    *   Receive AI-generated feedback on your understanding, clarity, and application, along with scores and suggestions.

*   **🗓️ Spaced Repetition:** Review questions you previously struggled with in dedicated revision sessions.

*   **💾 Save & Manage:** Save processed documents to your account and access them later.

*   **🔒 Authentication:** Secure user accounts using Firebase Authentication.

*   **✨ Interactive UI:** Clean and modern user interface built with React and Tailwind CSS, featuring animations.

---

## Tech Stack

*   **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose
*   **AI:** Google Generative AI (Gemini 2.0 Flash)
*   **Authentication:** Firebase Authentication
*   **PDF Parsing:** `pdf-parse`
*   **Speech Recognition:** Web Speech API

---

## Environment Variables

### Backend (`backend/.env`)

*   `MONGO_URI`: Your MongoDB connection string.
*   `GEMINI_API_KEY`: Your API key from Google AI Studio.
*   `PORT`: The port the backend server will run on (e.g., 5000).

### Frontend (`frontend/.env`)

*   `VITE_API_URL`: The full URL of your running backend (e.g., `http://localhost:8000`).
*   `VITE_FIREBASE_API_KEY`: Your Firebase project's API Key.
*   `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase project's Auth Domain.
*   `VITE_FIREBASE_PROJECT_ID`: Your Firebase project's Project ID.
*   `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase project's Storage Bucket.
*   `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase project's Messaging Sender ID.
*   `VITE_FIREBASE_APP_ID`: Your Firebase project's App ID.

---

## Team

*   **[Romeiro Fernandes]** - [GitHub Profile Link](https://github.com/romeirofernandes)
*   **[Russel Daniel Paul]** - [GitHub Profile Link](https://github.com/wrestle-R)
*   **[Dylan Mascarenhas]** - [GitHub Profile Link](https://github.com/flashrod)

---
