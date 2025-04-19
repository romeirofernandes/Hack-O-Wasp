import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const Revision = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
                return;
            }
            
            const fetchQuestions = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/revision/${user.uid}`
                    );
                    if (response.data.success) {
                        setQuestions(response.data.questions);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching revision questions:', error);
                    setLoading(false);
                }
            };

            fetchQuestions();
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleAnswer = async (isCorrect, optionIndex) => {
        const user = auth.currentUser;
        const currentQuestion = questions[currentIndex];
        
        setSelectedAnswer(optionIndex);
        setIsCorrect(isCorrect);
        setShowAnswer(true);
        setFeedbackVisible(true);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/revision/${user.uid}/attempt`,
                {
                    documentId: currentQuestion.documentId,
                    questionId: currentQuestion._id,
                    isCorrect
                }
            );

            if (isCorrect) {
                setScore(prev => prev + 1);
            }

            // Wait for feedback to be visible
            setTimeout(() => {
                setTransitioning(true);
                // Fade out current question
                setTimeout(() => {
                    if (currentIndex === questions.length - 1) {
                        setIsComplete(true);
                    } else {
                        setCurrentIndex(prev => prev + 1);
                        setSelectedAnswer(null);
                        setIsCorrect(null);
                        setShowAnswer(false);
                        setFeedbackVisible(false);
                        // Reset transition state after new question is set
                        setTimeout(() => {
                            setTransitioning(false);
                        }, 100);
                    }
                }, 1000); // Fade out duration
            }, 2000); // Feedback visible duration
        } catch (error) {
            console.error('Error updating answer:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="text-white">Loading questions...</div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="text-white">No revision questions available.</div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="min-h-screen bg-[#080808] pt-28 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Revision Complete!</h2>
                        <p className="text-xl text-gray-400 mb-6">You scored {score} out of {questions.length}</p>
                        
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setIsComplete(false);
                                    setCurrentIndex(0);
                                    setScore(0);
                                    window.location.reload(); // Fetch new questions
                                }}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                Practice More
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen bg-[#080808] pt-28 px-4"> {/* Updated padding top */}
            <div className="max-w-3xl mx-auto">
                <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 transition-opacity duration-1000 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="mb-4 text-gray-400">
                        Question {currentIndex + 1} of {questions.length}
                    </div>
                    <h2 className="text-2xl font-semibold text-white mb-6">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option.isCorrect, idx)}
                                disabled={selectedAnswer !== null}
                                className={`w-full p-4 text-left rounded-lg transition-all duration-300 ${
                                    selectedAnswer === idx 
                                        ? isCorrect 
                                            ? 'bg-green-500/20 border-green-500 border transform scale-105' 
                                            : 'bg-red-500/20 border-red-500 border'
                                        : 'bg-white/5 hover:bg-white/10'
                                } text-white ${selectedAnswer !== null && selectedAnswer !== idx ? 'opacity-50' : ''}`}
                            >
                                {option.text}
                                {selectedAnswer === idx && (
                                    <span className="ml-2 transition-opacity duration-300">
                                        {isCorrect ? '✓' : '✗'}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {feedbackVisible && selectedAnswer !== null && (
                        <div className={`mt-4 p-4 rounded-lg transition-all duration-300 transform ${
                            feedbackVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                        } ${
                            questions[currentIndex].options[selectedAnswer].isCorrect 
                                ? 'bg-green-500/20 text-green-200' 
                                : 'bg-red-500/20 text-red-200'
                        }`}>
                            {questions[currentIndex].options[selectedAnswer].isCorrect 
                                ? 'Correct! Well done!' 
                                : 'Not quite right. Keep practicing!'}
                        </div>
                    )}

                    <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="mt-6 text-gray-400 hover:text-white transition-colors"
                    >
                        {showAnswer ? 'Hide Explanation' : 'Show Explanation'}
                    </button>

                    {showAnswer && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg text-gray-300">
                            {currentQuestion.explanation}
                        </div>
                    )}

                    <div className="mt-6 text-sm text-gray-400">
                        From: {currentQuestion.documentName}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revision;
