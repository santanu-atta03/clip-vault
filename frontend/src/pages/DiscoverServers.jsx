import React, { useState, useEffect } from 'react';
import { Search, Users, ShieldCheck, Loader2 } from 'lucide-react';
import serverService from '../services/serverService';
import Modal from '../components/Modal';

const DiscoverServers = () => {
    const [servers, setServers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        fetchServers();
    }, [search]);

    const fetchServers = async () => {
        try {
            setLoading(true);
            const data = await serverService.getServers(search);
            setServers(data);
        } catch (err) {
            setError('Failed to load servers');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async (serverId) => {
        try {
            await serverService.requestJoin(serverId);
            // Update local state to show pending
            setServers(servers.map(s =>
                s._id === serverId ? { ...s, hasPendingRequest: true } : s
            ));
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Access Denied',
                message: err.response?.data?.message || 'The system could not process your join request. Please retry connection.',
                type: 'error'
            });
        }
    };

    return (
        <div className="flex-1 bg-gray-950 overflow-y-auto px-6 py-12 sm:px-12 sm:py-20 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Global Network</span>
                        <h1 className="text-5xl sm:text-6xl font-black text-white mb-6 tracking-tighter">Discover<br />Collectives</h1>
                        <p className="text-gray-500 font-medium text-lg max-w-xl leading-relaxed">
                            Access decentralized information clusters. Join verified collaborative environments to synchronize data across the network.
                        </p>
                    </div>

                    <div className="relative group max-w-md w-full animate-in fade-in slide-in-from-bottom-3 duration-1000">
                        <div className="absolute inset-0 bg-indigo-600/5 blur-3xl -z-10 group-focus-within:bg-indigo-600/10 transition-colors" />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="SEARCH FREQUENCY..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 rounded-[2rem] pl-16 pr-6 py-6 text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-800 font-black tracking-widest text-[11px] backdrop-blur-xl"
                        />
                    </div>
                </div>

                {loading && servers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8 animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full animate-pulse" />
                            <Loader2 className="animate-spin text-indigo-500 relative z-10" size={48} />
                        </div>
                        <p className="text-gray-700 font-black uppercase text-[10px] tracking-[0.4em]">Establishing Uplink...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {servers.map((server, index) => (
                            <div
                                key={server._id}
                                className="bg-gray-900/30 border border-gray-800 rounded-[2.5rem] p-8 hover:bg-gray-900 hover:border-indigo-500/40 transition-all duration-500 group flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-10 group-hover:bg-indigo-600/10 transition-colors" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-20 h-20 rounded-[2rem] bg-gray-950 flex items-center justify-center text-indigo-400 font-black text-3xl border border-gray-900 group-hover:border-indigo-500/30 transition-all shadow-2xl overflow-hidden relative">
                                        {server.icon ? (
                                            <img src={server.icon} alt={server.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <span className="relative z-10">{server.name.charAt(0).toUpperCase()}</span>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-950 rounded-2xl text-[10px] font-black text-gray-500 border border-gray-900 shadow-xl group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all">
                                            <Users size={14} />
                                            {server.memberCount}
                                        </div>
                                        <span className="text-[8px] font-black text-gray-800 uppercase tracking-tighter mr-2 mt-1">SDR ACTIVE</span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-indigo-400 transition-colors tracking-tighter lowercase">#{server.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3 mb-8 group-hover:text-gray-400 transition-colors">
                                        {server.description || 'No strategic objectives defined for this cluster.'}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    {server.isMember ? (
                                        <div className="w-full py-5 px-4 bg-gray-950 border border-indigo-500/20 text-indigo-400 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                                            <ShieldCheck size={16} />
                                            Access Granted
                                        </div>
                                    ) : server.hasPendingRequest ? (
                                        <button
                                            disabled
                                            className="w-full py-5 px-4 bg-gray-950 text-gray-700 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest cursor-not-allowed border border-gray-900"
                                        >
                                            Auth Pending
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinRequest(server._id)}
                                            className="w-full py-5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/20 active:scale-[0.98] group-hover:shadow-indigo-600/40"
                                        >
                                            Request Access
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && servers.length === 0 && (
                    <div className="text-center py-40 bg-gray-950/50 rounded-[3rem] border border-dashed border-gray-900 animate-in fade-in duration-700">
                        <p className="text-gray-700 font-black uppercase text-xs tracking-widest">No matching clusters detected in range.</p>
                    </div>
                )}
            </div>

            <Modal 
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default DiscoverServers;
