import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, CameraOff, CheckCircle, Video, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import CameraFeed from '../components/common/CameraFeed';

const CameraCheck = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
      setIsChecking(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasPermission(true);
          // Stop stream immediately after checking
          stream.getTracks().forEach(track => track.stop());
      } catch (err) {
          console.error("Permission denied:", err);
          setHasPermission(false);
      } finally {
          setIsChecking(false);
      }
  };

  const proceed = () => {
      navigate('/interview');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-4 space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-black text-text-main tracking-tight">System Check</h1>
        <p className="text-text-muted">Ensure your camera and microphone are working correctly before we begin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <CameraFeed isActive={hasPermission} />
          
          <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className={`p-2 rounded-full ${hasPermission ? 'bg-success/20 text-success' : 'bg-slate-100 text-slate-400'}`}>
                {hasPermission ? <CheckCircle size={20} /> : <CameraOff size={20} />}
            </div>
            <div>
                <p className="font-bold text-sm text-text-main">
                    {hasPermission ? 'Camera & Audio Active' : 'Waiting for Permissions'}
                </p>
                <p className="text-xs text-text-muted">
                    {hasPermission ? 'Your hardware is ready.' : 'Click "Grant Access" if prompted by your browser.'}
                </p>
            </div>
          </div>
        </div>

        <div className="card space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-text-main flex items-center space-x-2">
                <ShieldCheck className="text-primary" size={24} />
                <span>Interview Guidelines</span>
            </h3>
            <ul className="space-y-4">
                {[
                    { icon: Video, text: "Ensure you are in a well-lit room." },
                    { icon: CheckCircle, text: "Check that your background is professional." },
                    { icon: CheckCircle, text: "Speak clearly and maintain eye contact." }
                ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm text-text-muted">
                        <item.icon className="text-primary shrink-0 mt-0.5" size={18} />
                        <span>{item.text}</span>
                    </li>
                ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-3">
            <Button 
                onClick={proceed} 
                disabled={!hasPermission || isChecking} 
                className="w-full h-14 text-lg"
            >
                Proceed to Interview
            </Button>
            <button 
                onClick={checkPermissions}
                className="w-full text-sm font-bold text-primary hover:underline py-2"
            >
                Re-check Permissions
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CameraCheck;
