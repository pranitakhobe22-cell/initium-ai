import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Award, Target, MessageSquare, ChevronRight, FileText, Share2, Printer } from 'lucide-react';
import Button from '../components/common/Button';

const Summary = () => {
  const [result, setResult] = useState(() => JSON.parse(sessionStorage.getItem('last_result')));
  const navigate = useNavigate();

  useEffect(() => {
    if (!result) {
      navigate('/profile');
    }
  }, [result, navigate]);

  if (!result) return null;

  const { score, strengths, improvements, summary, jobRole, totalQuestions } = result;

  const getScoreVariant = (s) => {
    if (s >= 8) return 'text-success bg-success/10 border-success/20';
    if (s >= 6) return 'text-primary bg-primary/10 border-primary/20';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-12 px-4 space-y-12"
    >
      <div className="text-center space-y-4">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center space-x-2 bg-slate-50 text-slate-500 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-100"
        >
          <CheckCircle size={16} className="text-success" />
          <span>Evaluation Dispatched</span>
        </motion.div>
        <h1 className="text-4xl font-black text-text-main tracking-tight">Performance Summary</h1>
        <p className="text-text-muted max-w-2xl mx-auto">
            Review your AI-generated insights for the <span className="text-primary font-bold">{jobRole}</span> interview round.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Metric */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 card flex flex-col items-center justify-center p-12 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
             <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80" cy="80" r="74"
                  stroke="#E2E8F0" strokeWidth="8" fill="transparent"
                />
                <motion.circle
                  cx="80" cy="80" r="74"
                  stroke="#4F7CAC" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 74}
                  initial={{ strokeDashoffset: 2 * Math.PI * 74 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 74) * (1 - (score * 10) / 100) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-5xl font-black text-text-main">{(score * 10).toFixed(0)}</span>
                <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none">Global Score</span>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full pt-8 border-t border-slate-50">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items</p>
              <p className="text-xl font-black text-text-main">{totalQuestions}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precision</p>
              <p className="text-xl font-black text-text-main">{(score * 10).toFixed(0)}%</p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card space-y-10"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-primary font-black uppercase text-xs tracking-widest">
              <MessageSquare size={18} />
              <span>AI Executive Reflection</span>
            </div>
            <p className="text-xl text-text-main leading-relaxed font-bold italic border-l-4 border-secondary pl-6">
              "{summary}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-success uppercase text-xs font-black tracking-widest">
                <Award size={18} />
                <span>Distinct Assets</span>
              </div>
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start bg-slate-50 p-4 rounded-xl text-sm font-semibold text-text-main border border-slate-100">
                    <CheckCircle className="mr-3 mt-0.5 text-success shrink-0" size={16} />
                    {s}
                  </li>
                ))}
              </ul>
            </section>
            
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-primary uppercase text-xs font-black tracking-widest">
                <Target size={18} />
                <span>Refinement Gap</span>
              </div>
              <ul className="space-y-3">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start bg-slate-50 p-4 rounded-xl text-sm font-semibold text-text-main border border-slate-100">
                    <ChevronRight className="mr-3 mt-0.5 text-primary shrink-0" size={16} />
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
      >
         <Button onClick={() => navigate('/profile')} variant="secondary" className="px-10 h-14">
            Back to Dashboard
         </Button>
         <Button onClick={() => window.print()} className="px-10 h-14 shadow-md font-black">
            <Printer size={18} className="mr-2" />
            Export Full Report
         </Button>
      </motion.div>
    </motion.div>
  );
};

export default Summary;
