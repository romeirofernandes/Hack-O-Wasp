import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import OCRScanner from '../components/OCRScanner'; // Import the OCR component

const SpeechToText = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { summary = [], tldr = "", title = "Document", flashcards = [] } = location.state || {};
  
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
  const [showOCRTool, setShowOCRTool] = useState(false); // State to toggle OCR tool visibility
  const [selectedImage, setSelectedImage] = useState(null); // For OCR image selection
  const [extractedText, setExtractedText] = useState(""); // For OCR extracted text
  const [isOCRProcessing, setIsOCRProcessing] = useState(false); // For OCR processing state
  
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
  
  const getTopicEnhancement = async (topicText) => {
    try {
      setLoadingTopicDetails(true);
      
      // Fix the API endpoint path to match the server.js route mounting
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
    
    // We no longer fetch topic details immediately here
    // They will be fetched only when the hint button is clicked
  };

  const getSelectedTopicText = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.text : "";
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
      const topicText = getSelectedTopicText();
      
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
  
  // Handle manual transcript input as a fallback
  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
  };
  
  // Toggle hints function
  const toggleHints = async () => {
    if (topicDetails) {
      // If we already have the details, just toggle visibility
      setShowHints(prev => !prev);
    } else {
      // If we don't have details yet, fetch them first
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

  // Extract only suggestions from feedback
  const extractSuggestions = (feedback) => {
    const suggestionsPattern = /suggestions:(?:\s*\n)?((?:.|[\r\n])*?)(?:\n\s*\n|$)/i;
    const match = feedback.match(suggestionsPattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    return "No specific suggestions were provided.";
  };

  // OCR image selection handler
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  // OCR processing handler
  const handleOCR = async () => {
    if (!selectedImage) {
      setError("No image selected for OCR processing");
      return;
    }
    
    setIsOCRProcessing(true);
    setError("");
    
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('language', 'eng'); // Optional, 'eng' by default
    
    try {
      const res = await axios.post('http://localhost:8000/api/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("Extracted Text:", res.data.text);
      setExtractedText(res.data.text);
      
      // Append the extracted text to the transcript
      if (res.data.text && res.data.text.trim()) {
        setTranscript(prev => {
          const newText = prev ? `${prev}\n\n${res.data.text}` : res.data.text;
          return newText;
        });
        
        // Hide OCR tool after successful scan
        setShowOCRTool(false);
      } else {
        setError("No text was extracted from the image. Try a clearer image.");
      }
    } catch (error) {
      console.error("OCR processing error:", error);
      setError(`OCR processing failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsOCRProcessing(false);
      setSelectedImage(null); // Reset selected image
    }
  };

  // Handle OCR complete from OCRScanner component
  const handleOCRComplete = (extractedText) => {
    if (extractedText && extractedText.trim()) {
      setTranscript(prev => {
        const newText = prev ? `${prev}\n\n${extractedText}` : extractedText;
        return newText;
      });
    }
    setShowOCRTool(false); // Hide OCR tool after successful scan
  };
  
  // Toggle OCR tool visibility
  const toggleOCRTool = () => {
    setShowOCRTool(!showOCRTool);
  };

  return (
    <div className="mt-16 relative min-h-screen bg-[#080808] flex flex-col">
      <div className="container relative z-10 mx-auto px-4 py-14 flex-grow">
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
          
          <h2 className="text-4xl font-bold mb-2 text-white">Feynman Technique</h2>
          <p className="text-lg text-gray-400 mb-8">Explain concepts in your own words and get AI feedback</p>
          
          {/* Topic Selection Card */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-white">Choose a topic to explain</h3>
            <select
              value={selectedTopic}
              onChange={handleTopicChange}
              disabled={isListening || isProcessing}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-white/30 focus:border-white/30 mb-4"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-gray-800 text-white">Select a topic...</option>
              {topics.length > 0 && (
                <>
                  <optgroup label="Flashcard Questions" className="bg-gray-800 text-white font-medium">
                    {topics
                      .filter(t => t.type === 'flashcard')
                      .map(topic => (
                        <option key={topic.id} value={topic.id} className="bg-gray-800 text-white">
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
            
            {selectedTopic && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-white">Selected Topic:</h4>
                  <button 
                    onClick={toggleHints} 
                    className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center"
                    disabled={loadingTopicDetails}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showHints ? "Hide Hints" : "Show Hints"}
                  </button>
                </div>
                
                <div className="text-white bg-white/10 p-4 rounded-lg">
                  <p>{getSelectedTopicText()}</p>

                  {/* Show topic details only when showHints is true */}
                  {showHints && topicDetails && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <h4 className="font-medium text-blue-300 mb-2">Key Points to Address:</h4>
                      <ul className="list-disc pl-5 space-y-2 text-gray-300">
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
                          <h4 className="font-medium text-blue-300 mb-2">Helpful Examples:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-300">
                            {topicDetails.examples.map((example, idx) => (
                              <li key={idx}>{typeof example === 'string' ? example : JSON.stringify(example)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* OCR Tool (conditionally rendered) */}
          {showOCRTool && (
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Text Scanner (OCR)</h3>
                <button 
                  onClick={toggleOCRTool}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
                >
                  Close Scanner
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Built-in OCR Scanner component */}
                <OCRScanner onScanComplete={handleOCRComplete} />
                
                {/* Manual file upload for OCR */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h4 className="text-lg font-medium text-white mb-3">Or upload an image file</h4>
                  
                  <div className="flex flex-col space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20"
                    />
                    
                    <button
                      onClick={handleOCR}
                      disabled={!selectedImage || isOCRProcessing}
                      className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOCRProcessing ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Image...
                        </div>
                      ) : "Extract Text from Image"}
                    </button>
                  </div>
                  
                  {extractedText && (
                    <div className="mt-4 p-4 bg-white/10 rounded-lg">
                      <h5 className="font-medium text-blue-300 mb-2">Extracted Text:</h5>
                      <p className="text-white whitespace-pre-wrap">{extractedText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Recording and Transcript Card */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h3 className="text-2xl font-semibold text-white">Your Explanation</h3>
                {isListening && (
                  <div className="ml-3 px-2 py-1 bg-red-500/20 text-red-400 rounded-md flex items-center text-xs">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    LIVE
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                {/* OCR Tool Toggle Button */}
                <button
                  onClick={toggleOCRTool} 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-white/10 hover:bg-white/20 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  {showOCRTool ? "Hide Scanner" : "Scan Text"}
                </button>
                
                {/* Recording Button */}
                <button
                  onClick={toggleListening}
                  disabled={isProcessing || !selectedTopic}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${isListening ? 
                      'bg-red-500 hover:bg-red-600 text-white' : 
                      'bg-white/10 hover:bg-white/20 text-white'
                    } ${(!selectedTopic) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isListening ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
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
                
                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  disabled={!transcript && !interimTranscript || isListening || isProcessing}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            
            <div className="mb-4 rounded-lg border bg-white/10 border-white/20 overflow-hidden">
              {/* Transcript Display Area */}
              <div className="p-4 max-h-[200px] overflow-y-auto">
                {transcript && (
                  <div className="text-white mb-2">
                    {transcript}
                  </div>
                )}
                
                {/* Live interim results */}
                {isListening && interimTranscript && (
                  <div className="text-gray-400">
                    {interimTranscript}
                    <span className="inline-block">...</span>
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
                className={`w-full p-4 text-white border-t border-white/10 resize-y focus:ring-white/30 focus:border-white/30 bg-transparent
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
              <div className="flex gap-4">
                <button
                  onClick={() => handleSubmitExplanation(true)}
                  disabled={!transcript || isListening || isProcessing || isSuggestionsLoading}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"> {isSuggestionsLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : "Get Quick Suggestions"}
                </button>
                <button
                  onClick={() => handleSubmitExplanation(false)}
                  disabled={!transcript || isListening || isProcessing || isSuggestionsLoading}
                  className="px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : "Get Complete Feedback"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Feedback Display */}
          {feedback && (
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 mb-8">
              <h3 className="text-2xl font-semibold mb-6 text-white">{showOnlySuggestions ? "Suggestions" : "Feedback"}</h3>
              
              {scores && !showOnlySuggestions && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(scores).map(([dimension, score]) => (
                    <div key={dimension} className="bg-white/10 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 capitalize mb-1">{dimension}</div>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-white">{score}/10</div>
                        <div className="flex-1">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
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

              <div className="bg-white/10 p-6 rounded-lg text-white max-h-[400px] overflow-y-auto">
                {typeof feedback === 'string' && (
                  <ReactMarkdown className="prose prose-invert max-w-none">
                    {showOnlySuggestions 
                      ? `Suggestions:\n${extractSuggestions(feedback)}` 
                      : feedback}
                  </ReactMarkdown>
                )}
              </div>
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

export default SpeechToText;
