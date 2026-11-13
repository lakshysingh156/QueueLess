import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Building2,
  ChevronDown,
  Command,
  HeartPulse,
  LayoutDashboard,
  Search,
  ShieldAlert,
} from 'lucide-react';

const navigation = [
  {
    label: 'WORKSPACE',
    items: [{ label: 'Overview', path: '/overview', icon: LayoutDashboard }],
  },
  {
    label: 'FIND CARE',
    items: [
      { label: 'Search care', path: '/search', icon: Search },
      { label: 'Hospital directory', path: '/hospitals', icon: Building2 },
    ],
  },
];

export default function Navbar({ dark = false }: { dark?: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dark) return;
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [dark]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symptom = query.trim();
    if (!symptom) {
      searchRef.current?.focus();
      return;
    }
    navigate(`/results?symptom=${encodeURIComponent(symptom)}`);
    setQuery('');
  }

  if (dark) {
    return (
      <header className="public-nav">
        <div className="public-nav-inner">
          <Link to="/" className="brand-lockup" aria-label="QueueLess home">
            <span className="brand-mark"><HeartPulse aria-hidden="true" /></span>
            <span>QueueLess<span className="brand-period">.</span></span>
          </Link>
          <nav aria-label="Main navigation" className="public-links">
            <Link to="/overview">Overview</Link>
            <Link to="/hospitals">Hospitals</Link>
            <Link to="/emergency" className="public-emergency"><span /> Emergency</Link>
          </nav>
          <div className="public-actions">
            <Link to="/login" className="public-signin">Sign in</Link>
            <Link to="/search" className="public-cta">Find care <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="workspace-chrome">
      <aside className="workspace-sidebar">
        <div className="sidebar-brand-row">
          <Link to="/" className="brand-lockup" aria-label="QueueLess home">
            <span className="brand-mark"><HeartPulse aria-hidden="true" /></span>
            <span>QueueLess<span className="brand-period">.</span></span>
          </Link>
          <span className="sidebar-collapse" aria-hidden="true"><Command /></span>
        </div>

        <div className="workspace-switcher">
          <span className="workspace-avatar">Q</span>
          <span className="workspace-switcher-copy">
            <strong>QueueLess demo</strong>
            <small>Care workspace</small>
          </span>
          <ChevronDown aria-hidden="true" />
        </div>

        <nav className="sidebar-navigation" aria-label="Workspace navigation">
          {navigation.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <span className="sidebar-group-label">{group.label}</span>
              {group.items.map(({ label, path, icon: Icon }) => {
                const active = pathname === path ||
                  (path === '/search' && (pathname === '/results' || pathname.startsWith('/hospital/')));
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`sidebar-link${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                    {active && <span className="sidebar-active-mark" />}
                  </Link>
                );
              })}
            </div>
          ))}
          <div className="sidebar-group">
            <span className="sidebar-group-label">SAFETY</span>
            <Link
              to="/emergency"
              className={`sidebar-link sidebar-link-emergency${pathname === '/emergency' ? ' is-active' : ''}`}
              aria-current={pathname === '/emergency' ? 'page' : undefined}
            >
              <ShieldAlert aria-hidden="true" />
              <span>Emergency guide</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-data-note">
            <span className="data-note-icon"><Activity aria-hidden="true" /></span>
            <div><strong>Demo environment</strong><small>Illustrative, unverified data</small></div>
          </div>
          <Link to="/" className="sidebar-home-link">Back to public site <ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/login" className="sidebar-profile">
            <span className="profile-avatar">QL</span>
            <span><strong>Guest workspace</strong><small>Preview access</small></span>
            <ChevronDown aria-hidden="true" />
          </Link>
        </div>
      </aside>

      <header className="workspace-topbar">
        <div className="topbar-context">
          <span className="topbar-context-mark"><LayoutDashboard aria-hidden="true" /></span>
          <span>QueueLess <span>/</span> {pathname === '/overview' ? 'Overview' : pathname === '/hospitals' ? 'Directory' : pathname === '/emergency' ? 'Emergency guide' : pathname.startsWith('/hospital/') ? 'Hospital details' : pathname === '/results' ? 'Search results' : 'Find care'}</span>
        </div>
        <form className="topbar-search" role="search" onSubmit={submitSearch}>
          <Search aria-hidden="true" />
          <input
            ref={searchRef}
            aria-label="Search symptoms or departments"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search symptoms or departments"
          />
          <button type="button" className="topbar-shortcut" onClick={() => searchRef.current?.focus()} aria-label="Focus search">
            <kbd>Ctrl K</kbd>
          </button>
        </form>
        <div className="topbar-status"><span /> Demo data</div>
      </header>
    </div>
  );
}
