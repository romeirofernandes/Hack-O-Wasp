import React, { useState } from "react";
import { auth } from "../firebase.config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SpeechToTextEmbed } from "./SpeechToTextEmbed"; // Add this import

export const ProcessedContent = ({ results, fileName }) => {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [flippedCards, setFlippedCards] = useState({});
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");

  const generateDocumentName = (content) => {
    if (content.tldr) {
      // Use first few words of TLDR as title
      const title = content.tldr.split(" ").slice(0, 5).join(" ");
      return `${title}...`;
    } else if (content.summary && content.summary[0]) {
      // Use first bullet point if no TLDR
      const title = content.summary[0].split(" ").slice(0, 5).join(" ");
      return `${title}...`;
    }
    // Fallback to timestamp if no content to generate title from
    return `Document_${new Date().toISOString().split("T")[0]}`;
  };

  const openSaveModal = () => {
    setDocumentName(generateDocumentName(results.data));
    setIsNameModalOpen(true);
  };

  const handleSave = async () => {
    if (saved) return;
    try {
      setIsSaving(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const apiBaseUrl = import.meta.env.VITE_API_URL || "";
      const endpoint = "/api/users/save-document";
      const apiUrl = `${apiBaseUrl}${endpoint}`;

      const response = await axios.post(apiUrl, {
        firebaseUID: user.uid,
        document: {
          name: documentName,
          content: results.data,
        },
      });

      if (response.data.success) {
        setSaveSuccess(true);
        setSaved(true);
        setIsNameModalOpen(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving document:", error);
      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "summary", label: "📝 Summary" },
    { id: "tldr", label: "⚡ TLDR" },
    { id: "flashcards", label: "🔄 Flashcards" },
    { id: "quiz", label: "❓ Quiz" },
    { id: "feynman", label: "🎤 Practice Speaking" }  // Changed from "tts"
  ];

  if (!results?.data) {
    return null;
  }

  const { summary, tldr, flashcards, quiz } = results.data;

  // Debug logging
  console.log("Received data:", {
    summary: summary?.length,
    tldr: tldr?.length,
    flashcards: flashcards?.length,
    quiz: quiz?.length,
  });

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
    setShowExplanations((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));
  };

  const handleTabClick = (tabId) => {
    // Remove navigation logic and just set the active tab
    setActiveTab(tabId);
  };

  const toggleCard = (idx) => {
    setFlippedCards(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const renderSaveModal = () => {
    if (!isNameModalOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 w-[400px]">
          <h3 className="text-xl font-semibold mb-4">Save Document</h3>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Enter document name"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white mb-4 focus:ring-blue-500/30 focus:border-blue-500/30"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsNameModalOpen(false)}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !documentName.trim()}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 bg-white/5 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {!saved ? (
          <button
            onClick={openSaveModal}
            className="px-6 py-2 rounded-full transition-all flex items-center gap-2 bg-white hover:bg-gray-200 text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z" />
              <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm10 0H6v12h8V4z" />
            </svg>
            Save Document
          </button>
        ) : saveSuccess ? (
          <div className="text-green-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Saved Successfully
          </div>
        ) : null}
      </div>

      <div className="prose prose-invert max-w-none">
        {activeTab === "summary" && summary?.length > 0 && (
          <ul className="list-disc pl-4 space-y-2">
            {summary.map((point, idx) => (
              <li key={idx} className="text-white/90">
                {point}
              </li>
            ))}
          </ul>
        )}

        {activeTab === "tldr" && tldr && (
          <p className="text-lg text-white/90">{tldr}</p>
        )}

        {activeTab === "flashcards" && flashcards?.length > 0 && (
          <div className="space-y-6">
            {flashcards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => toggleCard(idx)}
                className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 transition-all hover:bg-white/10 cursor-pointer relative min-h-[150px] ${
                  flippedCards[idx] ? 'shadow-lg' : ''
                }`}
              >
                <div className={`transition-all duration-300 ${
                  flippedCards[idx] ? 'opacity-0' : 'opacity-100'
                }`}>
                  <h3 className="text-xl font-semibold mb-3">Question:</h3>
                  <p className="text-white/90">{card.question}</p>
                </div>
                
                <div className={`absolute inset-0 p-6 transition-all duration-300 rounded-xl ${
                  flippedCards[idx] 
                    ? 'opacity-100 transform translate-y-0 bg-white/5 backdrop-blur-sm border border-white/10' 
                    : 'opacity-0 transform translate-y-4'
                }`}>
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">Answer:</h3>
                  <p className="text-white/90">{card.answer}</p>
                </div>

                <div className="absolute bottom-4 right-4">
                  <span className="text-sm text-white/50">
                    {flippedCards[idx] ? 'Click to hide answer' : 'Click to reveal answer'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "quiz" && quiz?.length > 0 && (
          <div className="space-y-8">
            {quiz.map((question, qIndex) => (
              <div
                key={qIndex}
                className="border border-white/10 rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  {qIndex + 1}. {question.question}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                      disabled={showExplanations[qIndex]}
                      className={`w-full text-left p-3 rounded-lg text-white transition-colors ${
                        selectedAnswers[qIndex] === oIndex
                          ? option.isCorrect
                            ? "bg-green-500/20 border-green-500/50"
                            : "bg-red-500/20 border-red-500/50"
                          : showExplanations[qIndex] && option.isCorrect
                          ? "bg-green-500/20 border-green-500/50"
                          : "bg-white/5 hover:bg-white/10"
                      } border border-white/10`}
                    >
                      <span className="font-semibold mr-2">
                        {option.label}.
                      </span>
                      {option.text}
                      {showExplanations[qIndex] && option.isCorrect && (
                        <span className="ml-2 text-green-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {showExplanations[qIndex] && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      question.options[selectedAnswers[qIndex]]?.isCorrect
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    } border`}
                  >
                    <p className="text-sm font-semibold mb-2">
                      Correct Answer: {question.correctAnswer}
                    </p>
                    <p className="text-sm text-white/80">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "feynman" && (
          <div>
            <SpeechToTextEmbed 
              summary={summary}
              tldr={tldr}
              title={results.title || "Document"}
              flashcards={flashcards}
            />
          </div>
        )}

      </div>
      {renderSaveModal()}
    </div>
  );
};
