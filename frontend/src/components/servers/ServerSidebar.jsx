import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Compass, LayoutDashboard, LogOut, Users } from 'lucide-react';
import serverService from '../../services/serverService';

const ServerSidebar = ({ user, logout }) => {
    const [servers, setServers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyServers();
    }, []);

    const fetchMyServers = async () => {
        try {
            const allServers = await serverService.getServers();
            setServers(allServers.filter(s => s.isMember));
        } catch (error) {
            console.error('Error fetching servers:', error);
        }
    };

    return (
        <div className="w-24 md:w-72 bg-gray-950 h-screen flex flex-col border-r border-gray-900 transition-all duration-500">
            <div className="p-8 flex items-center justify-center md:justify-start gap-4 h-24 shrink-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                    <span className="text-white font-black text-xl">CV</span>
                </div>
                <span className="hidden md:block text-white font-black text-2xl tracking-tighter">ClipVault</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1.5 px-3 custom-scrollbar">
                <div className="mb-8">
                    <h3 className="hidden md:block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-6 px-4">Navigation</h3>
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'}`}
                    >
                        <LayoutDashboard size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="hidden md:block font-black uppercase text-[11px] tracking-widest">Workspace</span>
                    </NavLink>

                    <NavLink
                        to="/discover"
                        className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'}`}
                    >
                        <Compass size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="hidden md:block font-black uppercase text-[11px] tracking-widest">Discovery</span>
                    </NavLink>
                </div>

                <div className="mb-4">
                    <div className="hidden md:flex items-center justify-between text-[10px] font-black text-gray-700 uppercase tracking-widest mb-6 px-4">
                        <span>Servers</span>
                        <button
                            onClick={() => navigate('/create-server')}
                            className="p-1 hover:text-indigo-400 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {servers.map((server) => (
                            <NavLink
                                key={server._id}
                                title={server.name}
                                to={`/servers/${server._id}`}
                                className={({ isActive }) => `flex items-center gap-4 p-2 rounded-2xl transition-all group ${isActive ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-gray-900/50'}`}
                            >
                                <div className="relative shrink-0">
                                    {server.icon ? (
                                        <img src={server.icon} alt={server.name} className="w-12 h-12 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-indigo-400 font-black text-lg transition-all group-hover:border-indigo-500/30 shadow-lg">
                                            {server.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden md:block min-w-0 flex-1">
                                    <p className="text-xs font-black text-gray-400 group-hover:text-white truncate transition-colors">
                                        {server.name}
                                    </p>
                                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-tighter">Community</span>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-900/50">
                    <button
                        onClick={() => navigate('/create-server')}
                        className="flex items-center gap-4 p-3.5 rounded-2xl text-gray-600 hover:text-indigo-400 hover:bg-indigo-600/5 transition-all w-full group border border-transparent hover:border-indigo-500/10"
                    >
                        <div className="w-11 h-11 shrink-0 rounded-2xl border-2 border-dashed border-gray-800 flex items-center justify-center group-hover:border-indigo-500/30 transition-all">
                            <Plus size={18} />
                        </div>
                        <span className="hidden md:block font-black uppercase text-[10px] tracking-widest">New Collective</span>
                    </button>
                </div>
            </nav>

            <div className="p-6 border-t border-gray-900 h-24 shrink-0 flex items-center">
                <div className="flex items-center gap-4 overflow-hidden w-full">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-white font-black text-xs shadow-2xl">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block flex-1 min-w-0">
                        <p className="text-[11px] font-black text-white uppercase tracking-widest truncate">{user?.username}</p>
                        <button
                            onClick={logout}
                            className="text-[9px] text-gray-600 hover:text-red-400 flex items-center gap-1 font-black uppercase tracking-widest transition-colors mt-0.5"
                        >
                            De-authorize
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerSidebar;
