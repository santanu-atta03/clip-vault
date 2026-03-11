import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, Trash2, Edit3, Copy, Check, Hash, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { useNotes } from '../context/NoteContext';

const NoteCard = ({ note, onEdit, onDelete }) => {
    const [copied, setCopied] = useState(false);
    const { updateNote } = useNotes();
    const imageUrl = note.image ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${note.image}` : null;

    const handleCopy = () => {
        navigator.clipboard.writeText(note.content);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePin = async (e) => {
        e.stopPropagation();
        try {
            await updateNote(note._id, { isPinned: !note.isPinned });
        } catch (error) {
            // toast handled in context
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(note);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl group h-fit overflow-hidden flex flex-col shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
            style={{ borderTopColor: note.color, borderTopWidth: note.color ? '4px' : '1px' }}
        >
            {imageUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-800">
                    <img
                        src={imageUrl}
                        alt={note.title || 'Note image'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-black text-white line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors tracking-tighter">
                        {note.title || 'Untitled Note'}
                    </h3>
                    <button
                        onClick={handlePin}
                        className={`p-2 rounded-xl transition-all ${note.isPinned ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-600 hover:bg-gray-800 hover:text-gray-300'}`}
                    >
                        <Pin size={18} className={`${note.isPinned ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <div className="text-gray-400 text-sm mb-6 prose prose-invert max-w-none line-clamp-6 leading-relaxed">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>

                {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {note.tags.map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-800 group-hover:border-indigo-500/30 transition-all">
                                <Hash size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-800">
                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                        {new Date(note.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleCopy}
                            className="p-2 text-gray-600 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                            title="Copy"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                        <button
                            onClick={() => onEdit(note)}
                            className="p-2 text-gray-600 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                            title="Edit"
                        >
                            <Edit3 size={18} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NoteCard;
