import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Plus, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import serverService from '../services/serverService';

const MobileDock = () => {
    const [servers, setServers] = useState([]);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const all = await serverService.getServers();
                setServers(all.filter(s => s.isMember).slice(0, 3));
            } catch (e) { }
        };
        fetchServers();
    }, []);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] md:hidden w-auto max-w-[95%]">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative bg-gray-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex items-center gap-2 overflow-hidden"
            >
                {/* Visual Polish */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `relative rounded-2xl p-3.5 transition-all duration-300 group ${isActive ? 'bg-white/10 text-white shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <LayoutDashboard size={24} />
                    </motion.div>
                </NavLink>

                <NavLink
                    to="/discover"
                    className={({ isActive }) => `relative rounded-2xl p-3.5 transition-all duration-300 group ${isActive ? 'bg-white/10 text-white shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <Compass size={24} />
                    </motion.div>
                </NavLink>

                <NavLink
                    to="/archives"
                    className={({ isActive }) => `relative rounded-2xl p-3.5 transition-all duration-300 group ${isActive ? 'bg-white/10 text-white shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <Archive size={24} />
                    </motion.div>
                </NavLink>

                <NavLink
                    to="/create-server"
                    className={({ isActive }) => `relative rounded-2xl p-3.5 transition-all duration-300 group ${isActive ? 'bg-white/10 text-white shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                        <Plus size={24} />
                    </motion.div>
                </NavLink>

                {servers.length > 0 && (
                    <>
                        <div className="w-[1px] h-8 bg-white/5 mx-1.5 self-center" />
                        <div className="flex items-center gap-2 px-1">
                            {servers.map((server) => (
                                <NavLink
                                    key={server._id}
                                    to={`/servers/${server._id}`}
                                    className={({ isActive }) => `relative transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.3, y: -10 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative"
                                    >
                                        {server.icon ? (
                                            <img src={server.icon} className="w-11 h-11 rounded-2xl object-cover shadow-2xl border border-white/5" alt={server.name} />
                                        ) : (
                                            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-2xl border border-indigo-400/30">
                                                {server.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full opacity-50 group-[.active]:opacity-100" />
                                    </motion.div>
                                </NavLink>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default MobileDock;
