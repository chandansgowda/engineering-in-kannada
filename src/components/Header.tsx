import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Trophy, FileText, Link2 } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher"; // Import LanguageSwitcher
import { useTranslation } from "react-i18next"; // Import useTranslation

export function Header() {
  const { t } = useTranslation(); // Initialize useTranslation
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logo.jpg"
              alt={t('engineeringInKannada')} // Translate alt text
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/32?text=EK';
              }}
            />
            <span className="text-white font-bold text-lg hidden sm:inline">
              {t('engineeringInKannada')} {/* Translate site name */}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4"> {/* Reduced gap for switcher */}
            <Link
              to="/"
              className={`flex items-center gap-2 text-sm ${
                location.pathname === "/" || location.pathname === "/courses"
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
            >
              <Home className="h-4 w-4" />
              {t('courses')}
            </Link>
            <Link
              to="/leaderboard"
              className={`flex items-center gap-2 text-sm ${
                location.pathname === "/leaderboard"
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
            >
              <Trophy className="h-4 w-4" />
              {t('leaderboard')}
            </Link>
            <Link
              to="/blogs"
              className={`flex items-center gap-2 text-sm ${
                location.pathname.includes("/blogs")
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
            >
              <FileText className="h-4 w-4" />
              {t('blogs')}
            </Link>
            <Link
              to="/links"
              className={`flex items-center gap-2 text-sm ${
                location.pathname === "/links"
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
            >
              <Link2 className="h-4 w-4" />
              {t('links')}
            </Link>
            <LanguageSwitcher /> {/* Added LanguageSwitcher here for desktop */}
          </nav>

          {/* Mobile Menu Button and Switcher */}
          <div className="md:hidden flex items-center">
            <LanguageSwitcher /> {/* LanguageSwitcher for mobile */}
            <button
              className="text-white ml-2" // Added margin for spacing
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 flex flex-col gap-2 md:hidden">
            <Link
              to="/"
              className={`flex items-center gap-2 p-2 text-sm ${
                location.pathname === "/" || location.pathname === "/courses"
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              {t('courses')}
            </Link>
            <Link
              to="/leaderboard"
              className={`flex items-center gap-2 p-2 text-sm ${
                location.pathname === "/leaderboard"
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Trophy className="h-4 w-4" />
              {t('leaderboard')}
            </Link>
            <Link
              to="/blogs"
              className={`flex items-center gap-2 p-2 text-sm ${
                location.pathname.includes("/blogs")
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              {t('blogs')}
            </Link>
            <Link
              to="/links"
              className={`flex items-center gap-2 p-2 text-sm ${
                location.pathname === "/links"
                  ? "text-primary"
                  : "text-gray-300 hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Link2 className="h-4 w-4" />
              {t('links')}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
