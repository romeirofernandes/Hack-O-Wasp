import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import axios from 'axios';

const AllSavedFiles = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchDocuments(currentUser.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDocuments = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/documents`
      );
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = async (documentId) => {
    if (!user) return;
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${user.uid}/documents/${documentId}`
      );
      if (response.data.success) {
        navigate("/file", { state: { document: response.data.document } });
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  const filteredDocuments = documents
    .filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mb-4 flex items-center text-white/70 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">All Saved Files</h1>
          </div>

          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow md:max-w-md">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30 pr-10"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            
            <div className="flex items-center">
              <label className="text-sm text-gray-400 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg text-white py-2 px-3 focus:ring-white/30 focus:border-white/30"
                style={{ colorScheme: 'dark' }}
              >
                <option value="newest" className="bg-gray-800">Newest</option>
                <option value="oldest" className="bg-gray-800">Oldest</option>
                <option value="name" className="bg-gray-800">Name</option>
              </select>
            </div>
          </div>

          {filteredDocuments.length > 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              {filteredDocuments.map((doc) => (
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
                    <span className="text-sm bg-white/10 px-2 py-1 rounded text-gray-300">
                      {doc.type || "PDF"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
              <p className="text-gray-400 mb-4">No documents found.</p>
              <button
                onClick={() => navigate("/upload")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-full font-medium"
              >
                Upload a Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllSavedFiles;
