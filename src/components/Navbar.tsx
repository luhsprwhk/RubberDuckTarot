import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, CircleFadingArrowUpIcon } from 'lucide-react';

const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 hover:text-blue-600"
            >
              🦆 Rubber Duck Tarot
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Home
              </Link>
              {!user && (
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  About
                </Link>
              )}
              {user && (
                <Link
                  to="/insights"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Insights
                </Link>
              )}

              {!loading && (
                <>
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="hidden sm:inline">{user.email}</span>
                      </button>

                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                          <Link
                            to="/onboarding"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Preferences
                          </Link>
                          <Link
                            to="/upgrade"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <CircleFadingArrowUpIcon className="w-4 h-4 mr-2" />
                            Upgrade
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navbar;
