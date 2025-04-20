import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewDeckDashboard = ({ userId }) => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        if (!userId) return;
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/decks/my-decks/${userId}`);
        setDecks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching decks:', error);
        setLoading(false);
      }
    };

    fetchDecks();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="animate-pulse flex space-y-4 flex-col">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {decks.length > 0 ? (
        decks.slice(0, 3).map((deck) => (
          <div
            key={deck._id}
            className="p-4 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10"
            onClick={() => navigate(`/deck/${deck._id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-medium">{deck.title}</h4>
                <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                  {deck.description || 'No description'}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    deck.isPublic ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {deck.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(deck.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className="text-white/50 hover:text-white transition-colors">→</span>
            </div>
          </div>
        ))
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-400 mb-4">No decks created yet.</p>
          <button
            onClick={() => navigate('/create-deck')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Create your first deck →
          </button>
        </div>
      )}
      {decks.length > 3 && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => navigate('/manage-decks')}
            className="text-white/70 hover:text-white transition-colors w-full text-center"
          >
            View all decks ({decks.length}) →
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewDeckDashboard;
