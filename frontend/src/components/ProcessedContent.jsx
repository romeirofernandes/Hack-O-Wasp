import React, { useState } from "react";
import { auth } from "../firebase.config";
import axios from "axios";

export const ProcessedContent = ({ results, fileName }) => {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

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

  const handleSave = async () => {
    if (saved) return;
    try {
      setIsSaving(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const documentName = generateDocumentName(results.data);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/save-document`,
        {
          firebaseUID: user.uid,
          document: {
            name: documentName,
            content: results.data,
          },
        }
      );

      if (response.data.success) {
        setSaveSuccess(true);
        setSaved(true);
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
    { id: "summary", label: "🧾 Bullet Point Summary" },
    { id: "tldr", label: "🪄 TL;DR" },
    { id: "flashcards", label: "🃏 Flashcards" },
    { id: "quiz", label: "📝 Quiz" },
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

  return (
    <div className="mt-8 bg-white/5 rounded-lg p-6">
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full transition-colors whitespace-nowrap
              ${
                activeTab === tab.id
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className={`px-4 py-2 rounded-full transition-colors
            ${
              isSaving
                ? "bg-gray-500"
                : saveSuccess
                ? "bg-green-500"
                : "bg-white"
            }
            text-black`}
        >
          {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Document"}
        </button>
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
          <div className="space-y-4">
            {flashcards.map((card, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-lg p-4 space-y-2"
              >
                <p className="font-semibold text-white">Q: {card.question}</p>
                <p className="text-white/70">A: {card.answer}</p>
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
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
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
      </div>
    </div>
  );
};
