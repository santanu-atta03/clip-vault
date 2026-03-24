import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Send,
    Image as ImageIcon,
    Users,
    Settings,
    Trash2,
    MoreVertical,
    Calendar,
    Shield,
    Loader2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import serverService from '../services/serverService';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { PostSkeleton } from '../components/Skeleton';

const ServerPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [server, setServer] = useState(null);
    const [posts, setPosts] = useState([]);
    const [members, setMembers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [postPreview, setPostPreview] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', isConfirm: false, onConfirm: null });
    const socketRef = useRef();
    const scrollRef = useRef();

    useEffect(() => {
        fetchServerData();

        // Setup Socket.io
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        socketRef.current = io(socketUrl);

        socketRef.current.emit('join_server', id);

        socketRef.current.on('new_post', (post) => {
            setPosts(prev => [post, ...prev]);
        });

        socketRef.current.on('post_deleted', (postId) => {
            setPosts(prev => prev.filter(p => p._id !== postId));
        });

        socketRef.current.on('join_request', (data) => {
            if (server?.role === 'Owner' || server?.role === 'Admin') {
                setRequests(prev => [...prev, data]);
                // You could show a toast here
            }
        });

        socketRef.current.on('member_joined', (data) => {
            // Show a message that user has joined or refresh members
            const fetchMembers = async () => {
                const membersData = await serverService.getServerMembers(id);
                setMembers(membersData);
            };
            fetchMembers();
        });

        socketRef.current.emit('join_user', user._id);

        return () => {
            socketRef.current.emit('leave_server', id);
            socketRef.current.disconnect();
        };
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [posts]);

    const fetchServerData = async () => {
        try {
            setLoading(true);
            const serverData = await serverService.getServer(id);
            setServer(serverData);

            const postsData = await serverService.getServerPosts(id, 1);
            setPosts(postsData.posts);
            setHasMore(postsData.currentPage < postsData.totalPages);
            setPage(1);

            if (serverData.role === 'Owner' || serverData.role === 'Admin') {
                const requestsData = await serverService.getServerRequests(id);
                setRequests(requestsData);
            }

            const membersData = await serverService.getServerMembers(id);
            setMembers(membersData);
        } catch (err) {
            console.error('Error loading server:', err);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchMorePosts = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const data = await serverService.getServerPosts(id, nextPage);
            setPosts(prev => [...prev, ...data.posts]);
            setPage(nextPage);
            setHasMore(data.currentPage < data.totalPages);
        } catch (err) {
            console.error('Error loading more posts:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!postText.trim() && !postImage) return;

        setIsPosting(true);
        const formData = new FormData();
        formData.append('text', postText);
        if (postImage) formData.append('image', postImage);

        try {
            await serverService.createPost(id, formData);
            setPostText('');
            setPostImage(null);
            setPostPreview(null);
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Transmission Error',
                message: 'Failed to inject intel stream into the server cluster.',
                type: 'error'
            });
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeletePost = (postId) => {
        setModal({
            isOpen: true,
            title: 'Delete Intel',
            message: 'Are you sure you want to permanently purge this intel from the server history?',
            type: 'warning',
            isConfirm: true,
            onConfirm: async () => {
                try {
                    await serverService.deletePost(postId);
                } catch (err) {
                    setModal({
                        isOpen: true,
                        title: 'Purge Failed',
                        message: 'The system could not eliminate the specified data stream.',
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await serverService.acceptRequest(requestId);
            setRequests(requests.filter(r => r._id !== requestId));
            // Refresh members
            const membersData = await serverService.getServerMembers(id);
            setMembers(membersData);
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Authorization Error',
                message: 'Failed to process member validation request.',
                type: 'error'
            });
        }
    };

    const handleLeaveServer = () => {
        setModal({
            isOpen: true,
            title: 'Sever Connection?',
            message: 'You are about to disconnect from this cluster. All synchronized telemetry will be lost.',
            type: 'warning',
            isConfirm: true,
            confirmText: 'Disconnect',
            onConfirm: async () => {
                try {
                    await serverService.leaveServer(id);
                    navigate('/dashboard');
                } catch (err) {
                    setModal({
                        isOpen: true,
                        title: 'Disconnect Error',
                        message: err.response?.data?.message || 'Failed to sever connection protocol.',
                        type: 'error'
                    });
                }
            }
        });
    };

    if (loading && !server) {
        return (
            <div className="flex-1 bg-gray-950 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl animate-pulse" />
                    <div className="ml-4 w-32 h-4 bg-gray-800 rounded animate-pulse" />
                </header>
                <div className="flex-1 p-6 space-y-6">
                    {[...Array(5)].map((_, i) => <PostSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-950 flex flex-col h-screen overflow-hidden relative">
            {/* Top Bar */}
            <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700 shrink-0">
                        {server.icon ? (
                            <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-indigo-400 font-bold">{server.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-black text-sm sm:text-lg truncate tracking-tight">#{server.name}</h1>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">
                            <span className="flex items-center gap-1 shrink-0"><Users size={10} /> {server.memberCount}</span>
                            <span className="hidden sm:inline bg-indigo-500/10 text-indigo-400 px-1.5 rounded-sm">{server.role}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowMembers(!showMembers)}
                        className={`p-2 rounded-xl transition-all ${showMembers ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        title="Members"
                    >
                        <Users size={20} />
                    </button>

                    {(server.role === 'Owner' || server.role === 'Admin') && (
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            title="Management"
                        >
                            <Settings size={20} />
                            {requests.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-gray-900"></span>
                            )}
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Feed */}
                <div className="flex-1 flex flex-col bg-gray-950 relative overflow-hidden">
                    <div
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar"
                        ref={scrollRef}
                    >
                        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pt-4">
                            {posts.map((post) => (
                                <div key={post._id} className="flex gap-3 sm:gap-4 group animate-in slide-in-from-bottom-3 duration-500">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-white font-black text-xs shrink-0 group-hover:border-indigo-500/30 transition-all shadow-lg">
                                        {post.author.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                            <span className="text-sm font-black text-white hover:text-indigo-400 cursor-pointer transition-colors">{post.author.username}</span>
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                                {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            {(post.author._id === user._id || server.role === 'Admin' || server.role === 'Owner') && (
                                                <button
                                                    onClick={() => handleDeletePost(post._id)}
                                                    className="p-1 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>

                                        {post.image && (
                                            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-800 max-w-xl shadow-2xl group/img relative">
                                                <img src={post.image} alt="Shared content" className="w-full h-auto cursor-zoom-in hover:scale-[1.01] transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/20 to-transparent pointer-events-none" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {hasMore && (
                                <div className="flex justify-center py-6">
                                    <button
                                        onClick={fetchMorePosts}
                                        disabled={loadingMore}
                                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-900/50 hover:bg-gray-900 border border-gray-800 px-6 py-3 rounded-2xl transition-all"
                                    >
                                        {loadingMore ? <Loader2 size={14} className="animate-spin" /> : 'Load message history'}
                                    </button>
                                </div>
                            )}

                            {posts.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 text-center opacity-40">
                                    <div className="p-6 bg-gray-900 rounded-full mb-6 border border-gray-800">
                                        <Users className="w-12 h-12 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-black text-white">Beginning of the conversation</h3>
                                    <p className="text-gray-500 text-sm mt-2">Be the first to share something with the members of #{server.name}!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Post Input */}
                    <div className="p-4 sm:p-6 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent border-t border-gray-800/50">
                        <form onSubmit={handlePostSubmit} className="max-w-4xl mx-auto">
                            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-2xl flex flex-col">
                                {postPreview && (
                                    <div className="p-2 pt-0 w-fit relative group/preview">
                                        <img src={postPreview} className="h-28 sm:h-40 rounded-2xl border border-gray-800 shadow-xl" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => { setPostImage(null); setPostPreview(null); }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:scale-110 active:scale-95 transition-transform"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('post-image').click()}
                                        className="p-3 text-gray-500 hover:text-indigo-400 transition-colors shrink-0"
                                    >
                                        <ImageIcon size={22} />
                                        <input
                                            id="post-image"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setPostImage(file);
                                                    setPostPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </button>

                                    <textarea
                                        placeholder={`Message in #${server.name}...`}
                                        rows="1"
                                        value={postText}
                                        onChange={(e) => {
                                            setPostText(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                        }}
                                        className="flex-1 bg-transparent py-3 px-1 text-white border-none focus:ring-0 resize-none text-sm sm:text-base placeholder:text-gray-600 custom-scrollbar"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handlePostSubmit(e);
                                            }
                                        }}
                                    />

                                    <button
                                        type="submit"
                                        disabled={isPosting || (!postText.trim() && !postImage)}
                                        className="p-3 sm:p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                    >
                                        {isPosting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Members Sidebar */}
                <aside className={`${showMembers ? 'w-64 sm:w-72 fixed sm:relative inset-y-0 right-0 z-40 sm:z-10 border-l' : 'w-0 overflow-hidden'} bg-gray-950 border-gray-800 transition-all duration-300 flex flex-col shrink-0 sm:shadow-none shadow-[-20px_0_50px_rgba(0,0,0,0.5)]`}>
                    <div className="p-4 sm:p-6 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <Users size={16} />
                            Directory
                        </h3>
                        <button onClick={() => setShowMembers(false)} className="sm:hidden p-1 text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                        <div className="space-y-8">
                            {['Owner', 'Admin', 'Member'].map(role => (
                                <div key={role}>
                                    <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-4">
                                        {role}s — {members.filter(m => m.role === role).length}
                                    </h4>
                                    <div className="space-y-4">
                                        {members.filter(m => m.role === role).map(member => (
                                            <div key={member._id} className="flex items-center gap-3 group">
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-xs font-black text-gray-500 group-hover:border-indigo-500 transition-all">
                                                        {member.user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-[3px] border-gray-950"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-gray-400 group-hover:text-white transition-colors truncate">{member.user.username}</p>
                                                    <span className={`text-[9px] uppercase font-black tracking-widest ${role === 'Owner' ? 'text-amber-500' : role === 'Admin' ? 'text-indigo-400' : 'text-gray-700'}`}>
                                                        {role}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile member sidebar */}
                {showMembers && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 sm:hidden"
                        onClick={() => setShowMembers(false)}
                    />
                )}

                {/* Management Modal */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                            >
                                <div className="p-6 sm:p-8 border-b border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Management</h2>
                                        <p className="text-sm text-gray-500 mt-1 uppercase font-black tracking-widest text-[10px]">Security and Infrastructure</p>
                                    </div>
                                    <button onClick={() => setShowSettings(false)} className="p-3 text-gray-500 hover:text-white bg-gray-800 rounded-2xl transition-all shadow-xl">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-12">
                                    <section>
                                        <h3 className="text-white font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-lg"><Shield size={16} className="text-indigo-400" /></div>
                                            Access Requests ({requests.length})
                                        </h3>
                                        {requests.length === 0 ? (
                                            <div className="py-12 text-center bg-gray-950/50 rounded-3xl border border-gray-800 border-dashed">
                                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">No candidates pending</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {requests.map(request => (
                                                    <div key={request._id} className="bg-gray-800/30 border border-gray-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                                            <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-white font-black text-lg">
                                                                {request.user.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-white font-black truncate">{request.user.username}</p>
                                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{request.user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <button
                                                                onClick={() => handleAcceptRequest(request._id)}
                                                                className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                                            >
                                                                Authorize
                                                            </button>
                                                            <button
                                                                onClick={() => serverService.rejectRequest(request._id).then(() => setRequests(requests.filter(r => r._id !== request._id)))}
                                                                className="flex-1 sm:flex-none px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-gray-700 transition-all active:scale-95"
                                                            >
                                                                Dismiss
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {server.role === 'Owner' && (
                                        <section className="pt-8 border-t border-gray-800">
                                            <h3 className="text-red-500 font-black uppercase text-xs tracking-widest mb-6">Danger Protocol</h3>
                                            <div className="bg-red-950/20 border border-red-900/30 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div className="text-center sm:text-left">
                                                    <p className="text-red-400 font-black text-sm">Terminate Server Infrastructure</p>
                                                    <p className="text-red-900 text-[10px] font-black uppercase tracking-widest mt-1">This operation is permanent and irreversible</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setModal({
                                                            isOpen: true,
                                                            title: 'TERMINATION PROTOCOL',
                                                            message: 'IRREVERSIBLE: Execute server infrastructure termination? All data will be permanently purged from the network.',
                                                            type: 'error',
                                                            isConfirm: true,
                                                            confirmText: 'Execute',
                                                            onConfirm: async () => {
                                                                await serverService.deleteServer(id);
                                                                navigate('/dashboard');
                                                            }
                                                        });
                                                    }}
                                                    className="w-full sm:w-auto px-8 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] active:scale-95"
                                                >
                                                    Terminate
                                                </button>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
        </div>
    );
};

export default ServerPage;
