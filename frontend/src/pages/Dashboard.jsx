import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Clipboard, LayoutGrid, LayoutList, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';

const Dashboard = () => {
    const { notes, loading, fetchNotes } = useNotes();
    const { user, logout } = useAuth();
    const [search, setSearch] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotes();
    }, []);

    const filteredNotes = notes.filter(note => {
        const matchesSearch =
            note.title?.toLowerCase().includes(search.toLowerCase()) ||
            note.content.toLowerCase().includes(search.toLowerCase()) ||
            note.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

        if (filter === 'pinned') return matchesSearch && note.isPinned;
        if (filter === 'images') return matchesSearch && note.image;
        return matchesSearch;
    });

    const handleEditNote = (note) => {
        setEditingNote(note);
        setIsEditorOpen(true);
    };

    const handleCreateNote = () => {
        setEditingNote(null);
        setIsEditorOpen(true);
    };

    return (
        <main className="flex-1 w-full bg-gray-950 overflow-y-auto custom-scrollbar px-6 sm:px-12 py-12 sm:py-20">
            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="max-w-xl">
                    <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Secure Workspace</span>
                    <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter mb-6 lowercase">my_vault</h1>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        Personal intelligence repository. Synchronized across the network with end-to-end accessibility.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-4 px-6 py-4 bg-gray-900/50 border border-gray-900 rounded-[2rem] shadow-2xl backdrop-blur-xl">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xl shadow-indigo-600/20 transform rotate-3">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{user?.username}</span>
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-tighter">Authorized Operator</span>
                        </div>
                        <div className="w-[1px] h-6 bg-gray-800 mx-2" />
                        <button onClick={logout} className="text-gray-600 hover:text-red-500 transition-all p-2 bg-gray-950 rounded-xl border border-gray-900 hover:border-red-500/20">
                            <LogOut size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleCreateNote}
                        className="p-5 bg-indigo-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all sm:hidden active:scale-95"
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

            {/* Precision Controls */}
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between mb-16 animate-in fade-in slide-in-from-bottom-3 duration-1000 fill-mode-both">
                <div className="relative w-full xl:max-w-2xl group">
                    <div className="absolute inset-0 bg-indigo-600/5 blur-3xl -z-10 group-focus-within:bg-indigo-600/10 transition-colors" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="INTEL-SEARCH..."
                        className="w-full bg-gray-900/40 border border-gray-800/50 rounded-[2rem] pl-16 pr-8 py-6 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 transition-all placeholder:text-gray-800 font-black tracking-widest text-[11px] backdrop-blur-xl shadow-2xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
                    <div className="flex bg-gray-900/50 p-2 rounded-[2rem] border border-gray-800/50 shadow-2xl backdrop-blur-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                        {['all', 'pinned', 'images'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f ? 'bg-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.4)]' : 'text-gray-600 hover:text-gray-300'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCreateNote}
                        className="hidden sm:flex items-center justify-center gap-4 bg-gray-950 text-white py-5 px-10 rounded-[2rem] shadow-2xl border border-gray-900 hover:border-indigo-500/50 hover:bg-indigo-600/5 transition-all font-black text-[11px] uppercase tracking-widest group"
                    >
                        <Plus className="w-5 h-5 text-indigo-500 group-hover:scale-125 transition-transform" />
                        <span>Inject Intel</span>
                    </button>
                </div>
            </div>

            {loading && notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full animate-pulse" />
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin relative z-10" />
                    </div>
                    <p className="text-gray-700 font-black uppercase text-[10px] tracking-[0.4em]">Establishing Sync...</p>
                </div>
            ) : filteredNotes.length > 0 ? (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-8 mb-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AnimatePresence mode="popLayout text-white">
                        {filteredNotes.map((note, idx) => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onEdit={handleEditNote}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center bg-gray-950/50 rounded-[3rem] border border-dashed border-gray-900 animate-in fade-in duration-700">
                    <div className="p-8 bg-gray-900 text-gray-800 rounded-[2.5rem] mb-8 border border-gray-900 shadow-2xl group transition-all">
                        <Clipboard className="w-16 h-16 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Vault Isolated</h3>
                    <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium leading-relaxed uppercase tracking-widest text-[10px]">
                        {search ? 'Protocol Error: No matching intelligence detected in current scope.' : 'Repository empty. Awaiting telemetry injection to initialize workspace.'}
                    </p>
                    {!search && (
                        <button
                            onClick={handleCreateNote}
                            className="mt-12 text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:text-indigo-300 flex items-center gap-3 mx-auto bg-indigo-600/5 px-10 py-5 rounded-2xl border border-indigo-500/10 hover:border-indigo-500/30 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Initialize Protocol
                        </button>
                    )}
                </div>
            )}

            {/* Note Editor Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <NoteEditor
                        isOpen={isEditorOpen}
                        note={editingNote}
                        onClose={() => {
                            setIsEditorOpen(false);
                            setEditingNote(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </main>
    );
};

export default Dashboard;
