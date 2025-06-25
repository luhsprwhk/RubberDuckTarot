import { useState, useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

import { Link } from 'react-router-dom';
import { User, Settings, LogOut, CircleFadingArrowUpIcon } from 'lucide-react';
import clsx from 'clsx';

import { useUserProfile } from '../hooks/useUserProfile';
const Navbar = () => {
  const { user, signOut, loading, showAuthModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { profile } = useUserProfile();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

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
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="hidden sm:inline">
                          {profile?.name || user.email}
                        </span>
                      </button>

                      <div
                        className={clsx(
                          'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50',
                          { hidden: !showUserMenu }
                        )}
                      >
                        <Link
                          to="/preferences"
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
                    </div>
                  ) : (
                    <button
                      onClick={() => showAuthModal('signIn')}
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
    </>
  );
};

export default Navbar;
