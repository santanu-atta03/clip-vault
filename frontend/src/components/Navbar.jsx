import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-slate-700/50 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-accent/20 rounded-xl">
                        <Shield className="w-6 h-6 text-accent" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        ClipVault
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-dark-lighter rounded-full border border-slate-700/50">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">{user?.username}</span>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
