import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import Button from '../components/common/Button';
import { Briefcase, Clock, Code, Link as LinkIcon, Camera, Layout } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    jobTitle: '',
    experience: 0,
    skills: '',
    linkedIn: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await api.get('/profile');
        if (data.user?.profile) {
          const p = data.user.profile;
          setProfile({
            jobTitle: p.jobTitle || '',
            experience: p.experience || 0,
            skills: (p.skills || []).join(', '),
            linkedIn: p.linkedIn || ''
          });
        }
      } catch (err) {
        console.error('Profile fetch failed', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setError('');
    setMsg('');
    
    try {
      const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(Boolean);
      await api.put('/profile', { ...profile, skills: skillsArray });
      setMsg('Profile updated successfully!');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const proceedToInterview = async () => {
    if (!profile.jobTitle) {
      setError('Target Job Role is required to generate questions.');
      return;
    }

    const saved = await handleSave();
    if (!saved) return;

    try {
      const data = await api.post('/interview/start', {
        profileData: {
            jobRole: profile.jobTitle,
            experience: profile.experience,
            skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean)
        }
      });
      
      sessionStorage.setItem('interview_data', JSON.stringify({
        id: data.interviewId,
        total: data.questions.length,
        current: data.questions[0],
        allQuestions: data.questions,
        role: profile.jobTitle
      }));
      
      navigate('/camera-check');
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center text-slate-400 font-medium">Loading your profile...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto py-12 px-4 space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-text-main tracking-tight">Professional Profile</h1>
        <p className="text-text-muted">Set your target role and background for a personalized AI interview.</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold">{error}</div>}
      {msg && <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-semibold">{msg}</div>}

      <form onSubmit={handleSave} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="label">Target Job Role</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                className="input pl-12"
                placeholder="e.g. Frontend Developer"
                value={profile.jobTitle}
                onChange={e => setProfile({...profile, jobTitle: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="label">Years of Experience</label>
            <div className="relative">
              <Clock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="number"
                className="input pl-12"
                placeholder="e.g. 2"
                value={profile.experience}
                onChange={e => setProfile({...profile, experience: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">Core Skills (comma separated)</label>
          <div className="relative">
            <Code className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              className="input pl-12"
              placeholder="React, Node.js, TypeScript..."
              value={profile.skills}
              onChange={e => setProfile({...profile, skills: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">LinkedIn URL (Optional)</label>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              className="input pl-12"
              placeholder="https://linkedin.com/in/username"
              value={profile.linkedIn}
              onChange={e => setProfile({...profile, linkedIn: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            type="submit" 
            variant="secondary" 
            className="w-full h-12"
            isLoading={isSaving}
          >
            Save Profile
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={proceedToInterview} 
              className="w-full h-12 shadow-md"
            >
              Start AI Round
            </Button>
          </motion.div>
        </div>
      </form>

      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-start space-x-4">
        <div className="bg-white p-3 rounded-xl shadow-sm text-primary">
          <Camera size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-text-main">Ready for Takeoff?</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            Clicking "Start AI Round" will initialize your interview using the profile data above. Ensure your camera and mic are ready.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
