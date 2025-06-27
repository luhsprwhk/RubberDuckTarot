import { useState, useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

import { Link } from 'react-router-dom';
import { User, Settings, LogOut, CircleFadingArrowUpIcon } from 'lucide-react';
import clsx from 'clsx';

import { useUserProfile } from '../hooks/useUserProfile';

const Navbar = () => {
  const { user, signOut, showAuthModal } = useAuth();
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
      <nav className="bg-void-950 border-b border-liminal-border backdrop-blur-liminal">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:text-accent transition-colors duration-200 flex items-center gap-2"
            >
              <span className="text-breakthrough-400 animate-flicker">🦆</span>
              Rubber Duck Tarot
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-secondary hover:text-accent transition-colors duration-200"
              >
                Home
              </Link>
              {!user && (
                <Link
                  to="/pricing"
                  className="text-secondary hover:text-accent transition-colors duration-200"
                >
                  Pricing
                </Link>
              )}
              {user && (
                <Link
                  to="/insights"
                  className="text-secondary hover:text-accent transition-colors duration-200"
                >
                  Insights
                </Link>
              )}

              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-secondary hover:text-accent transition-colors duration-200 group"
                  >
                    <User className="w-5 h-5 group-hover:text-breakthrough-300" />
                    <span className="hidden sm:inline">
                      {profile?.name || user.email}
                    </span>
                  </button>

                  <div
                    className={clsx(
                      'absolute right-0 mt-2 w-48 bg-surface border border-liminal-border rounded-md shadow-void py-1 z-50 backdrop-blur-liminal',
                      { hidden: !showUserMenu }
                    )}
                  >
                    <Link
                      to="/preferences"
                      className="flex items-center px-4 py-2 text-sm text-secondary hover:bg-liminal-hover hover:text-accent transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Preferences
                    </Link>
                    <Link
                      to="/upgrade"
                      className="flex items-center px-4 py-2 text-sm text-secondary hover:bg-liminal-hover hover:text-breakthrough-400 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <CircleFadingArrowUpIcon className="w-4 h-4 mr-2" />
                      Upgrade
                    </Link>
                    <div className="border-t border-liminal-border my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-muted hover:bg-liminal-hover hover:text-secondary transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
              {!user && (
                <button
                  onClick={() => showAuthModal('signIn')}
                  className="bg-breakthrough-500 text-void-900 px-4 py-2 rounded-md hover:bg-breakthrough-400 transition-all duration-200 font-medium shadow-glow"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
