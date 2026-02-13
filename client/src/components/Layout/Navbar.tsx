import { Link } from 'react-router-dom';
import { Music, Home, Library, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-xl flex items-center justify-center">
              <Music size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Muse<span className="text-yellow-500 mx-2">N</span>Music
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <Home size={18} />
              Home
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/library"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Library size={18} />
                  Library
                </Link>
                <button className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2">
                  <Users size={18} />
                  Collaborate
                </button>
              </>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{user?.username}</p>
                    <p className="text-gray-400 text-xs">{user?.totalSongs || 0} songs</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-600 hover:from-yellow-400 hover:to-yellow-700 text-white font-medium rounded-lg transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}