import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, CheckCircle, ChevronRight, Speaker, Loader2, Video } from 'lucide-react';
import api from '../api';
import useVoice from '../hooks/useVoice';
import Button from '../components/common/Button';
import CameraFeed from '../components/common/CameraFeed';

const Interview = () => {
  const [data, setData] = useState(() => JSON.parse(sessionStorage.getItem('interview_data')));
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  
  const { speak, startListening, stopListening, isListening, isVoiceSupported } = useVoice();
  const navigate = useNavigate();
  const currentQuestion = data?.allQuestions[currentQuestionIndex];

  useEffect(() => {
    if (!data) {
      navigate('/profile');
      return;
    }
    
    // Auto-speak first question with a slight delay
    const timer = setTimeout(() => speak(currentQuestion.questionText), 1500);
    return () => {
        clearTimeout(timer);
        stopListening();
    };
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
    stopListening();
    
    try {
      const resp = await api.post('/interview/answer', {
        interviewId: data.id,
        questionIndex: currentQuestionIndex,
        answerText: answer
      });

      setEvaluation(resp.evaluation);
      setAnswer('');
      
      // Speak feedback summary
      speak(`Score ${resp.evaluation.score}. ${resp.evaluation.summary}`);

      // Check if this was the last question
      if (currentQuestionIndex === data.total - 1) {
        setIsDone(true);
      } else {
        // Automatically proceed after 6 seconds of showing feedback
        setTimeout(() => {
          const nextIdx = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIdx);
          setEvaluation(null);
          speak(data.allQuestions[nextIdx].questionText);
        }, 6000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      const resp = await api.post('/interview/end', { interviewId: data.id });
      // Store result and also the role/questions for the summary page
      sessionStorage.setItem('last_result', JSON.stringify({
          ...resp.report,
          jobRole: data.role,
          totalQuestions: data.total,
          perQuestionScores: [] // Will be populated in Summary if needed
      }));
      navigate('/summary');
    } catch (err) {
      alert(err.message);
      setIsFinalizing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(({ final }) => {
        if (final) setAnswer(prev => (prev + ' ' + final).trim());
      }, (err) => console.error(err));
    }
  };

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Perspective: Feed & Identity */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
            >
                <div className="relative group">
                    <CameraFeed isActive={!isDone} />
                    <div className="absolute top-4 left-4 flex items-center space-x-2 glass px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">Live Session</span>
                    </div>
                </div>
                
                <div className="card !p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-xl">
                            <Video size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Position</p>
                            <p className="font-bold text-text-main leading-none">{data.role}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                        <p className="font-bold text-success leading-none">{isDone ? 'Completed' : 'Active'}</p>
                    </div>
                </div>
            </motion.div>

            {/* Interaction Layer */}
            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {!evaluation ? (
                        <motion.div 
                            key="question-box"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="card !p-8 space-y-8 min-h-[460px] flex flex-col"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Interview Question {currentQuestionIndex + 1} of {data.total}</p>
                                    <div className="w-12 h-1 bg-primary rounded-full" />
                                </div>
                                <button 
                                    onClick={() => speak(currentQuestion.questionText)}
                                    className="p-3 text-slate-300 hover:text-primary bg-slate-50 hover:bg-primary/5 rounded-xl transition-all"
                                    title="Speak question"
                                >
                                    <Speaker size={20} />
                                </button>
                            </div>

                            <h3 className="text-2xl font-black text-text-main leading-tight flex-1">
                                {currentQuestion.questionText}
                            </h3>

                            <div className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        className="input min-h-[160px] resize-none pb-12 pr-4 pt-4 shadow-sm"
                                        placeholder="Record or type your response here..."
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        disabled={isSubmitting || isDone}
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                                        {isVoiceSupported && (
                                            <button 
                                                onClick={handleVoiceToggle}
                                                className={`p-3 rounded-xl transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5'}`}
                                                title={isListening ? "Stop listening" : "Start voice input"}
                                            >
                                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                            </button>
                                        )}
                                        <Button 
                                            onClick={handleSubmit} 
                                            disabled={!answer.trim() || isSubmitting || isDone}
                                            isLoading={isSubmitting}
                                            className="h-11 px-6 text-sm"
                                        >
                                            Submit Answer <Send size={16} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                                {isListening && (
                                    <p className="text-[10px] font-bold text-primary animate-pulse text-center">AI is listening... speak clearly into your microphone.</p>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="feedback-box"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="card !p-8 border-primary/20 bg-primary/5 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <CheckCircle size={120} className="text-primary" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary text-white p-2 rounded-lg">
                                        <CheckCircle size={20} />
                                    </div>
                                    <span className="font-black text-primary uppercase text-xs tracking-widest">Entry Evaluation</span>
                                </div>
                                <div className="text-4xl font-black text-primary">{evaluation.score}<span className="text-sm font-bold text-primary/40">/10</span></div>
                            </div>
                            
                            <div className="space-y-4 relative z-10">
                                <p className="text-xl font-bold text-text-main leading-relaxed italic">
                                    "{evaluation.summary}"
                                </p>
                                
                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-primary/10">
                                    <div className="space-y-3">
                                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Key Merits</h5>
                                        <ul className="text-xs space-y-2 font-semibold">
                                            {evaluation.strengths.slice(0, 2).map((s, i) => (
                                                <li key={i} className="flex items-start text-emerald-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 mr-2" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Dots</h5>
                                        <ul className="text-xs space-y-2 font-semibold">
                                            {evaluation.improvements.slice(0, 2).map((s, i) => (
                                                <li key={i} className="flex items-start text-primary">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1 mr-2" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {!isDone && (
                                <div className="flex flex-col items-center space-y-3 pt-6">
                                    <div className="flex space-x-1">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-primary/40" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary/60" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary/80" />
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Preparing Next Question...</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {isDone && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card bg-primary text-white !p-8 space-y-6"
                    >
                        <div className="space-y-2">
                             <h3 className="text-2xl font-black tracking-tight">Session Complete</h3>
                             <p className="text-secondary-light font-medium leading-relaxed">Excellent work! You've answered all tailored questions. We are now compiling your holistic evaluation report.</p>
                        </div>
                        <Button 
                            className="w-full h-14 bg-white text-primary hover:bg-slate-50 border-none text-lg font-black"
                            onClick={handleFinalize}
                            isLoading={isFinalizing}
                        >
                            Generate Results <ChevronRight className="ml-2" />
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Interview;
