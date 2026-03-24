import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ message = "Establishing Secure Connection", fullScreen = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-950 ${fullScreen ? 'fixed inset-0 z-[200]' : 'py-20 w-full'}`}>
      <div className="relative flex items-center justify-center">
        {/* Background Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-64 h-64 bg-indigo-500 rounded-full blur-[80px] -z-10"
        />

        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-40 h-40 border-t-2 border-r-2 border-indigo-500/20 rounded-full"
        />

        {/* Middle Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 border-b-2 border-l-2 border-indigo-500/40 rounded-full"
        />

        {/* Inner Pulsing Core */}
        <motion.div
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.5)] flex items-center justify-center transform rotate-12"
        >
          <div className="w-8 h-8 border-2 border-white/30 rounded-lg flex items-center justify-center">
            <div className="w-4 h-1 bg-white/50 rounded-full" />
          </div>
        </motion.div>

        {/* Orbital Particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 5 + i * 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute w-full h-full"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
          </motion.div>
        ))}
      </div>

      {/* Loading Text */}
      <div className="mt-16 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
            className="w-2 h-2 bg-indigo-500 rounded-full"
          />
          <h2 className="text-gray-100 font-black text-[12px] uppercase tracking-[0.5em] text-center">
            {message}
          </h2>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.75 }}
            className="w-2 h-2 bg-indigo-500 rounded-full"
          />
        </div>
        
        {/* Progress Bar (Mimic) */}
        <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <motion.div
            animate={{
              x: [-200, 200],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          />
        </div>

        {/* Decoder Effect Text */}
        <p className="text-gray-600 font-mono text-[9px] uppercase tracking-widest mt-2">
          Syncing Neural Key... [AUTH_OK]
        </p>
      </div>
    </div>
  );
};

export default Loading;
