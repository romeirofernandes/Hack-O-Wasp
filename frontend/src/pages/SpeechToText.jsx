import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SpeechToText = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { summary = [], tldr = "", title = "Document", flashcards = [] } = location.state || {};
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [error, setError] = useState("");
  
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
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log("Speech recognition started");
        recognitionAttempts.current = 0;
        setError("");
      };
      
      recognition.onresult = (event) => {
        let currentInterimTranscript = '';
        let currentFinalTranscript = '';
        
        // Process all results (including interim ones)
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentFinalTranscript += event.results[i][0].transcript + ' ';
          } else {
            currentInterimTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        // Update state with interim results for live feedback
        setInterimTranscript(currentInterimTranscript);
        
        // Only append final results to the permanent transcript
        if (currentFinalTranscript) {
          setTranscript(prev => prev + currentFinalTranscript);
          setError("");
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        // Handle different error types
        if (event.error === 'network') {
          // Network errors are sometimes false positives - try to continue
          if (recognitionAttempts.current < 3) {
            recognitionAttempts.current++;
            console.log(`Retrying after network error (attempt ${recognitionAttempts.current})`);
            setTimeout(() => {
              try {
                if (isListening) {
                  recognition.start();
                }
              } catch (e) {
                console.error("Failed to restart after network error:", e);
                setError("Speech recognition temporarily unavailable. You can type your explanation instead.");
                setIsListening(false);
              }
            }, 1000);
            return;
          } else {
            setError("Speech recognition is having trouble connecting. You can try again or type your explanation.");
          }
        } else if (event.error === 'not-allowed') {
          setError("Microphone access denied. Please allow access in your browser settings.");
        } else if (event.error === 'no-speech') {
          // No speech detected is not a critical error
          console.log("No speech detected");
          setError("No speech detected. Please speak louder or check your microphone.");
          // Try to continue listening
          try {
            if (isListening) {
              recognition.stop();
              setTimeout(() => recognition.start(), 100);
            }
          } catch (e) {
            console.error("Failed to restart after no-speech:", e);
          }
          return;
        } else {
          setError(`Speech recognition error: ${event.error}. You can try again or type your explanation.`);
        }
        
        setIsListening(false);
        setInterimTranscript("");
      };
      
      recognition.onend = () => {
        console.log("Speech recognition ended");
        setInterimTranscript("");
        
        // Only restart if still in listening mode
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition:", e);
            setIsListening(false);
            setError("Speech recognition stopped unexpectedly. Try again.");
          }
        }
      };
      
      return recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setError("Failed to initialize speech recognition. Please try a different browser like Chrome.");
      return null;
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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Try to initialize again
      recognitionRef.current = initializeRecognition();
      if (!recognitionRef.current) {
        return; // Error already set by initializeRecognition
      }
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
        
        // Try to create a new instance - sometimes this helps
        setTimeout(() => {
          recognitionRef.current = initializeRecognition();
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
              setIsListening(true);
              setError("");
            }
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            setError("Could not access microphone. You can type your explanation instead.");
          }
        }, 500);
      }
    }
  };
  
  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setFeedback(null);
    setScore(null);
  };

  const getSelectedTopicText = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.text : "";
  };
  
  const handleSubmitExplanation = async () => {
    if (!transcript.trim()) {
      setError("Please record or type an explanation first");
      return;
    }
    
    setIsProcessing(true);
    setError("");
    
    try {
      // Get the selected topic text
      const topicText = getSelectedTopicText();
      
      // Send transcript to backend for evaluation
      const response = await axios.post('http://localhost:8000/api/transcribe', {
        transcript,
        topic: topicText,
        title
      });
      
      setFeedback(response.data.feedback);
      setScore(response.data.score);
    } catch (err) {
      console.error('Error submitting transcription:', err);
      setError(`Failed to analyze your explanation: ${err.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleReset = () => {
    setTranscript("");
    setInterimTranscript("");
    setFeedback(null);
    setScore(null);
  };
  
  // Handle manual transcript input as a fallback
  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
  };
  
  // CSS for animation
  const pulseStyle = {
    animation: "pulse 2s infinite",
  };
  
  // Keyframes animation as a separate component
  const PulseAnimation = () => (
    <style dangerouslySetInnerHTML={{
      __html: `
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
  
  return (
    <div className="min-h-screen bg-[#080808] text-white p-6">
      <PulseAnimation />
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-white/70 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        
        <h1 className="text-4xl font-bold mb-2">Feynman Technique</h1>
        <p className="text-lg text-gray-400 mb-8">Explain concepts in your own words and get AI feedback</p>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Choose a topic to explain:</h2>
            <select
              value={selectedTopic}
              onChange={handleTopicChange}
              disabled={isListening || isProcessing}
              className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30"
            >
              <option value="">Select a topic...</option>
              {topics.length > 0 && (
                <>
                  <optgroup label="Summary Points">
                    {topics
                      .filter(t => t.type === 'summary')
                      .map(topic => (
                        <option key={topic.id} value={topic.id}>
                          {topic.text.length > 60 ? topic.text.substring(0, 60) + '...' : topic.text}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Flashcard Questions">
                    {topics
                      .filter(t => t.type === 'flashcard')
                      .map(topic => (
                        <option key={topic.id} value={topic.id}>
                          {topic.text.length > 60 ? topic.text.substring(0, 60) + '...' : topic.text}
                        </option>
                      ))}
                  </optgroup>
                </>
              )}
            </select>
            
            {topics.length === 0 && (
              <p className="mt-2 text-red-400">
                No topics available. Please go back and ensure the document was processed correctly.
              </p>
            )}
          </div>
          
          {selectedTopic && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Selected Topic:</h3>
              <div className="p-4 bg-white/10 rounded-lg">
                <p>{getSelectedTopicText()}</p>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Your Explanation:</h2>
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
                  className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 
                    ${isListening ? 
                      'bg-red-500 hover:bg-red-600' : 
                      'bg-blue-500 hover:bg-blue-600'
                    } ${(!selectedTopic) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              {/* Transcript Display Area */}
              <div className="p-4">
                {transcript && (
                  <div className="text-white mb-2">
                    {transcript}
                  </div>
                )}
                
                {/* Live interim results */}
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
              
              {/* Text input area for manual editing/typing */}
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
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {transcript && (
                  <span>{transcript.split(' ').length} words</span>
                )}
              </div>
              <button
                onClick={handleSubmitExplanation}
                disabled={!transcript || isListening || isProcessing}
                className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : "Get Feedback"}
              </button>
            </div>
          </div>
          
{feedback && (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">Feedback:</h2>
    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
      {score !== null && (
        <div className="mb-6 flex items-center">
          <div className="mr-4">
            <div className="text-2xl font-bold">{score}/10</div>
            <div className="text-sm text-gray-400">Understanding Score</div>
          </div>
          <div className="flex-1">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  score >= 8 ? 'bg-green-500' : 
                  score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${score * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="prose prose-invert max-w-none">
        {typeof feedback === 'string' && (
          <div className="feedback-content">
            {/* Process the feedback text into properly formatted HTML */}
            {(() => {
              // Start by preparing the content
              let content = feedback;
              
              // Process sections with stars
              content = content.replace(/\*{3,}/g, '<hr class="border-white/20 my-4" />');
              
              // Process headers
              content = content.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-5 mb-2">$1</h3>');
              content = content.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>');
              content = content.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-7 mb-4">$1</h1>');
              
              // Process bold and italic
              content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
              content = content.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
              
              // Process unordered and ordered lists
              // First, identify list blocks
              content = content.replace(
                /((?:^\s*[\*\-]\s+.*$\n?)+)/gm,
                '<ul class="list-disc pl-5 space-y-1 my-3">$1</ul>'
              );
              content = content.replace(
                /((?:^\s*\d+\.\s+.*$\n?)+)/gm,
                '<ol class="list-decimal pl-5 space-y-1 my-3">$1</ol>'
              );
              
              // Then process individual list items
              content = content.replace(/^\s*[\*\-]\s+(.*$)/gim, '<li>$1</li>');
              content = content.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');
              
              // Process paragraphs
              content = content.split('\n\n').join('</p><p class="mb-4">');
              
              // Process line breaks within paragraphs
              content = content.split('\n').join('<br/>');
              
              // Wrap the entire content
              if (!content.startsWith('<h1') && !content.startsWith('<h2') && 
                  !content.startsWith('<h3') && !content.startsWith('<ul') && 
                  !content.startsWith('<ol') && !content.startsWith('<p')) {
                content = '<p class="mb-4">' + content;
              }
              
              if (!content.endsWith('</p>') && !content.endsWith('</ul>') && 
                  !content.endsWith('</ol>') && !content.endsWith('</h1>') && 
                  !content.endsWith('</h2>') && !content.endsWith('</h3>')) {
                content = content + '</p>';
              }
              
              return { __html: content };
            })()}
          </div>
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

export default SpeechToText;