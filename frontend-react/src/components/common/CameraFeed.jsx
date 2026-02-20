import React, { useEffect, useRef } from 'react';
import { Camera as CameraIcon, CameraOff } from 'lucide-react';

const CameraFeed = ({ isActive }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Error accessing camera:", err));
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-soft">
      {isActive ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }} // Mirror the feed
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
          <CameraOff size={48} />
          <p className="font-medium">Camera is off</p>
        </div>
      )}
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
        <span className="text-white text-xs font-bold uppercase tracking-wider">Rec</span>
      </div>
    </div>
  );
};

export default CameraFeed;
