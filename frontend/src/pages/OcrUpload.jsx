import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import OcrUploader from "../components/OCRuploader"; // Import your OCR Uploader component
import axios from "axios";

const OcrUpload = () => {
  const [ocrText, setOcrText] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const modalRef = useRef(null); // Ref for modal if necessary

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  const handleTextProcessed = (text) => {
    setOcrText(text); // Set OCR text
  };

  return (
    <div className="mt-16 relative min-h-screen bg-[#080808] flex flex-col">
      <div className="container relative z-10 mx-auto px-4 py-14 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-white">OCR Upload</h2>

          {/* User Profile Card */}
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
          </div>

          {/* OCR Upload Section */}
          <h3 className="text-2xl font-semibold mb-4 text-white">Upload Handwritten Notes</h3>

          <OcrUploader onTextProcessed={handleTextProcessed} />

          {ocrText && (
            <div className="mt-8 bg-white/10 p-6 rounded text-white">
              <h2 className="text-2xl font-semibold mb-4">OCR Result:</h2>
              <pre className="whitespace-pre-wrap">{ocrText}</pre>
            </div>
          )}
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

export default OcrUpload;
