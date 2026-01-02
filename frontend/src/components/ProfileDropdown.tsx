import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const ProfileDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { username, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const getInitials = () => {
        if (!username) return 'U';
        return username.substring(0, 2).toUpperCase();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="avatar avatar-md hover:ring-2 hover:ring-blue-500 transition-all"
                style={{ backgroundColor: '#4262FF' }}
            >
                {getInitials()}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="dropdown absolute right-0 top-full mt-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-900">{username || 'User'}</p>
                        </div>

                        <Link
                            to="/profile"
                            className="dropdown-item"
                            onClick={() => setIsOpen(false)}
                        >
                            <FiUser size={16} />
                            <span>Profile</span>
                        </Link>

                        <div className="dropdown-divider" />

                        <button
                            onClick={handleLogout}
                            className="dropdown-item text-red-600 hover:bg-red-50 w-full"
                        >
                            <FiLogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfileDropdown;
