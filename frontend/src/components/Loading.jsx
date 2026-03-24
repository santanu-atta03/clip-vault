import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ message = "Establishing Secure Connection", fullScreen = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-950 ${fullScreen ? 'fixed inset-0 z-[200]' : 'py-20 w-full'}`}>
      <div className="relative flex items-center justify-center">
        {/* Background Glow */}
        <motion.div
          animate={{
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-48 h-48 bg-indigo-500 rounded-full blur-[60px] -z-10"
        />

        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 border-t-2 border-indigo-500/30 rounded-full"
        />

        {/* Inner Pulsing Core */}
        <motion.div
          animate={{
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-12 h-12 bg-indigo-600 rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center transform rotate-12"
        >
          <div className="w-6 h-6 border-2 border-white/20 rounded-lg flex items-center justify-center" />
        </motion.div>

        {/* Orbital Particles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
        </motion.div>
      </div>

      {/* Loading Text */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <h2 className="text-gray-100 font-bold text-[10px] uppercase tracking-[0.4em] text-center">
          {message}
        </h2>
        
        {/* Progress Bar (Mimic) */}
        <div className="w-40 h-1 bg-gray-900 rounded-full overflow-hidden">
          <motion.div
            animate={{
              x: [-160, 160],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-1/2 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
