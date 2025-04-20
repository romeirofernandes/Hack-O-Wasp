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
  const [newFlashcard, setNewFlashcard] = useState({
    question: "",
    answer: "",
  });
  const [newQuizQuestion, setNewQuizQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

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
        authorId: user.uid, // This will now be properly set
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

  const addFlashcard = () => {
    if (newFlashcard.question && newFlashcard.answer) {
      setDeck((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          flashcards: [...prev.content.flashcards, newFlashcard],
        },
      }));
      setNewFlashcard({ question: "", answer: "" });
    }
  };

  const addQuizQuestion = () => {
    if (
      newQuizQuestion.question &&
      newQuizQuestion.options.every((opt) => opt)
    ) {
      setDeck((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          quiz: [...prev.content.quiz, newQuizQuestion],
        },
      }));
      setNewQuizQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      });
    }
  };

  const addBulletPoint = () => {
    setDeck((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        bullets: [...prev.content.bullets, ""],
      },
    }));
  };

  const updateBulletPoint = (index, value) => {
    setDeck((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        bullets: prev.content.bullets.map((bullet, i) =>
          i === index ? value : bullet
        ),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}


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

            <div>
              <label className="block mb-2 text-white/70">Bullet Points</label>
              {deck.content.bullets.map((bullet, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updateBulletPoint(index, e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30"
                    placeholder="Add a bullet point..."
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addBulletPoint}
                className="mt-2 px-4 py-2 text-sm bg-white/10 text-white rounded hover:bg-white/20"
              >
                Add Bullet Point
              </button>
            </div>

            <MermaidEditor onDiagramGenerated={addMermaidDiagram} />

            <div>
              <label className="block mb-2 text-white/70">Flashcards</label>
              {deck.content.flashcards.map((card, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-white/70">
                    Question: {card.question}
                  </p>
                  <p className="text-sm text-white/70">Answer: {card.answer}</p>
                </div>
              ))}
              <div className="space-y-2">
                <input
                  type="text"
                  value={newFlashcard.question}
                  onChange={(e) =>
                    setNewFlashcard({
                      ...newFlashcard,
                      question: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Question"
                />
                <input
                  type="text"
                  value={newFlashcard.answer}
                  onChange={(e) =>
                    setNewFlashcard({
                      ...newFlashcard,
                      answer: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Answer"
                />
                <button
                  type="button"
                  onClick={addFlashcard}
                  className="px-4 py-2 text-sm bg-white/10 text-white rounded hover:bg-white/20"
                >
                  Add Flashcard
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-white/70">Quiz Questions</label>
              {deck.content.quiz.map((q, index) => (
                <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-white/70">
                    Question: {q.question}
                  </p>
                  <div className="ml-4">
                    {q.options.map((opt, i) => (
                      <p key={i} className="text-sm text-white/70">
                        {i === q.correctAnswer ? "✓ " : ""}
                        {opt}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                <input
                  type="text"
                  value={newQuizQuestion.question}
                  onChange={(e) =>
                    setNewQuizQuestion({
                      ...newQuizQuestion,
                      question: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Question"
                />
                {newQuizQuestion.options.map((opt, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) =>
                        setNewQuizQuestion({
                          ...newQuizQuestion,
                          options: newQuizQuestion.options.map((o, i) =>
                            i === index ? e.target.value : o
                          ),
                        })
                      }
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewQuizQuestion({
                          ...newQuizQuestion,
                          correctAnswer: index,
                        })
                      }
                      className={`px-4 py-2 rounded ${
                        newQuizQuestion.correctAnswer === index
                          ? "bg-white/30 text-white"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      Correct
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuizQuestion}
                  className="px-4 py-2 text-sm bg-white/10 text-white rounded hover:bg-white/20"
                >
                  Add Quiz Question
                </button>
              </div>
            </div>

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
