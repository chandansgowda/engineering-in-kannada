import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Home, BookOpen, Github, Menu, X, Youtube, Instagram, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './auth/AuthModal';

export function Header() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-dark/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-white">Engineering in Kannada</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 text-sm ${
                location.pathname === '/' ? 'text-primary' : 'text-gray-300 hover:text-primary'
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              to="/courses"
              className={`flex items-center gap-2 text-sm ${
                location.pathname.includes('/course') ? 'text-primary' : 'text-gray-300 hover:text-primary'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Courses
            </Link>
            <a
              href="https://www.youtube.com/@EngineeringinKannada"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary"
            >
              <Youtube className="h-4 w-4" />
              YouTube
            </a>
            <a
              href="https://www.instagram.com/engineering_in_kannada/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
            <a
              href="https://github.com/chandansgowda/engineering-in-kannada"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary"
            >
              <Github className="h-4 w-4" />
              Contribute
            </a>

            {/* Auth buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary"
                >
                  <User className="h-4 w-4" />
                  {user.user_metadata?.full_name || 'Profile'}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-primary"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-primary"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-primary"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="flex flex-col gap-4 px-2 pb-4">
              <Link
                to="/"
                className={`flex items-center gap-2 p-2 text-sm ${
                  location.pathname === '/' ? 'text-primary' : 'text-gray-300 hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/courses"
                className={`flex items-center gap-2 p-2 text-sm ${
                  location.pathname.includes('/course') ? 'text-primary' : 'text-gray-300 hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </Link>
              <a
                href="https://www.youtube.com/@EngineeringinKannada"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Youtube className="h-4 w-4" />
                YouTube
              </a>
              <a
                href="https://www.instagram.com/engineering_in_kannada/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              <a
                href="https://github.com/chandansgowda/engineering-in-kannada"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Github className="h-4 w-4" />
                Contribute
              </a>

              {/* Mobile Auth buttons */}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:text-primary"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 text-sm text-gray-300 hover:text-primary"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
        </nav>
      </header>

      {/* Auth Modal - Render outside the header for better z-index handling */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="login"
      />
    </>
  );
}