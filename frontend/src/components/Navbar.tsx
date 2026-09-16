import { Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 border-b ${isHome ? 'bg-white border-slate-200' : 'bg-white border-slate-200'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900 tracking-tight">QueueLess</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <Link to="/emergency" className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-medium transition-colors">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Emergency
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/search"
            className="text-sm bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Find Care
          </Link>
        </div>
      </div>
    </header>
  );
}
