import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase.config";
import axios from 'axios';

const ManageDecks = () => {
  const [decks, setDecks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deletingDeck, setDeletingDeck] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
      fetchDecks(currentUser.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDecks = async (userId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/decks/my-decks/${userId}`);
      setDecks(response.data);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (deckId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/decks/${deckId}`);
      fetchDecks(user.uid);
      setDeletingDeck(null);
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!user || !editingDeck) return;
    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/decks/${editingDeck._id}`, {
        ...formData,
        authorId: user.uid
      });
      await fetchDecks(user.uid);
      setShowCreateForm(false);
      setEditingDeck(null);
      resetForm();
    } catch (error) {
      console.error('Error updating deck:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/decks`, {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic,
        authorId: user.uid,
        content: {
          notes: [""],
          mermaidDiagrams: [],
          bullets: [""],
          tldr: "",
          flashcards: [],
          quiz: [],
        }
      });

      if (response.data) {
        await fetchDecks(user.uid);
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating deck:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isPublic: false
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pt-28">
      {/* Back to Dashboard Button */}
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
        <h1 className="text-3xl font-bold text-white">Manage Your Decks</h1>
        <button
          onClick={() => {
            navigate("/create-deck");
          }}
          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-all"
        >
          Create New Deck
        </button>
      </div>

      {/* Decks List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center text-white">Loading decks...</div>
        ) : decks.length > 0 ? (
          decks.map((deck) => (
            <div
              key={deck._id}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 flex justify-between items-start"
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{deck.title}</h3>
                <p className="text-gray-400 mt-1">{deck.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-sm px-2 py-1 rounded ${
                    deck.isPublic ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {deck.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span className="text-sm text-gray-400">
                    Created: {new Date(deck.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/deck/${deck._id}`)}
                  className="bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded-lg border border-white/10 transition-all"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    setEditingDeck(deck);
                    setFormData({
                      title: deck.title,
                      description: deck.description,
                      isPublic: deck.isPublic
                    });
                    setShowCreateForm(true);
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded-lg border border-white/10 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingDeck(deck)}
                  className="bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-3 py-1 rounded-lg border border-white/10 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            No decks found. Create your first deck!
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {editingDeck ? 'Edit Deck' : 'Create New Deck'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingDeck(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {/* Edit/Create Form */}
              <form onSubmit={editingDeck ? handleEdit : handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Deck Title"
                  className="w-full bg-white/10 p-3 rounded-lg text-white placeholder-gray-400 border border-white/20 focus:border-blue-500 outline-none"
                  required
                />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  className="w-full bg-white/10 p-3 rounded-lg text-white placeholder-gray-400 border border-white/20 focus:border-blue-500 outline-none min-h-[100px]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="bg-white/10 rounded"
                  />
                  <label htmlFor="isPublic" className="text-white">Make this deck public</label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : (editingDeck ? 'Update Deck' : 'Create Deck')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingDeck(null);
                      resetForm();
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDeck && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Deck</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{deletingDeck.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingDeck(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingDeck._id)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg border border-red-500/20 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDecks;
