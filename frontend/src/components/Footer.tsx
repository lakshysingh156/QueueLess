import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16 py-12">
      <div className="page-container flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="10" stroke="#2563eb" strokeWidth="1.5" opacity="0.6" />
                <circle cx="11" cy="11" r="4" fill="#2563eb" opacity="0.9" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-900 tracking-tight">QueueLess</span>
            <span className="text-xs text-slate-400">Healthcare Navigation</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
            <Link to="/" className="hover:text-slate-900 transition-colors">Overview</Link>
            <Link to="/search" className="hover:text-slate-900 transition-colors">Hospitals</Link>
            <Link to="/emergency" className="text-rose-600 hover:text-rose-700 transition-colors">Emergency (108 / 112)</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Sign in</Link>
          </div>
        </div>

        <div className="text-xs text-slate-400 max-w-sm md:text-right leading-relaxed">
          Healthcare routing and simulated queue estimations. In a medical emergency, call 108 or 112 immediately.
        </div>
      </div>
    </footer>
  );
}
