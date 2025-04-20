import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import DeckCard from "../components/DeckCard";

export default function Decks() {
  const [decks, setDecks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await api.get("/api/decks/public");
      setDecks(response.data);
    } catch (error) {
      console.error("Error fetching decks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDecks = decks.filter(
    (deck) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  console.log(decks)
  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard")}
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
            Back to Dashboard
          </button>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Study Decks</h1>
            <Link
              to="/create-deck"
              className="px-6 py-2 bg-white text-black hover:bg-gray-100 rounded-full font-medium transition-all"
            >
              Create New Deck
            </Link>
          </div>

          {/* Search Box */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search decks..."
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-3 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-white/20 border-l-white rounded-full mx-auto mb-4" />
              <p className="text-gray-400">Loading decks...</p>
            </div>
          ) : filteredDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks.map((deck) => (
                  
                <DeckCard key={deck._id} deck={deck} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400 mb-4">No decks found</p>
              <Link
                to="/create-deck"
                className="px-6 py-2 bg-white text-black hover:bg-gray-100 rounded-full font-medium transition-all inline-block"
              >
                Create Your First Deck
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
