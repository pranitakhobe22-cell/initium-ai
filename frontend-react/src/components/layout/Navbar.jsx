import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield, Layout, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('initium_user'));

  const handleLogout = () => {
    localStorage.removeItem('initium_token');
    localStorage.removeItem('initium_user');
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isInterview = location.pathname === '/interview';

  return (
    <nav className="bg-white border-b border-slate-100 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div 
            whileHover={{ rotate: 10 }}
            className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm"
          >
            I
          </motion.div>
          <span className="text-2xl font-black tracking-tight text-text-main group-hover:text-primary transition-colors">Initium.AI</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          {!isInterview && (
            <div className="flex items-center space-x-6 mr-6 pr-6 border-r border-slate-100 hidden md:flex">
                {isAdmin ? (
                    <Link 
                        to="/admin" 
                        className={`font-bold flex items-center space-x-2 transition-colors ${location.pathname === '/admin' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Shield size={18} />
                        <span>Admin Console</span>
                    </Link>
                ) : (
                    <Link 
                        to="/profile" 
                        className={`font-bold flex items-center space-x-2 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Briefcase size={18} />
                        <span>Dashboard</span>
                    </Link>
                )}
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block leading-tight">
              <p className="font-bold text-text-main">{user.name}</p>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{user.role}</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2.5 text-text-muted hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              title="Sign Out"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
