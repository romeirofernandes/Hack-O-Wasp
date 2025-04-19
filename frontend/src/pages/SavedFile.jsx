import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';

const File = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [results, setResults] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  
  useEffect(() => {
    // Get document data from navigation state
    if (location.state?.document) {
      const doc = location.state.document;
      setDocument(doc);
      setResults({
        title: doc.name,
        data: doc.content
      });
    } else {
      // If no document data is provided, redirect to dashboard
      navigate('/dashboard');
    }
  }, [location.state, navigate]);
  
  if (!document || !results) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-2xl text-white">Loading document...</div>
      </div>
    );
  }
  
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
          summary: results.data.summary,
          tldr: results.data.tldr,
          title: results.title || "Document",
          flashcards: results.data.flashcards,
          quiz: results.data.quiz
        } 
      });
    } else {
      setActiveTab(tabId);
    }
  };

  // Extract document data
  const { summary, tldr, flashcards, quiz } = results.data || {};
  
  // Define available tabs
  const tabs = [
    { id: "summary", label: "📝 Summary" },
    { id: "tldr", label: "⚡ TLDR" },
    { id: "flashcards", label: "🔄 Flashcards" },
    { id: "quiz", label: "❓ Quiz" },
    { id: "tts", label: "🎤 Practice Speaking" }
  ];

  // Add a helper function to safely render quiz options
  const renderQuizOption = (option) => {
    if (typeof option === 'string') {
      return option;
    } else if (option && typeof option === 'object') {
      // If it's an object, try to get text, label, or stringify it
      return option.text || option.label || JSON.stringify(option);
    }
    return String(option || '');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mb-4 flex items-center text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{document.name}</h1>
              <div className="flex space-x-3">
                <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  Share
                </button>
                <button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors">
                  Download
                </button>
              </div>
            </div>
            <p className="text-gray-400 mt-1">
              Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
            </p>
          </div>
          
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
                <div>
                  <h2>Summary</h2>
                  <ul className="mt-4 space-y-4">
                    {summary.map((point, idx) => (
                      <li key={idx} className="bg-white/5 p-4 rounded-lg">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "tldr" && tldr && (
                <div>
                  <h2>TLDR</h2>
                  <div className="mt-4 bg-white/5 p-6 rounded-lg">
                    <p>{tldr}</p>
                  </div>
                </div>
              )}

              {activeTab === "flashcards" && flashcards?.length > 0 && (
                <div>
                  <h2>Flashcards</h2>
                  <div className="mt-4 space-y-6">
                    {flashcards.map((card, idx) => (
                      <div key={idx} className="bg-white/5 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">
                          Question:
                        </h3>
                        <p className="mb-6">{card.question}</p>
                        <details className="cursor-pointer">
                          <summary className="bg-white/10 p-3 rounded-md hover:bg-white/20 transition-colors">
                            Show Answer
                          </summary>
                          <div className="mt-4 p-4 bg-white/5 rounded-md">
                            <p>{card.answer}</p>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "quiz" && quiz?.length > 0 && (
                <div>
                  <h2>Knowledge Check</h2>
                  <div className="mt-4 space-y-8">
                    {quiz.map((question, questionIdx) => (
                      <div
                        key={questionIdx}
                        className="bg-white/5 p-6 rounded-lg"
                      >
                        <h3 className="text-xl font-semibold mb-4">
                          {questionIdx + 1}. {typeof question.question === 'string' ? 
                            question.question : 
                            (question.question?.text || 'Question')}
                        </h3>
                        <div className="space-y-3">
                          {Array.isArray(question.options) && question.options.map((option, optionIdx) => (
                            <button
                              key={optionIdx}
                              onClick={() =>
                                handleAnswerSelect(questionIdx, optionIdx)
                              }
                              className={`w-full text-left p-3 rounded-md transition-colors ${
                                selectedAnswers[questionIdx] === optionIdx
                                  ? (optionIdx === question.correctOptionIndex || 
                                     (option.isCorrect === true))
                                    ? "bg-green-500/30 border border-green-500"
                                    : "bg-red-500/30 border border-red-500"
                                  : "bg-white/10 hover:bg-white/20 border border-transparent"
                              }`}
                            >
                              {String.fromCharCode(65 + optionIdx)}
                              {". "}
                              {renderQuizOption(option)}
                            </button>
                          ))}
                        </div>

                        {showExplanations[questionIdx] && (
                          <div className="mt-4 p-4 rounded-md bg-white/5">
                            <p className="text-sm mb-1 text-blue-300">
                              Explanation:
                            </p>
                            <p>{typeof question.explanation === 'string' ? 
                              question.explanation : 
                              (question.explanation?.text || 'No explanation provided.')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!summary?.length && activeTab === "summary") ||
              (!tldr && activeTab === "tldr") ||
              (!flashcards?.length && activeTab === "flashcards") ||
              (!quiz?.length && activeTab === "quiz") ? (
                <div className="text-center py-20">
                  <p className="text-xl text-gray-500">
                    This section is empty. The AI couldn't generate content for this
                    section.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default File;
