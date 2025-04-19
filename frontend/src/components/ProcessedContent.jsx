import React, { useState } from "react";

export const ProcessedContent = ({ results }) => {
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", label: "🧾 Bullet Point Summary" },
    { id: "tldr", label: "🪄 TL;DR" },
    { id: "flashcards", label: "🃏 Flashcards" },
  ];

  // Early return if results or results.data is not available
  if (!results?.data) {
    return null;
  }

  const { summary, tldr, flashcards } = results.data;

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
      </div>

      <div className="prose prose-invert max-w-none">
        {activeTab === "summary" && summary && summary.length > 0 && (
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

        {activeTab === "flashcards" && flashcards && flashcards.length > 0 && (
          <div className="space-y-4">
            {flashcards.map((card, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-lg p-4 space-y-2 hover:bg-white/5 transition-colors"
              >
                <p className="font-semibold text-white">Q: {card.question}</p>
                <p className="text-white/70">A: {card.answer}</p>
              </div>
            ))}
          </div>
        )}

        {!summary?.length && !tldr && !flashcards?.length && (
          <div className="text-center text-white/50">
            No content available for this section
          </div>
        )}
      </div>
    </div>
  );
};
