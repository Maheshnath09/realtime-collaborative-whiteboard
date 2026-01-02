import React, { useState } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiMessageCircle,
  FiUser,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2
} from 'react-icons/fi';
import Canvas from './components/Canvas/Canvas';
import Toolbar from './components/Toolbar/Toolbar';
import Chat from './components/Chat/Chat';
import PeopleBar from './components/PeopleBar';
import InviteModal from './components/InviteModal';
import ProfileDropdown from './components/ProfileDropdown';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import { apiUrl } from './config/api';
// Settings page removed per user request
import { useAuthStore } from './store/authStore';

const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { username, clearAuth } = useAuthStore();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [boardName, setBoardName] = useState('Untitled Board');
  const navigate = useNavigate();

  if (!id) return null;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 20, 400));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 20, 25));
  };

  const handleFitToScreen = () => {
    setZoom(100);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Top Navigation Bar - Responsive */}
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3 z-20 shadow-sm">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-white text-xs sm:text-sm"
              style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' }}
            >
              W
            </div>
          </Link>

          <div className="hidden sm:block h-6 w-px bg-gray-200" />
          {/* Board Name - Hidden on mobile, shown on tablet+ */}
          <input
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="hidden sm:block text-sm font-semibold text-gray-900 bg-white border border-gray-200 focus:outline-none focus:border-primary-blue focus:bg-white px-3 py-2 rounded transition-colors w-40 md:w-64 lg:w-72"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Active Users - Hidden on very small screens */}
          <div className="hidden xs:block">
            <PeopleBar />
          </div>

          {/* Share Button */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition shadow-md hover:shadow-lg"
          >
            Share
          </button>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden relative pb-16 sm:pb-0">
        {/* Left Toolbar - Hidden on mobile (uses bottom bar instead) */}
        <div className="hidden sm:flex flex-col bg-white border-r border-gray-200 shadow-sm z-10">
          <Toolbar />
        </div>

        {/* Canvas Area */}
        <section className="flex-1 relative overflow-hidden">
          <Canvas boardId={id} zoom={zoom} />
        </section>

        {/* Right Sidebar - Chat (Desktop) / Full screen overlay (Mobile) */}
        {chatOpen && (
          <aside className="fixed inset-0 sm:relative sm:inset-auto w-full sm:w-72 md:w-80 border-l border-gray-200 bg-white shadow-lg sm:shadow-sm flex flex-col z-40 sm:z-10">
            <div className="flex-1 overflow-hidden">
              <Chat boardId={id} onClose={() => setChatOpen(false)} />
            </div>
          </aside>
        )}

        {/* Chat toggle button - Positioned higher on mobile to avoid bottom bar */}
        <div className="absolute right-4 bottom-20 sm:bottom-24 z-30">
          <button
            onClick={() => setChatOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition"
            title={chatOpen ? 'Close chat' : 'Open chat'}
          >
            <FiMessageCircle size={18} />
            <span className="text-sm text-gray-700 hidden sm:inline">{chatOpen ? 'Hide' : 'Chat'}</span>
          </button>
        </div>

        {/* Zoom Controls - Positioned to avoid mobile bottom bar */}
        <div className="absolute bottom-20 sm:bottom-6 left-2 sm:left-6 flex gap-1 sm:gap-2 z-20 bg-white p-1.5 sm:p-2 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={handleZoomOut}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900 transition"
            title="Zoom Out"
          >
            <FiZoomOut size={14} className="sm:hidden" />
            <FiZoomOut size={16} className="hidden sm:block" />
          </button>
          <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-gray-700 min-w-[40px] sm:min-w-[50px] text-center">
            {Math.round(zoom)}%
          </div>
          <button
            onClick={handleZoomIn}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900 transition"
            title="Zoom In"
          >
            <FiZoomIn size={14} className="sm:hidden" />
            <FiZoomIn size={16} className="hidden sm:block" />
          </button>
          <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1" />
          <button
            onClick={handleFitToScreen}
            className="hidden sm:block p-2 hover:bg-gray-100 rounded text-gray-700 hover:text-gray-900 transition"
            title="Fit to Screen"
          >
            <FiMaximize2 size={16} />
          </button>
        </div>
      </main>

      {/* Mobile Bottom Toolbar */}
      <div className="sm:hidden">
        <Toolbar />
      </div>

      {/* Invite Modal */}
      <InviteModal
        boardId={id}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { username, clearAuth } = useAuthStore();
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBoards = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(apiUrl('boards/'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setBoards(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch boards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const createBoard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('boards/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Untitled Board',
          is_public: true,
        }),
      });

      if (res.ok) {
        const board = await res.json();
        navigate(`/board/${board.id}`);
      }
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header - Responsive */}
      <header className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8 py-4 sm:py-5 shadow-sm gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded flex items-center justify-center font-bold text-white text-base sm:text-lg"
            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' }}
          >
            W
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-800">Whiteboard</span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
          {username && (
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
              Welcome, <span className="text-gray-800 font-semibold">{username}</span>
            </span>
          )}
          <button
            onClick={createBoard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-semibold rounded-lg transition shadow-md hover:shadow-lg"
          >
            + New Board
          </button>
          {/* Profile Dropdown */}
          <ProfileDropdown />
        </nav>
      </header>

      {/* Main Content - Responsive padding */}
      <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        {boards.length === 0 && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-4">
            <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              Create & Collaborate
            </h1>
            <p className="mb-8 sm:mb-10 text-base sm:text-lg text-gray-600">
              Build beautiful whiteboards with your team in real-time. Draw, brainstorm, design, and share ideas effortlessly.
            </p>
            <button
              onClick={createBoard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Your First Board
            </button>
          </div>
        )}

        {/* Boards Grid - Responsive */}
        {boards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Your Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg cursor-pointer transition transform hover:scale-105 group"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-50 group-hover:to-gray-200 transition">
                    <span className="text-gray-500 group-hover:text-blue-400">Whiteboard</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{board.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(board.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/:id"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Settings page removed */}
    </Routes>
  );
};

export default App;
