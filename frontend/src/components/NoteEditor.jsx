import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Pin, Tag, Type, Palette, Save, Trash2, Hash } from 'lucide-react';
import { useNotes } from '../context/NoteContext';
import { toast } from 'react-hot-toast';

const COLORS = [
    '#1f2937', // Default
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
];

const NoteEditor = ({ note, isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isPinned, setIsPinned] = useState(false);
    const [tags, setTags] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [loading, setLoading] = useState(false);
    const [removeImage, setRemoveImage] = useState(false);

    const fileInputRef = useRef(null);
    const { createNote, updateNote } = useNotes();

    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setIsPinned(note.isPinned || false);
            setTags(note.tags?.join(', ') || '');
            setColor(note.color || COLORS[0]);
            setImagePreview(note.image ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${note.image}` : null);
            setRemoveImage(false);
        } else {
            resetForm();
        }
    }, [note, isOpen]);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setImage(null);
        setImagePreview(null);
        setIsPinned(false);
        setTags('');
        setColor(COLORS[0]);
        setRemoveImage(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        setRemoveImage(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error('Note content cannot be empty');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('isPinned', isPinned);
        formData.append('tags', tags);
        formData.append('color', color);
        if (image) formData.append('image', image);
        if (removeImage) formData.append('removeImage', true);

        try {
            if (note) {
                await updateNote(note._id, formData);
            } else {
                await createNote(formData);
            }
            onClose();
        } catch (error) {
            // toast handled in context
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-2xl px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-gray-900 border border-gray-800 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
                style={{ borderTop: `6px solid ${color}` }}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between p-8 pb-4">
                        <div className="flex flex-col">
                            <span className="text-indigo-500 font-black text-[9px] uppercase tracking-[0.4em] mb-1">Entity Manipulation</span>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                                {note ? 'Modify Data Stream' : 'Initialize New Entry'}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-3 bg-gray-950 text-gray-600 hover:text-white rounded-2xl border border-gray-800 transition-all hover:border-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
                        {/* Image Preview Container */}
                        <AnimatePresence>
                            {imagePreview && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-950 border border-gray-800"
                                >
                                    <img src={imagePreview} alt="Preview" className="w-full max-h-[400px] object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-2xl"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            <input
                                type="text"
                                placeholder="Designation..."
                                className="w-full bg-transparent text-4xl sm:text-5xl font-black outline-none border-none text-white placeholder:text-gray-800 tracking-tighter"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <textarea
                                placeholder="BEGIN_INTEL_STREAM..."
                                className="w-full bg-transparent min-h-[300px] outline-none border-none text-gray-400 placeholder:text-gray-800 resize-none text-lg font-medium leading-relaxed"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-4 pt-10 border-t border-gray-800/50">
                            <div className="flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-2xl px-5 py-3.5 flex-1 min-w-[200px] group focus-within:border-indigo-500/50 transition-all">
                                <Hash className="w-4 h-4 text-gray-600 group-focus-within:text-indigo-500" />
                                <input
                                    type="text"
                                    placeholder="TAGS_INPUT"
                                    className="bg-transparent outline-none border-none text-[11px] font-black uppercase tracking-widest text-white placeholder:text-gray-800 w-full"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pro Controller Footer */}
                    <div className="p-8 bg-gray-950 border-t border-gray-800/50 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 p-1.5 bg-gray-900 rounded-2xl border border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                                    title="Add Image"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsPinned(!isPinned)}
                                    className={`p-3 rounded-xl transition-all ${isPinned ? 'text-indigo-400 bg-indigo-600/10 shadow-inner' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                                    title="Prioritize"
                                >
                                    <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            <div className="w-[1px] h-8 bg-gray-800 mx-2" />

                            <div className="flex items-center gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-7 h-7 rounded-xl border-2 transition-all hover:scale-125 ${color === c ? 'border-white scale-110 rotate-12 shadow-2xl shadow-white/20' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                            >
                                Terminate
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[11px] px-10 py-4.5 rounded-[1.5rem] shadow-2xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{loading ? 'Committing...' : 'Commit Changes'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default NoteEditor;
