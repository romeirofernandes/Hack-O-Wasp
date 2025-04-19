import { useState } from "react";
import axios from "axios";

const OcrUploader = ({ onTextProcessed }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setText(""); // Clear previous text
    setError(null); // Clear errors
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ocr`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200 && res.data.text) {
        setText(res.data.text);
        if (onTextProcessed) onTextProcessed(res.data.text);
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response) {
        setError(`Server Error: ${err.response.data.message || "Unknown error"}`);
      } else if (err.request) {
        setError("Network Error: Please check your connection.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
      <div className="mb-6">
        <label className="block text-white mb-2 text-lg font-semibold">
          Upload Handwritten Note (PDF or Image):
        </label>
        <input
          type="file"
          accept="application/pdf, image/*"
          onChange={handleFileChange}
          className="block w-full text-white bg-transparent border border-white/10 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 w-full mt-6"
      >
        {loading ? "Processing..." : "Transcribe Text"}
      </button>

      {error && (
        <div className="mt-6 text-red-600">
          <p>{error}</p>
        </div>
      )}

      {text && (
        <div className="mt-6 bg-white/10 p-6 rounded-xl text-white">
          <h3 className="text-2xl font-semibold mb-4">Transcribed Text</h3>
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
};

export default OcrUploader;
