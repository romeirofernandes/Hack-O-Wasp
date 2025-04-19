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
    <main className="mt-18 min-h-screen bg-[#080808] text-white p-8 pt-8">
      <div className="max-w-4xl mx-auto">
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
