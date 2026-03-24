import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-gray-900 rounded-2xl ${className}`}
    />
  );
};

export const NoteCardSkeleton = () => (
  <div className="bg-gray-900/40 border border-gray-800 rounded-[2rem] p-6 h-64 flex flex-col justify-between">
    <div>
      <div className="flex justify-between mb-4">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="w-full h-6 mb-4" />
      <Skeleton className="w-3/4 h-4 mb-2" />
      <Skeleton className="w-1/2 h-4" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="w-12 h-4 rounded-full" />
      <Skeleton className="w-12 h-4 rounded-full" />
    </div>
  </div>
);

export const PostSkeleton = () => (
  <div className="flex gap-4 p-4 border border-gray-800 rounded-2xl">
    <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
    <div className="flex-1 space-y-3">
      <div className="flex gap-4">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-3" />
      </div>
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-5/6 h-4" />
    </div>
  </div>
);

export default Skeleton;
