import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";
import api from "../utils/axios";
import MermaidEditor from "../components/MermaidEditor";

export default function CreateDeck() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deck, setDeck] = useState({
    title: "",
    description: "",
    isPublic: true,
    content: {
      notes: [""],
      mermaidDiagrams: [],
      bullets: [""],
      tldr: "",
      flashcards: [],
      quiz: [],
    },
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
      console.log("Current user UID:", currentUser.uid); // Debug log
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please login first");
      return;
    }

    try {
      console.log("Sending request with UID:", user.uid); // Debug log
      const response = await api.post("/api/decks", {
        ...deck,
        authorId: user.uid // This will now be properly set
      });
      if (response.data) {
        navigate(`/deck/${response.data._id}`);
      }
    } catch (error) {
      console.error("Error creating deck:", error);
      setError(error.response?.data?.error || "Failed to create deck");
    }
  };

  const addMermaidDiagram = (description, code) => {
    setDeck((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        mermaidDiagrams: [
          ...prev.content.mermaidDiagrams,
          { description, code },
        ],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
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

          <h1 className="text-3xl font-bold mb-8 text-white">
            Create New Deck
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-white/70">Title</label>
              <input
                type="text"
                value={deck.title}
                onChange={(e) => setDeck({ ...deck, title: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30"
                required
                placeholder="Enter deck title..."
              />
            </div>

            <div>
              <label className="block mb-2 text-white/70">Description</label>
              <textarea
                value={deck.description}
                onChange={(e) =>
                  setDeck({ ...deck, description: e.target.value })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30"
                rows="3"
                placeholder="Describe your deck..."
              />
            </div>

            <div>
              <label className="block mb-2 text-white/70">Notes</label>
              <textarea
                value={deck.content.notes[0]}
                onChange={(e) =>
                  setDeck({
                    ...deck,
                    content: {
                      ...deck.content,
                      notes: [e.target.value],
                    },
                  })
                }
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30"
                rows="5"
                placeholder="Add your study notes here..."
              />
            </div>

            <MermaidEditor onDiagramGenerated={addMermaidDiagram} />

            <div className="flex items-center space-x-3 py-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={deck.isPublic}
                onChange={(e) =>
                  setDeck({ ...deck, isPublic: e.target.checked })
                }
                className="w-4 h-4 border-white/20 rounded bg-white/10"
              />
              <label htmlFor="isPublic" className="text-white/70">
                Make deck public
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-full font-medium transition-all"
              >
                Create Deck
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
