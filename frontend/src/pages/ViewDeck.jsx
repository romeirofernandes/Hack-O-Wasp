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
              <div className="grid gap-4">
                {deck.content.flashcards.map((card, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 className="font-bold mb-2 text-white">Q: {card.question}</h3>
                    <p className="text-gray-300">A: {card.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-6">
                {deck.content.quiz.map((question, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 className="font-bold mb-2 text-white">{question.question}</h3>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                          <input 
                            type="radio" 
                            name={`question-${index}`} 
                            className="mr-2 bg-white/10 border-white/20"
                          />
                          <label className="text-gray-300">{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}