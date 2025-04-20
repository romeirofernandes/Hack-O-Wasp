import React, { useState } from "react";
import api from "../utils/axios";

export default function MermaidEditor({ onDiagramGenerated }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateDiagram = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/decks/generate-mermaid", {
        description,
      });

      // Extract the mermaid code from the response
      // The response will be in ```mermaid ... ``` format
      const mermaidCode = response.data.code;

      // Pass both description and code to parent
      onDiagramGenerated(description, mermaidCode);
      setDescription(""); // Clear input after successful generation
    } catch (error) {
      setError("Failed to generate diagram. Please try again.");
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-white/70">Diagram Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you want to diagram (e.g., 'Create a flowchart showing how to make tea')"
          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30"
          rows="4"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <button
        onClick={generateDiagram}
        disabled={loading || !description.trim()}
        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating...
          </>
        ) : (
          "Generate Diagram"
        )}
      </button>
    </div>
  );
}
