import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { ProcessedContent } from "../components/ProcessedContent";
import axios from "axios";

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
    daysActive: 0
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

  const handleDocumentClick = async (documentId) => {
    try {
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
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/users/${user.uid}/stats`
          );
          if (response.data.success) {
            setStats(response.data.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

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
                <p className="text-2xl font-bold text-white">{stats.totalDocuments}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Days Active</p>
                <p className="text-2xl font-bold text-white">{stats.daysActive}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Mastered Cards</p>
                <p className="text-2xl font-bold text-white">{stats.masteredCards}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 className="text-2xl font-semibold mb-4 text-white">
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => navigate("/upload")}
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
            <button className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all">
              <div className="text-white text-lg mb-2 font-medium">Quiz</div>
              <p className="text-gray-400 text-sm">Test your knowledge</p>
              <div className="mt-4 text-white/50 group-hover:text-white transition-colors">
                →
              </div>
            </button>
            <button 
              onClick={() => navigate("/revision")}
              className="group bg-white/5 hover:bg-white/10 p-6 rounded-xl border border-white/10 transition-all"
            >
              <div className="text-white text-lg mb-2 font-medium">Revise</div>
              <p className="text-gray-400 text-sm">Practice previous concepts</p>
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
                  className="text-gray-400 hover:text-white text-sm">
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
                        <span className="text-sm text-gray-400">{doc.type || "PDF"}</span>
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
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} ClarityAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
