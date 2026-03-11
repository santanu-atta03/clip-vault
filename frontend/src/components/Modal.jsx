import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    type = 'info', 
    onConfirm, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    isConfirm = false 
}) => {
    if (!isOpen) return null;

    const icons = {
        info: <HelpCircle className="text-indigo-500" size={32} />,
        error: <AlertCircle className="text-red-500" size={32} />,
        success: <CheckCircle2 className="text-green-500" size={32} />,
        warning: <AlertCircle className="text-amber-500" size={32} />
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative z-10 overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 -z-10 ${
                            type === 'error' ? 'bg-red-500' : 
                            type === 'warning' ? 'bg-amber-500' : 
                            type === 'success' ? 'bg-green-500' : 'bg-indigo-500'
                        }`} />

                        <div className="flex flex-col items-center text-center">
                            <div className={`p-5 rounded-[1.5rem] mb-6 border ${
                                type === 'error' ? 'bg-red-500/10 border-red-500/20' : 
                                type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 
                                type === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-indigo-500/10 border-indigo-500/20'
                            }`}>
                                {icons[type]}
                            </div>

                            <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase italic">{title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-10 font-medium">
                                {message}
                            </p>

                            <div className="flex items-center gap-4 w-full">
                                {isConfirm ? (
                                    <>
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-4 px-6 bg-gray-950 hover:bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-gray-800 transition-all active:scale-95"
                                        >
                                            {cancelText}
                                        </button>
                                        <button
                                            onClick={() => {
                                                onConfirm();
                                                onClose();
                                            }}
                                            className={`flex-1 py-4 px-6 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 ${
                                                type === 'error' ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' : 
                                                'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                                            }`}
                                        >
                                            {confirmText}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                                    >
                                        Acknowledge
                                    </button>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
