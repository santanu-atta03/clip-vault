import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Folder as FolderIcon, FileText, Upload, Plus, Trash2, ArrowLeft, MoreVertical, X, Loader2, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import archiveService from '../services/archiveService';
import Modal from '../components/Modal';

const Archives = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentFolderId = searchParams.get('folder') || null;

    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isConfirm: false, onConfirm: null });

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchArchives();
    }, [currentFolderId]);

    const fetchArchives = async () => {
        try {
            setLoading(true);
            const data = await archiveService.getArchives(currentFolderId);
            setFolders(data.folders);
            setDocuments(data.documents);
            setBreadcrumbs(data.breadcrumbs);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync data center');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            setIsCreatingFolder(true);
            const folder = await archiveService.createFolder(newFolderName, currentFolderId, '#4f46e5');
            setFolders(prev => [folder, ...prev]);
            setNewFolderName('');
            setIsCreateFolderOpen(false);
            toast.success('Directory established');
        } catch (error) {
            toast.error('Failed to initialize directory');
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        const formData = new FormData();
        formData.append('file', uploadFile);
        if (currentFolderId) {
            formData.append('folder', currentFolderId);
        }

        try {
            setIsUploading(true);
            const doc = await archiveService.uploadDocument(formData);
            setDocuments(prev => [doc, ...prev]);
            setUploadFile(null);
            setIsUploadOpen(false);
            toast.success('Document uploaded to vault');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to transmit document');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteFolder = (id) => {
        setModal({
            isOpen: true,
            title: 'Delete Directory?',
            message: 'Are you sure you want to permanently erase this folder? Operations within are irreversible.',
            type: 'warning',
            isConfirm: true,
            confirmText: 'Purge',
            onConfirm: async () => {
                try {
                    await archiveService.deleteFolder(id);
                    setFolders(prev => prev.filter(f => f._id !== id));
                    toast.success('Directory purged');
                } catch (error) {
                    toast.error('Failed to purge directory');
                }
            }
        });
    };

    const handleDeleteDocument = (id) => {
        setModal({
            isOpen: true,
            title: 'Delete Document?',
            message: 'Are you sure you want to permanently erase this document? Operations within are irreversible.',
            type: 'warning',
            isConfirm: true,
            confirmText: 'Purge',
            onConfirm: async () => {
                try {
                    await archiveService.deleteDocument(id);
                    setDocuments(prev => prev.filter(d => d._id !== id));
                    toast.success('Document purged');
                } catch (error) {
                    toast.error('Failed to purge document');
                }
            }
        });
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <main className="flex-1 w-full bg-gray-950 overflow-y-auto custom-scrollbar px-6 sm:px-12 py-12 sm:py-20 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div>
                    <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Central Repository</span>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter lowercase">data_center</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="px-6 py-4 bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-600/10 text-white rounded-[1.5rem] font-black tracking-widest uppercase text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-xl"
                    >
                        <FolderIcon size={16} className="text-indigo-400" />
                        <span className="hidden sm:inline">New Directory</span>
                    </button>
                    <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="px-6 py-4 bg-indigo-600 border border-indigo-500 text-white hover:bg-indigo-500 rounded-[1.5rem] shadow-[0_10px_30px_rgba(79,70,229,0.3)] font-black tracking-widest uppercase text-[10px] flex items-center gap-3 transition-all active:scale-95"
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">Inject Document</span>
                    </button>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8 bg-gray-900/40 p-4 rounded-3xl border border-gray-800/50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both">
                <button
                    onClick={() => setSearchParams({})}
                    className={`text-[11px] font-black uppercase tracking-widest p-2 rounded-xl transition-all ${!currentFolderId ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                >
                    Root Access
                </button>
                
                {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb._id}>
                        <ChevronRight size={14} className="text-gray-600" />
                        <button
                            onClick={() => setSearchParams({ folder: crumb._id })}
                            className={`text-[11px] font-black uppercase tracking-widest p-2 rounded-xl transition-all ${idx === breadcrumbs.length - 1 ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                        >
                            {crumb.name}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full animate-pulse" />
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin relative z-10" />
                    </div>
                    <p className="text-gray-700 font-black uppercase text-[10px] tracking-[0.4em]">Decyphering Archives...</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Folders Section */}
                    {folders.length > 0 && (
                        <div>
                            <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-3">
                                <FolderIcon size={14} /> Directories
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {folders.map((folder, idx) => (
                                    <div 
                                        key={folder._id} 
                                        className="group bg-gray-900/50 border border-gray-800 rounded-3xl p-6 hover:bg-gray-800 hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                        onClick={(e) => {
                                            if (e.target.closest('.delete-btn')) return;
                                            setSearchParams({ folder: folder._id });
                                        }}
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-start justify-between">
                                            <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 group-hover:border-indigo-500/20 transition-all">
                                                <FolderIcon size={28} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                            </div>
                                            <button 
                                                className="delete-btn p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFolder(folder._id);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h4 className="text-white font-black mt-6 truncate">{folder.name}</h4>
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                            {new Date(folder.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents Section */}
                    {documents.length > 0 && (
                        <div>
                            <h3 className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-3">
                                <FileText size={14} /> Encrypted Files
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {documents.map((doc, idx) => (
                                    <div 
                                        key={doc._id} 
                                        className="group bg-gray-900/50 border border-gray-800 rounded-3xl p-6 hover:bg-gray-800 transition-all relative overflow-hidden flex flex-col justify-between animate-in fade-in slide-in-from-bottom-3 fill-mode-both shadow-lg"
                                        style={{ animationDelay: `${(idx + folders.length) * 50}ms` }}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                                    <FileText size={28} className="text-emerald-400" />
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <a 
                                                        href={doc.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all relative z-10"
                                                        title="Download / View"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                    <button 
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all relative z-10"
                                                        onClick={() => handleDeleteDocument(doc._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="text-gray-300 font-bold truncate group-hover:text-white transition-colors" title={doc.originalName}>{doc.originalName}</h4>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{formatSize(doc.size)}</span>
                                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest bg-gray-950 px-2 py-1 rounded-lg border border-gray-800">{doc.originalName.split('.').pop()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {folders.length === 0 && documents.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-950/50 rounded-[3rem] border border-dashed border-gray-900 animate-in fade-in duration-700">
                            <div className="p-8 bg-gray-900 text-gray-800 rounded-[2.5rem] mb-8 border border-gray-900 shadow-2xl group transition-all">
                                <FolderIcon className="w-16 h-16 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Sector is empty</h3>
                            <p className="text-gray-600 max-w-sm mx-auto text-sm font-medium leading-relaxed uppercase tracking-widest text-[10px]">
                                This section of the archive contains no intel. Establish new directories or inject documents directly.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Folder Modal */}
            <AnimatePresence>
                {isCreateFolderOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        onClick={() => setIsCreateFolderOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white">Initialize Directory</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-black">Archive Structural Protocol</p>
                                </div>
                                <button onClick={() => setIsCreateFolderOpen(false)} className="text-gray-500 hover:text-white p-2 bg-gray-800 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateFolder}>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Directory Name Target</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-950 border border-gray-800 text-white p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-gray-700 font-bold"
                                        placeholder="e.g. Confidential Intel"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={!newFolderName.trim() || isCreatingFolder}
                                    className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(79,70,229,0.2)]"
                                >
                                    {isCreatingFolder ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Initialization'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Document Modal */}
            <AnimatePresence>
                {isUploadOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                        onClick={() => setIsUploadOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white">Inject Document</h3>
                                    <p className="text-[10px] text-emerald-500 uppercase tracking-widest mt-1 font-black">Supported: PDF, DOCX, TXT, CSV</p>
                                </div>
                                <button onClick={() => { setIsUploadOpen(false); setUploadFile(null); }} className="text-gray-500 hover:text-white p-2 bg-gray-800 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleFileUpload}>
                                {!uploadFile ? (
                                    <div 
                                        className="border-2 border-dashed border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-[2rem] p-12 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[250px] group"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <div className="p-6 bg-gray-950 rounded-full mb-6 border border-gray-800 group-hover:border-emerald-500/30 transition-all shadow-xl">
                                            <Upload className="w-10 h-10 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <p className="text-white font-black group-hover:text-emerald-300 transition-colors">Select Data Stream</p>
                                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-3">Click to browse securely</p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-950 border border-gray-800 rounded-[2rem] p-6 flex items-start gap-4">
                                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shrink-0">
                                            <FileText size={24} className="text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white font-black truncate">{uploadFile.name}</p>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{formatSize(uploadFile.size)}</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setUploadFile(null)} 
                                            className="text-gray-500 hover:text-red-400 p-2 shrink-0 bg-gray-900 rounded-xl hover:bg-red-500/10 transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx,.txt,.csv,.rtf,.xls,.xlsx,.ppt,.pptx"
                                    onChange={(e) => {
                                        if (e.target.files[0]) setUploadFile(e.target.files[0]);
                                    }}
                                />

                                <div className="flex gap-4 mt-8">
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsUploadOpen(false); setUploadFile(null); }}
                                        className="flex-1 bg-gray-950 border border-gray-800 hover:bg-gray-800 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={!uploadFile || isUploading}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                                    >
                                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : 'Execute Injection'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal 
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                isConfirm={modal.isConfirm}
                onConfirm={modal.onConfirm}
                confirmText={modal.confirmText}
            />
        </main>
    );
};

export default Archives;
