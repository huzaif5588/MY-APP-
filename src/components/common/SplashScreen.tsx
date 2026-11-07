import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  academyName: string;
  location: string;
  tagline: string;
  director: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onDismiss,
  academyName,
  location,
  tagline,
  director,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 45);

    const autoClose = setTimeout(() => {
      onDismiss();
    }, 2400);

    return () => {
      clearInterval(timer);
      clearTimeout(autoClose);
    };
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0B192C] text-white p-6 overflow-hidden select-none"
      >
        {/* Subtle Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,62,98,0.45)_0%,transparent_70%)] pointer-events-none" />

        {/* Top Header Badge */}
        <div className="pt-safe w-full max-w-sm flex items-center justify-between text-xs text-amber-300/80 tracking-widest font-mono">
          <span>SECURE SYSTEM</span>
          <span>ESTD. KALABAGH</span>
        </div>

        {/* Center Animated Logo & Branding */}
        <div className="flex flex-col items-center text-center my-auto relative z-10">
          {/* Glowing Animated Ring */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
          >
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500/20 to-blue-500/20 p-2 border border-amber-400/30 flex items-center justify-center shadow-2xl shadow-blue-950/80">
              <img 
                src="/indus-logo.svg" 
                alt="Indus Academy Official Emblem" 
                className="w-28 h-28 object-contain filter drop-shadow-[0_4px_16px_rgba(212,175,55,0.35)]" 
              />
            </div>
            {/* Pulsing micro ornament */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute -inset-2 rounded-full border border-dashed border-amber-400/20 pointer-events-none"
            />
          </motion.div>

          {/* Academy Name */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-wider font-display bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent"
          >
            {academyName}
          </motion.h1>

          {/* Location */}
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-sm font-semibold tracking-widest text-slate-300 uppercase mt-1"
          >
            {location}
          </motion.p>

          {/* Tagline */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-300 tracking-widest"
          >
            <span>{tagline}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="text-[11px] text-slate-400 mt-2 tracking-wide"
          >
            Under the Leadership of {director}
          </motion.p>
        </div>

        {/* Bottom Loading Progress & Quick Skip */}
        <div className="pb-safe w-full max-w-sm flex flex-col items-center gap-4 relative z-10">
          <div className="w-full">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
              <span>Synchronizing Local Database...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-amber-300 transition-all active:scale-95 shadow-lg"
          >
            <span>Enter Academy Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
