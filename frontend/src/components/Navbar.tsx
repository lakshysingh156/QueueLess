import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  dark?: boolean;
}

export default function Navbar({ dark = false }: NavbarProps) {
  const loc = useLocation();
  const isActive = (path: string) => loc.pathname === path;

  if (dark) {
    return (
      <header className="nav-dark sticky top-0 z-50">
        <div className="page-container h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none select-none">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="10" stroke="#60a5fa" strokeWidth="1.5" opacity="0.7" />
                <circle cx="11" cy="11" r="4" fill="#60a5fa" opacity="0.9" />
                <line x1="11" y1="1" x2="11" y2="5" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5" />
                <line x1="11" y1="17" x2="11" y2="21" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5" />
                <line x1="1" y1="11" x2="5" y2="11" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5" />
                <line x1="17" y1="11" x2="21" y2="11" stroke="#60a5fa" strokeWidth="1.5" opacity="0.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">QueueLess</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
            <Link
              to="/overview"
              className={`hover:text-white transition-colors ${isActive('/overview') ? 'text-white font-semibold' : ''}`}
            >
              Overview
            </Link>
            <Link
              to="/search"
              className={`hover:text-white transition-colors ${isActive('/search') ? 'text-white font-semibold' : ''}`}
            >
              Hospitals
            </Link>
            <Link
              to="/emergency"
              className={`flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors font-medium ${isActive('/emergency') ? 'text-rose-300' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Emergency
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors hidden sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              to="/search"
              className={`btn btn-primary btn-sm ${isActive('/search') ? 'nav-find-care-active' : ''}`}
            >
              Find Care
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Fernand-inspired clean light navbar for data pages
  return (
    <header className="nav-light sticky top-0 z-50">
      <div className="page-container h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-decoration-none select-none">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="10" stroke="#2563eb" strokeWidth="1.5" opacity="0.6" />
              <circle cx="11" cy="11" r="4" fill="#2563eb" opacity="0.9" />
              <line x1="11" y1="1" x2="11" y2="5" stroke="#2563eb" strokeWidth="1.5" opacity="0.5" />
              <line x1="11" y1="17" x2="11" y2="21" stroke="#2563eb" strokeWidth="1.5" opacity="0.5" />
              <line x1="1" y1="11" x2="5" y2="11" stroke="#2563eb" strokeWidth="1.5" opacity="0.5" />
              <line x1="17" y1="11" x2="21" y2="11" stroke="#2563eb" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-900">QueueLess</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            to="/overview"
            className={`hover:text-slate-900 transition-colors ${isActive('/overview') ? 'text-blue-600 font-semibold' : ''}`}
          >
            Overview
          </Link>
          <Link
            to="/search"
            className={`hover:text-slate-900 transition-colors ${isActive('/search') ? 'text-blue-600 font-semibold' : ''}`}
          >
            Hospitals
          </Link>
          <Link
            to="/emergency"
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Emergency
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors hidden sm:inline-block"
          >
            Sign in
          </Link>
          <Link to="/search" className="btn btn-primary">
            Find Care
          </Link>
        </div>
      </div>
    </header>
  );
}
