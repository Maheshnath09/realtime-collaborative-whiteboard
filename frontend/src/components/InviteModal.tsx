import React, { useState } from 'react';
import { FiX, FiMail, FiCopy, FiCheck, FiUserPlus } from 'react-icons/fi';
import { apiUrl } from '../config/api';

interface InviteModalProps {
    boardId: string;
    isOpen: boolean;
    onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ boardId, isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    if (!isOpen) return null;

    const boardUrl = `${window.location.origin}/board/${boardId}`;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(apiUrl(`boards/${boardId}/invite`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email, role }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Invitation sent successfully!' });
                setEmail('');
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.detail || 'Failed to send invitation' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to send invitation' });
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(boardUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FiUserPlus className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Invite to Board</h2>
                            <p className="text-sm text-gray-500">Share this board with your team</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon btn-ghost"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Invite by Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invite by email
                        </label>
                        <form onSubmit={handleInvite} className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="input pl-10"
                                        required
                                    />
                                </div>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="input"
                                    style={{ width: '140px' }}
                                >
                                    <option value="editor">Can edit</option>
                                    <option value="viewer">Can view</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </form>

                        {/* Message */}
                        {message && (
                            <div
                                className={`mt-3 p-3 rounded-lg text-sm ${message.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or share link</span>
                        </div>
                    </div>

                    {/* Copy Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Share link
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={boardUrl}
                                readOnly
                                className="input flex-1 bg-gray-50"
                            />
                            <button
                                onClick={copyLink}
                                className="btn-secondary px-4"
                            >
                                {copied ? (
                                    <>
                                        <FiCheck size={16} className="text-green-600" />
                                        <span className="text-green-600">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCopy size={16} />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Anyone with this link can view this board
                        </p>
                    </div>

                    {/* Access Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Access Levels</h3>
                        <ul className="space-y-1 text-xs text-blue-800">
                            <li><strong>Can edit:</strong> Add, edit, and delete content</li>
                            <li><strong>Can view:</strong> View content only, no editing</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
