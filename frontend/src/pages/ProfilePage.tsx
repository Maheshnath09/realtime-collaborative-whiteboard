import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiLogOut } from 'react-icons/fi';

const ProfilePage: React.FC = () => {
    const { username, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header - Responsive */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            <FiArrowLeft size={18} className="sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-medium hidden xs:inline">Back to Dashboard</span>
                            <span className="text-xs font-medium xs:hidden">Back</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-white text-xs sm:text-sm"
                            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' }}
                        >
                            W
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800 hidden sm:inline">Whiteboard</span>
                    </div>
                </div>
            </header>

            {/* Main Content - Responsive */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-8 py-6 sm:py-10">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg sm:text-2xl font-bold border-2 sm:border-4 border-white/30">
                                {getInitials(username || 'User')}
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white">{username || 'User'}</h1>
                                <p className="text-blue-100 text-xs sm:text-sm mt-1">Whiteboard Member</p>
                            </div>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="p-4 sm:p-8">
                        {/* Account Section */}
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Account</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Your account information</p>

                            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <FiUser size={18} className="sm:w-[22px] sm:h-[22px]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{username || 'User'}</p>
                                    <p className="text-xs text-gray-500">Signed in</p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-6 sm:my-8"></div>

                        {/* Logout Section */}
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Sign Out</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Sign out of your Whiteboard account</p>

                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 px-4 bg-red-50 text-red-600 rounded-lg sm:rounded-xl font-medium hover:bg-red-100 transition border border-red-200 text-sm sm:text-base"
                            >
                                <FiLogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
