import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// Add this function near the top with other utility functions
const extractSuggestions = (feedback) => {
  const suggestionsPattern = /suggestions:(?:\s*\n)?((?:.|[\r\n])*?)(?:\n\s*\n|$)/i;
  const match = feedback.match(suggestionsPattern);
  return match && match[1] ? match[1].trim() : "No specific suggestions were provided.";
};

export const SpeechToTextEmbed = ({ summary = [], tldr = "", title = "Document", flashcards = [] }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scores, setScores] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [error, setError] = useState("");
  const [topicDetails, setTopicDetails] = useState(null);
  const [loadingTopicDetails, setLoadingTopicDetails] = useState(false);
  const [showOnlySuggestions, setShowOnlySuggestions] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  
  // Create topics array properly to ensure dropdown works
  const topics = [
    ...(Array.isArray(summary) ? summary.map((point, i) => ({ id: `s${i}`, text: point, type: 'summary' })) : []),
    ...(Array.isArray(flashcards) ? flashcards.map((card, i) => ({ id: `f${i}`, text: card.question, type: 'flashcard' })) : [])
  ];
  
  const recognitionRef = useRef(null);
  const recognitionAttempts = useRef(0);
  
  // Initialize speech recognition outside of effect to avoid dependency issues
  const initializeRecognition = () => {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError("Your browser doesn't support speech recognition. Try Chrome or Edge.");
        return null;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // ... same initialization code from SpeechToText.jsx
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // ... same event handlers (onstart, onresult, onerror, onend)
      // ... (include all the recognition event handlers from the original component)
      recognition.onstart = () => {
        console.log("Speech recognition started");
        recognitionAttempts.current = 0;
        setError("");
      };
      
      recognition.onresult = (event) => {
        let currentInterimTranscript = '';
        let currentFinalTranscript = '';
        
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentFinalTranscript += event.results[i][0].transcript + ' ';
          } else {
            currentInterimTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        setInterimTranscript(currentInterimTranscript);
        
        if (currentFinalTranscript) {
          setTranscript(prev => prev + currentFinalTranscript);
          setError("");
        }
      };
      
      // Include the error handling and other event handlers from SpeechToText.jsx
      // ...
      
      return recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setError("Failed to initialize speech recognition. Please try a different browser like Chrome.");
      return null;
    }
  };

  const getTopicEnhancement = async (topicText) => {
    try {
      setLoadingTopicDetails(true);
      const response = await axios.post('http://localhost:8000/api/transcribe/enhance-topic', {
        topic: topicText,
        title
      });
      return response.data;
    } catch (err) {
      console.error('Error enhancing topic:', err);
      return null;
    } finally {
      setLoadingTopicDetails(false);
    }
  };

  const handleTopicChange = async (e) => {
    const newTopicId = e.target.value;
    setSelectedTopic(newTopicId);
    setFeedback(null);
    setScores(null);
    setTopicDetails(null);
    setShowHints(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
      if (!recognitionRef.current) return;
    }
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
        setInterimTranscript("");
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      setIsListening(false);
    } else {
      if (!selectedTopic) {
        setError("Please select a topic first");
        return;
      }
      
      setError("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
        setError("Failed to start microphone. Please ensure it's connected and permissions are granted.");
      }
    }
  };

  const handleSubmitExplanation = async (suggestionsOnly = false) => {
    if (!transcript.trim()) {
      setError("Please record or type an explanation first");
      return;
    }
    
    if (suggestionsOnly) {
      setIsSuggestionsLoading(true);
    } else {
      setIsProcessing(true);
    }
    setError("");
    
    try {
      const topicText = topics.find(t => t.id === selectedTopic)?.text || "";
      
      const response = await axios.post('http://localhost:8000/api/transcribe', {
        transcript,
        topic: topicText,
        title
      });
      
      if (suggestionsOnly) {
        setShowOnlySuggestions(true);
        setFeedback(response.data.feedback);
        setScores(null);
      } else {
        setShowOnlySuggestions(false);
        setFeedback(response.data.feedback);
        setScores(response.data.scores);
      }
    } catch (err) {
      console.error('Error submitting transcription:', err);
      setError(`Failed to analyze your explanation: ${err.message || "Unknown error"}`);
    } finally {
      if (suggestionsOnly) {
        setIsSuggestionsLoading(false);
      } else {
        setIsProcessing(false);
      }
    }
  };

  const handleReset = () => {
    setTranscript("");
    setInterimTranscript("");
    setFeedback(null);
    setScores(null);
    setShowOnlySuggestions(false);
  };

  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
  };

  const toggleHints = async () => {
    if (topicDetails) {
      setShowHints(prev => !prev);
    } else {
      if (!selectedTopic) {
        setError("Please select a topic first");
        return;
      }
      
      const topic = topics.find(t => t.id === selectedTopic);
      if (topic) {
        const enhancedTopic = await getTopicEnhancement(topic.text);
        if (enhancedTopic) {
          setTopicDetails(enhancedTopic);
          setShowHints(true);
        }
      }
    }
  };

  useEffect(() => {
    recognitionRef.current = initializeRecognition();
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
    };
  }, []);

  // CSS for animation - use a simpler version for the embedded component
  const PulseAnimation = () => (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Same CSS as in SpeechToText.jsx but adjusted as needed for embedding */
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        .live-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #ef4444;
          border-radius: 50%;
          margin-right: 6px;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        
        .typing-indicator::after {
          content: '⋯';
          animation: typing 1.5s infinite;
        }
        
        @keyframes typing {
          0% { content: '⋯'; }
          33% { content: '.'; }
          66% { content: '..'; }
          100% { content: '...'; }
        }
      `
    }} />
  );

  // Add these style definitions
  const styles = {
    card: "bg-white/5 backdrop-blur-sm rounded-xl border border-white/10",
    cardHeader: "text-xl font-semibold mb-4",
    btnPrimary: "px-4 py-2 bg-white text-black hover:bg-gray-100 rounded-full font-medium transition-all",
    btnSecondary: "px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-all",
    btnWhite: "px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg font-medium transition-all",
    inputField: "bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30",
  };

  // Add this helper function to get selected topic text
  const getSelectedTopicText = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.text : "";
  };

  return (
    <div className={`${styles.card} p-6`}>
      <PulseAnimation />
      <div className="max-w-full mx-auto">
        <div className="space-y-6">
          {/* Topic Selection */}
          <div>
            <h3 className={styles.cardHeader}>Choose a topic to explain:</h3>
            <select
              value={selectedTopic}
              onChange={handleTopicChange}
              disabled={isListening || isProcessing}
              className={`w-full py-3 px-4 ${styles.inputField}`}
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-gray-900 text-white">Select a topic...</option>
              {topics.length > 0 && (
                <>

                  <optgroup label="Flashcard Questions" className="bg-gray-900 text-white font-medium">
                    {topics
                      .filter(t => t.type === 'flashcard')
                      .map(topic => (
                        <option key={topic.id} value={topic.id} className="bg-gray-900 text-white">
                          {topic.text.length > 60 ? topic.text.substring(0, 60) + '...' : topic.text}
                        </option>
                      ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          {/* Selected Topic Display */}
          {selectedTopic && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Selected Topic:</h3>
                <button 
                  onClick={toggleHints} 
                  className={`${styles.btnSecondary} py-1 px-3 text-sm`}
                  disabled={loadingTopicDetails}
                >
                  {showHints ? "Hide Hints" : "Show Hints"}
                </button>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white">{getSelectedTopicText()}</p>
              </div>

              {showHints && topicDetails && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <h4 className="font-medium text-white mb-2">Key Points to Address:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-white/80">
                    {Array.isArray(topicDetails.keyPoints) ? (
                      topicDetails.keyPoints.map((point, idx) => (
                        <li key={idx}>{typeof point === 'string' ? point : JSON.stringify(point)}</li>
                      ))
                    ) : (
                      <li>No key points available</li>
                    )}
                  </ul>
                  
                  {topicDetails.examples && Array.isArray(topicDetails.examples) && topicDetails.examples.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-medium text-white mb-2">Helpful Examples:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-white/80">
                        {topicDetails.examples.map((example, idx) => (
                          <li key={idx}>{typeof example === 'string' ? example : JSON.stringify(example)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <h2 className={styles.cardHeader + " mb-0"}>Your Explanation:</h2>
                {isListening && (
                  <div className="ml-3 px-2 py-1 bg-red-500/20 text-red-400 rounded-md flex items-center text-xs">
                    <span className="live-indicator"></span>
                    LIVE
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  disabled={isProcessing || !selectedTopic}
                  className={`${styles.btnPrimary} flex items-center gap-2 ${
                    isListening ? 'bg-red-500 hover:bg-red-600' : ''
                  } ${!selectedTopic ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isListening ? (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
                      </span>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                      Start Recording
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={!transcript && !interimTranscript || isListening || isProcessing}
                  className={`${styles.btnSecondary} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Reset
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="mb-4 rounded-lg border bg-white/5 border-white/10 overflow-hidden">
              <div className="p-4 max-h-[200px] overflow-y-auto">
                {transcript && (
                  <div className="text-white mb-2">{transcript}</div>
                )}
                {isListening && interimTranscript && (
                  <div className="text-gray-400">
                    {interimTranscript}
                    <span className="typing-indicator"></span>
                  </div>
                )}
                {!transcript && !interimTranscript && (
                  <div className="text-gray-500">
                    {isListening ? "Listening... Start explaining the concept in your own words" : "Record or type your explanation here..."}
                  </div>
                )}
              </div>

              <textarea
                value={transcript}
                onChange={handleTranscriptChange}
                disabled={isListening}
                placeholder="Edit your explanation here..."
                className={`w-full p-4 bg-white/5 border-t border-white/10 resize-y focus:ring-white/30 focus:border-white/30
                  ${isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                {transcript && (
                  <span>{transcript.split(' ').length} words</span>
                )}
              </div>
              <div className="flex gap-3">

                <button
                  onClick={() => handleSubmitExplanation(false)}
                  disabled={!transcript || isListening || isProcessing || isSuggestionsLoading}
                  className={`${styles.btnWhite} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : "Get Full Feedback"}
                </button>
              </div>
            </div>
          </div>

          {feedback && (
            <div className="mb-8">
              <h2 className={styles.cardHeader}>{showOnlySuggestions ? "Suggestions:" : "Feedback:"}</h2>
              <div className={`${styles.card} p-6`}>
                {scores && !showOnlySuggestions && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {Object.entries(scores).map(([dimension, score]) => (
                      <div key={dimension} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="text-sm text-white/70 capitalize mb-1">{dimension}</div>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-bold text-white">{score}</div>
                          <div className="text-lg text-white/70">/10</div>
                          <div className="flex-1">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  score >= 8 ? 'bg-green-500' : 
                                  score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${score * 10}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="prose prose-invert max-w-none max-h-[400px] overflow-y-auto">
                  {typeof feedback === 'string' && (
                    <ReactMarkdown>
                      {showOnlySuggestions 
                        ? `Suggestions:\n${extractSuggestions(feedback)}` 
                        : feedback}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
