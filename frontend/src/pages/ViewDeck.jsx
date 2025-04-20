import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import MermaidRenderer from '../components/MermaidRenderer';

export default function ViewDeck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');

  // Add new state variables
  const [flippedCards, setFlippedCards] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    fetchDeck();
  }, [id]);

  const fetchDeck = async () => {
    try {
      const response = await api.get(`/api/decks/${id}`);
      setDeck(response.data);
    } catch (error) {
      console.error('Error fetching deck:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new handlers
  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    setShowExplanations(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  // Calculate score
  const calculateScore = () => {
    if (!deck?.content?.quiz?.length) return 0;
    const correct = deck.content.quiz.reduce((acc, question, index) => {
      return acc + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
    return Math.round((correct / deck.content.quiz.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-white/20 border-l-white rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading deck...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-[#080808] text-white pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-gray-400">Deck not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/decks")}
            className="mb-8 flex items-center text-white/70 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Decks
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">{deck.title}</h1>
            <p className="text-gray-400 mb-4">{deck.description}</p>
            <div className="text-sm text-gray-500">
              Created by {deck.author?.name} on {new Date(deck.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mb-6">
            <nav className="flex space-x-4 border-b border-white/10">
              {['notes', 'diagrams', 'flashcards', 'quiz'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 ${
                    activeTab === tab 
                      ? 'border-b-2 border-white text-white' 
                      : 'text-gray-400 hover:text-white/80'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {deck.content.notes.map((note, index) => (
                  <p key={index} className="text-gray-300">{note}</p>
                ))}
                {deck.content.bullets.map((bullet, index) => (
                  <li key={index} className="ml-4 text-gray-300">{bullet}</li>
                ))}
                {deck.content.tldr && (
                  <div className="bg-white/5 p-4 rounded-lg mt-4 border border-white/10">
                    <h3 className="font-bold mb-2 text-white">TLDR:</h3>
                    <p className="text-gray-300">{deck.content.tldr}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'diagrams' && (
              <div className="space-y-8">
                {deck.content.mermaidDiagrams.map((diagram, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="mb-4 text-gray-300">{diagram.description}</p>
                    <MermaidRenderer chart={diagram.code} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div className="grid gap-6">
                {deck.content.flashcards.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => toggleCard(index)}
                    className={`bg-white/5 p-6 rounded-lg border border-white/10 cursor-pointer transition-all duration-300 
                      ${flippedCards[index] ? 'shadow-lg' : ''}`}
                    style={{ perspective: '1000px', minHeight: '200px' }}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-300 transform-gpu 
                        ${flippedCards[index] ? 'rotate-y-180' : ''}`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front of card */}
                      <div
                        className={`absolute w-full h-full backface-hidden 
                          ${flippedCards[index] ? 'opacity-0' : 'opacity-100'}`}
                      >
                        <h3 className="text-xl font-semibold mb-3 text-white">Question:</h3>
                        <p className="text-gray-300">{card.question}</p>
                      </div>
                      
                      {/* Back of card */}
                      <div
                        className={`absolute w-full h-full backface-hidden rotate-y-180 
                          ${flippedCards[index] ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <h3 className="text-xl font-semibold mb-3 text-white">Answer:</h3>
                        <p className="text-gray-300">{card.answer}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="text-sm text-white/50">
                        {flippedCards[index] ? "Click to hide answer" : "Click to show answer"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-8">
                <div className="mb-6">
                  {score !== null && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-6">
                      <h3 className="text-xl font-semibold text-white">
                        Your Score: {score}%
                      </h3>
                    </div>
                  )}
                </div>
                
                {deck.content.quiz.map((question, index) => (
                  <div key={index} className="bg-white/5 p-6 rounded-lg border border-white/10">
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      {index + 1}. {question.question}
                    </h3>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleAnswerSelect(index, optIndex)}
                          className={`w-full text-left p-4 rounded-lg transition-colors ${
                            selectedAnswers[index] === optIndex
                              ? optIndex === question.correctAnswer
                                ? 'bg-green-500/20 border border-green-500'
                                : 'bg-red-500/20 border border-red-500'
                              : 'bg-white/10 hover:bg-white/20 border border-transparent'
                          }`}
                          disabled={showExplanations[index]}
                        >
                          <div className="flex items-center">
                            <span className="mr-3">{String.fromCharCode(65 + optIndex)}.</span>
                            <span className="text-gray-300">{option}</span>
                            {showExplanations[index] && optIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-400">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {showExplanations[index] && (
                      <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-sm text-blue-400 mb-1">Explanation:</p>
                        <p className="text-gray-300">
                          {question.explanation || `The correct answer is ${String.fromCharCode(65 + question.correctAnswer)}`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                {!score && deck.content.quiz.length > 0 && (
                  <button
                    onClick={() => setScore(calculateScore())}
                    className="w-full px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg font-medium transition-all"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}