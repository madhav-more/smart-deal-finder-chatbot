import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import useAuthStore from '../store/authStore';

function Chat() {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Smart Deal Finder
                        </h1>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <User size={20} />
                                <span className="font-medium">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
                <div className="bg-white rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
                    <ChatInterface />
                </div>
            </main>
        </div>
    );
}

export default Chat;
