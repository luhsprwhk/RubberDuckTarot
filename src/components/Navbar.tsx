import { useState, useRef, useEffect } from 'react';
import useAuth from '../lib/hooks/useAuth';

import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, CircleFadingArrowUpIcon } from 'lucide-react';
import clsx from 'clsx';

import { useUserProfile } from '../lib/hooks/useUserProfile';
import robEmoji from '../assets/rob-emoji.png';
import { isAuthEnabled } from '../lib/featureFlags';

const Navbar = () => {
  const { user, signOut, showAuthModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useUserProfile();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const authEnabled = isAuthEnabled();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    if (showUserMenu || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-void-950 border-b border-liminal-border backdrop-blur-liminal border border-default">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="text-xl font-bold text-primary hover:text-accent transition-colors duration-200 flex items-center gap-2"
              onClick={handleNavLinkClick}
            >
              <img
                src={robEmoji}
                alt="Rob"
                className="w-6 h-6 text-breakthrough-400 animate-flicker"
              />
              Rubber Duck Tarot
            </Link>
            {/* Hamburger for mobile */}
            <button
              className="md:hidden flex items-center px-3 py-2 text-secondary hover:text-accent focus:outline-none"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-secondary hover:text-accent transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/cards"
                className="text-secondary hover:text-accent transition-colors duration-200"
              >
                Cards
              </Link>
              {!user && (
                <Link
                  to="/features"
                  className="text-secondary hover:text-accent transition-colors duration-200"
                >
                  Features
                </Link>
              )}

              {user && (
                <Link
                  to="/blocks"
                  className="text-secondary hover:text-accent transition-colors duration-200"
                >
                  Blocks
                </Link>
              )}
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
                      className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-muted hover:bg-liminal-hover hover:text-secondary transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
              {!user && authEnabled && (
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
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden="true"
          ></div>
        )}
        {/* Mobile menu */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 left-0 w-full z-50 bg-void-950 border-b border-liminal-border shadow-2xl transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} backdrop-blur-liminal`}
          style={{ minHeight: '60px' }}
        >
          <div className="container mx-auto px-4 pt-2 pb-4">
            <div className="flex justify-between items-center h-14">
              <Link
                to="/"
                className="text-xl font-bold text-primary hover:text-accent transition-colors duration-200 flex items-center gap-2"
                onClick={handleNavLinkClick}
              >
                <img
                  src={robEmoji}
                  alt="Rob"
                  className="w-6 h-6 text-breakthrough-400 animate-flicker"
                />
                Rubber Duck Tarot
              </Link>
              <button
                className="flex items-center px-3 py-2 text-secondary hover:text-accent focus:outline-none"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-col space-y-2 mt-2">
              <Link
                to="/"
                className="text-secondary hover:text-accent px-2 py-2 rounded transition-colors duration-200"
                onClick={handleNavLinkClick}
              >
                Home
              </Link>
              <Link
                to="/cards"
                className="text-secondary hover:text-accent px-2 py-2 rounded transition-colors duration-200"
                onClick={handleNavLinkClick}
              >
                Cards
              </Link>
              {!user && (
                <Link
                  to="/features"
                  className="text-secondary hover:text-accent px-2 py-2 rounded transition-colors duration-200"
                  onClick={handleNavLinkClick}
                >
                  Features
                </Link>
              )}
              {user && (
                <Link
                  to="/blocks"
                  className="text-secondary hover:text-accent px-2 py-2 rounded transition-colors duration-200"
                  onClick={handleNavLinkClick}
                >
                  Blocks
                </Link>
              )}
              {!user && (
                <Link
                  to="/pricing"
                  className="text-secondary hover:text-accent px-2 py-2 rounded transition-colors duration-200"
                  onClick={handleNavLinkClick}
                >
                  Pricing
                </Link>
              )}
              {user && (
                <Link
                  to="/insights"
                  className="text-secondary hover:text-accent px-2 py-2 rounded transition-colors duration-200"
                  onClick={handleNavLinkClick}
                >
                  Insights
                </Link>
              )}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((s) => !s)}
                    className="flex items-center space-x-2 text-secondary hover:text-accent px-2 py-2 rounded transition-colors duration-200 group w-full"
                  >
                    <User className="w-5 h-5 group-hover:text-breakthrough-300" />
                    <span>{profile?.name || user.email}</span>
                  </button>
                  <div
                    className={clsx(
                      'absolute left-0 mt-2 w-48 bg-surface border border-liminal-border rounded-md shadow-void py-1 z-50 backdrop-blur-liminal',
                      { hidden: !showUserMenu }
                    )}
                  >
                    <Link
                      to="/preferences"
                      className="flex items-center px-4 py-2 text-sm text-secondary hover:bg-liminal-hover hover:text-accent transition-colors duration-200"
                      onClick={handleNavLinkClick}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Preferences
                    </Link>
                    <Link
                      to="/upgrade"
                      className="flex items-center px-4 py-2 text-sm text-secondary hover:bg-liminal-hover hover:text-breakthrough-400 transition-colors duration-200"
                      onClick={handleNavLinkClick}
                    >
                      <CircleFadingArrowUpIcon className="w-4 h-4 mr-2" />
                      Upgrade
                    </Link>
                    <div className="border-t border-liminal-border my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-muted hover:bg-liminal-hover hover:text-secondary transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
              {!user && authEnabled && (
                <button
                  onClick={() => {
                    showAuthModal('signIn');
                    setMobileMenuOpen(false);
                  }}
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
