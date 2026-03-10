import React from 'react';
import { useAuth } from '../context/AuthContext';
import ServerSidebar from './servers/ServerSidebar';
import MobileDock from './MobileDock';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden relative">
            <div className="hidden md:flex shrink-0">
                <ServerSidebar user={user} logout={logout} />
            </div>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-24 md:pb-0">
                {children}
            </div>
            <MobileDock />
        </div>
    );
};

export default MainLayout;
