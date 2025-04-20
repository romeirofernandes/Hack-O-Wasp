import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { ProcessedContent } from "../components/ProcessedContent";
import axios from "axios";
import ViewDeckDashboard from '../components/ViewDeckDashboard';
import ManageDecks from './ManageDecks';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const modalRef = useRef(null); // ← Added ref for modal
  const [stats, setStats] = useState({
    totalDocuments: 0,
    masteredCards: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  // Add delete handler function
  const handleDeleteDocument = async (documentId, e) => {
    e.stopPropagation(); // Prevent triggering document click
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/users/${
          user.uid
        }/documents/${documentId}`
      );
      if (response.data.success) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const updateStreak = async () => {
    try {
      if (user) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/streak/updateStreak`,
          { userId: user.uid }
        );
        if (response.data.success) {
          const oldStreak = stats.currentStreak;
          const newStreak = response.data.streak.currentStreak;

          if (newStreak > oldStreak) {
            console.log(
              `[Streak Frontend] 🔥 Streak increased from ${oldStreak} to ${newStreak} days!`
            );
          }

          setStats((prev) => ({
            ...prev,
            currentStreak: newStreak,
            longestStreak: response.data.streak.longestStreak,
          }));
        }
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  // Add an object to track key activities
  const KEY_ACTIVITIES = {
    UPLOAD: "upload",
    QUIZ: "quiz",
    REVISION: "revision",
    VIEW_DOCUMENT: "view_document",
    COMPLETE_QUIZ: "complete_quiz",
    PRACTICE_CARDS: "practice_cards",
  };

  // Modify the handleQuickActionClick function
  const handleQuickActionClick = async (action) => {
    try {
      await updateStreak();
      switch (action) {
        case KEY_ACTIVITIES.UPLOAD:
          navigate("/upload");
          break;
        case KEY_ACTIVITIES.QUIZ:
          navigate("/quiz");
          break;
        case KEY_ACTIVITIES.REVISION:
          navigate("/revision");
          break;
        case KEY_ACTIVITIES.PRACTICE_CARDS:
          navigate("/flashcards");
          break;
      }
    } catch (error) {
      console.error("Error handling quick action:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (user) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/users/${user.uid}/documents`
          );
          if (response.data.success) {
            setDocuments(response.data.documents);
          }
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    if (user) {
      fetchDocuments();
    }
  }, [user]);

  // Add handler for document viewing
  const handleDocumentClick = async (documentId) => {
    try {
      await updateStreak(); // Count document viewing as a key activity
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${
          user.uid
        }/documents/${documentId}`
      );
      if (response.data.success) {
        // Navigate to file page instead of opening modal
        navigate("/file", { state: { document: response.data.document } });
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  // Fix the handleViewAllClick function to avoid passing non-serializable objects
  const handleViewAllClick = () => {
    // Instead of passing complex objects, just navigate to the page
    // The AllSavedFiles component will fetch the documents itself
    navigate("/all-files");
  };

  // Get only the most recent 3 documents for the dashboard
  const recentDocuments = documents.slice(0, 3);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user) {
          // Fetch both general stats and streak stats
          const [statsResponse, streakResponse] = await Promise.all([
            axios.get(
              `${import.meta.env.VITE_API_URL}/api/users/${user.uid}/stats`
            ),
            axios.get(`${import.meta.env.VITE_API_URL}/api/streak/${user.uid}`),
          ]);

          setStats((prev) => ({
            ...prev,
            ...statsResponse.data.stats,
            currentStreak: streakResponse.data.streak.currentStreak || 0,
            longestStreak: streakResponse.data.streak.longestStreak || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  // Add tooltip to show streak info
  const getStreakTooltip = () => {
    return `Complete any of these activities daily to maintain your streak:
    • Upload new study material
    • Take a quiz
    • Review flashcards
    • Study saved documents
    • Practice revision`;
  };

  // Update the streak display
  const StreakDisplay = () => (
    <div className="bg-white/5 p-4 rounded-lg">
      <p className="text-gray-400 text-sm">Current Streak</p>
      <p className="text-2xl font-bold text-white group relative">
        <span>{stats.currentStreak || 0}</span> days
        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs p-2 rounded whitespace-pre-line w-48">
          {getStreakTooltip()}
        </span>
      </p>
      <p className="text-xs text-gray-400">
        Best: {stats.longestStreak || 0} days
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mt-16 relative min-h-screen bg-[#080808] flex flex-col">
      <div className="container relative z-10 mx-auto px-4 py-14 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-white">Your Dashboard</h2>

          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl text-white">
                  {user?.displayName?.charAt(0) ||
                    user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  {user?.displayName}
                </h3>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Documents</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalDocuments}
                </p>
              </div>
              <StreakDisplay />
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Mastered Cards</p>
                <p className="text-2xl font-bold text-white">
                  {stats.masteredCards}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => handleQuickActionClick("upload")}
              className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all"
            >
              <div className="text-white text-lg mb-2 font-medium">Upload</div>
              <p className="text-gray-400 text-sm">
                Import notes, PDFs or videos
              </p>
              <div className="mt-4 text-white/50 group-hover:text-white transition-colors">
                →
              </div>
            </button>
            <button
              onClick={() => navigate("/decks")}
              className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all"
            >
              <div className="text-white text-lg mb-2 font-medium">Decks</div>
              <p className="text-gray-400 text-sm">
                Create and explore study decks
              </p>
              <div className="mt-4 text-white/50 group-hover:text-white transition-colors">
                →
              </div>
            </button>
            <button
              onClick={() => handleQuickActionClick("revision")}
              className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all"
            >
              <div className="text-white text-lg mb-2 font-medium">Revise</div>
              <p className="text-gray-400 text-sm">
                Practice previous concepts
              </p>
              <div className="mt-4 text-white/50 group-hover:text-white transition-colors">
                →
              </div>
            </button>
          </div>

          {/* Recent Uploads */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-white">
                  📁 Recent uploads
                </h3>
                <button
                  onClick={handleViewAllClick}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  View all
                </button>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                {recentDocuments.length > 0 ? (
                  recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="p-4 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium">{doc.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          {doc.type || "PDF"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-400">
                    No uploads yet. Add your first document!
                  </div>
                )}
                <div className="p-4 border-t border-white/10">
                  <button
                    onClick={() => navigate("/upload")}
                    className="text-white hover:text-white/80 transition-colors w-full text-center flex items-center justify-center gap-2"
                  >
                    <span>Upload new file</span>
                    <span>+</span>
                  </button>
                </div>
              </div>

              {selectedDocument && (
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={(e) => {
                    if (
                      modalRef.current &&
                      !modalRef.current.contains(e.target)
                    ) {
                      setSelectedDocument(null);
                    }
                  }}
                >
                  <div
                    ref={modalRef}
                    className="bg-[#121212] mt-18 rounded-xl z-100 p-6 max-w-4xl w-full max-h-[75vh] overflow-y-auto relative"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-semibold text-white">
                        {selectedDocument.name}
                      </h3>
                      <button
                        onClick={() => setSelectedDocument(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <ProcessedContent
                      results={{ data: selectedDocument.content }}
                      saved={true}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Second column with recent decks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-white">
                  📚 Recent Decks
                </h3>
                <button
                  onClick={() => navigate("/manage-decks")}
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                >
                  Manage Decks
                  <span className="text-lg">→</span>
                </button>
              </div>
              <ViewDeckDashboard userId={user?.uid} />
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} ClarityAI. All rights reserved.
          </div>
          <div className="text-gray-400 text-sm">Crafted by Team Mbappe</div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
