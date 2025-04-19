import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProcessedContent = ({ results }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

  const tabs = [
    { id: "summary", label: "🧾 Bullet Point Summary" },
    { id: "tldr", label: "🪄 TL;DR" },
    { id: "flashcards", label: "🃏 Flashcards" },
    { id: "quiz", label: "📝 Quiz" },
    { id: "tts", label: "🎙️ Text to Speech" },
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
    if (tabId === "tts") {
      // Navigate to the speech-to-text page with the necessary data
      navigate("/speech-to-text", { 
        state: { 
          summary,
          tldr,
          title: results.title || "Document",
          flashcards,
          quiz
        } 
      });
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="mt-8 bg-white/5 rounded-lg p-6">
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
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
