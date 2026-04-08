import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Trophy, FileText, Link2, BookOpen } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Courses', icon: Home, match: (p: string) => p === '/' || p === '/courses' },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, match: (p: string) => p === '/leaderboard' },
  { to: '/blogs', label: 'Blogs', icon: FileText, match: (p: string) => p.startsWith('/blogs') },
  { to: '/links', label: 'Links', icon: Link2, match: (p: string) => p === '/links' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center px-4">
      {/* Pill navbar */}
      <nav
        className={`pill-glass w-full max-w-[90vw] transition-all duration-300 ${scrolled ? 'pill-glass-scrolled' : ''}`}
      >
        <div className="flex items-center justify-between px-5 py-3 h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/images/logo.jpg"
              alt="Engineering in Kannada"
              className="w-8 h-8 object-contain self-center"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=EK'; }}
            />
            <span className="text-white font-semibold text-sm hidden sm:block whitespace-nowrap self-center">
              Engineering in Kannada
            </span>
          </Link>

          {/* Desktop nav — center */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, match }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                  match(location.pathname)
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-300 hover:text-primary hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.youtube.com/@EngineeringinKannada"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-dark text-sm font-semibold hover:bg-primary-dark transition-colors duration-200"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Watch Free
            </a>
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer — slides down below pill */}
      {menuOpen && (
        <div className="mt-2 w-full max-w-[90vw] animate-slide-down overflow-hidden rounded-none bg-[rgba(15,15,26,0.95)] border border-white/10 backdrop-blur-[16px]">
          <div className="flex flex-col gap-1 p-3">
            {NAV_LINKS.map(({ to, label, icon: Icon, match }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-colors ${
                  match(location.pathname)
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-300 hover:text-primary hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <a
              href="https://www.youtube.com/@EngineeringinKannada"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-dark text-sm font-semibold mt-1"
            >
              <BookOpen className="h-4 w-4" />
              Watch Free on YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
