import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import Button from '../components/common/Button';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (data.user.role !== formData.role) {
        throw new Error(`Account registered as ${data.user.role}`);
      }

      localStorage.setItem('initium_token', data.token);
      localStorage.setItem('initium_user', JSON.stringify(data.user));
      
      navigate(data.user.role === 'admin' ? '/admin' : '/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex justify-center items-center py-20 px-4"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-text-main tracking-tight">Initium.AI</h1>
          <p className="text-text-muted">Professional AI-powered interview platform</p>
        </div>

        <div className="card space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${formData.role === 'candidate' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              onClick={() => setFormData({...formData, role: 'candidate'})}
            >
              Candidate
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${formData.role === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              onClick={() => setFormData({...formData, role: 'admin'})}
            >
              HR / Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    className="input pl-12"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    className="input pl-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>
                <LogIn size={20} className="mr-2" />
                Sign In
              </Button>
            </motion.div>
          </form>

          <p className="text-center text-sm text-text-muted font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-bold">
              Join Initium today
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
