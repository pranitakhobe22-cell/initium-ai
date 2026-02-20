import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, BarChart3, Search, ChevronRight, X, ArrowUpRight, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intRes, statRes] = await Promise.all([
          api.get('/admin/interviews'),
          api.get('/admin/stats')
        ]);
        setInterviews(intRes.interviews);
        setStats(statRes.stats);
      } catch (err) {
        console.error('Admin data fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = interviews.filter(iv => 
    iv.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iv.profileData?.jobRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-[80vh] items-center justify-center text-slate-400 font-medium tracking-widest uppercase text-xs">Calibrating Analytics...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto py-10 px-4 space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <h1 className="text-3xl font-black text-text-main tracking-tight">Admin Console</h1>
            <p className="text-text-muted text-sm font-medium">Monitoring AI interview performance and engagement</p>
        </div>
        <div className="flex items-center space-x-4">
            <div className="relative">
                <Search className="absolute left-4 top-3 text-slate-300" size={18} />
                <input 
                    className="input pl-12 h-11 w-full md:w-64 text-sm" 
                    placeholder="Search candidate or role..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Engagement', value: stats?.totalInterviews, icon: Users, variant: 'primary' },
          { label: 'Avg Skill Score', value: (stats?.avgScore || 0) + '%', icon: BarChart3, variant: 'success' },
          { label: 'Active Candidates', value: stats?.totalCandidates, icon: FileText, variant: 'secondary' },
        ].map((m, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -4 }}
            className="card !p-6 flex items-center space-x-5"
          >
            <div className={`p-4 rounded-xl ${m.variant === 'primary' ? 'bg-primary/10 text-primary' : m.variant === 'success' ? 'bg-success/10 text-success' : 'bg-secondary/20 text-primary'}`}>
              <m.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
              <p className="text-3xl font-black text-text-main">{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table View */}
        <div className="lg:col-span-2 card !p-0 overflow-hidden border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Candidate</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((iv, i) => (
                  <tr key={i} className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${selected?._id === iv._id ? 'bg-slate-50/80 shadow-inner' : ''}`} onClick={() => setSelected(iv)}>
                    <td className="px-6 py-5">
                      <p className="font-bold text-text-main leading-none mb-1">{iv.userId?.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{iv.userId?.email}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-500">{iv.profileData?.jobRole}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${iv.score * 10}%` }} />
                        </div>
                        <span className="text-xs font-black text-text-main">{iv.score * 10}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex p-2 bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-white rounded-lg transition-all">
                        <ArrowUpRight size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Focus Panel */}
        <div className="lg:col-span-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div 
                key={selected._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card !p-0 overflow-hidden sticky top-24 border-primary/20 shadow-md ring-1 ring-primary/5"
              >
                <div className="bg-primary p-6 text-white space-y-1">
                    <div className="flex justify-between items-start">
                        <Shield size={20} className="opacity-50" />
                        <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 pt-2">Candidate Insight</p>
                    <h3 className="text-2xl font-black tracking-tight leading-none">{selected.userId?.name}</h3>
                    <p className="text-xs font-medium text-secondary-light italic pt-1">{selected.profileData?.jobRole} Round</p>
                </div>

                <div className="p-6 space-y-8">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executive Summary</h4>
                        <p className="text-sm text-text-main font-bold leading-relaxed italic">"{selected.summary}"</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pt-4 border-t border-slate-50">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <ChevronRight size={14} />
                                <span>Strengths</span>
                            </div>
                            <ul className="text-xs space-y-2 font-bold text-slate-600">
                                {selected.strengths.slice(0, 3).map((s, i) => <li key={i} className="flex items-center"><div className="w-1 h-1 rounded-full bg-emerald-400 mr-2" />{s}</li>)}
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                <ChevronRight size={14} />
                                <span>Growth Gaps</span>
                            </div>
                            <ul className="text-xs space-y-2 font-bold text-slate-600">
                                {selected.improvements.slice(0, 3).map((s, i) => <li key={i} className="flex items-center"><div className="w-1 h-1 rounded-full bg-secondary mr-2" />{s}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</span>
                        <span className="text-lg font-black text-text-main">#{Math.floor(Math.random() * 100) + 1}</span>
                    </div>
                    <Button variant="secondary" className="h-10 text-xs px-4">Download PDF</Button>
                </div>
              </motion.div>
            ) : (
              <div className="card h-full flex flex-col items-center justify-center p-12 bg-slate-50/50 border-dashed border-2 border-slate-100">
                 <div className="p-6 bg-white rounded-2xl shadow-sm mb-4">
                    <Shield size={40} className="text-slate-200" />
                 </div>
                 <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] text-center leading-relaxed">Select a candidate profile to unlock deep-dive AI behavioral analytics</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
