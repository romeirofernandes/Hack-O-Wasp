import React, { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { ProcessedContent } from "../components/ProcessedContent";

const Upload = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);

  const handleUploadComplete = (data, name) => {
    setFileName(name);
    setLoading(false);
    if (data.error) {
      setError(data.error);
      setResults(null);
    } else {
      setError(null);
      setResults(data);
    }
  };

  return (
    <main className="mt-18 min-h-screen bg-[#080808] text-white p-8 pt-12">
      <div className="max-w-5xl mx-auto">
        {/* Add Back to Dashboard button */}
        <div className="mb-6">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Document Analysis</h1>

        <FileUpload
          onUploadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onUploadComplete={handleUploadComplete}
        />

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-white/20 border-l-white rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Processing your document...</p>
          </div>
        )}

        {results && <ProcessedContent results={results} />}
      </div>
    </main>
  );
};

export default Upload;
