import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Building2,
  CalendarCheck,
  ChevronDown,
  Command,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../useAuth';

const navigation = [
  {
    label: 'WORKSPACE',
    items: [
      { label: 'Overview', path: '/overview', icon: LayoutDashboard },
      { label: 'My appointments', path: '/dashboard', icon: CalendarCheck },
    ],
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
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [signOutError, setSignOutError] = useState('');
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

  async function handleSignOut() {
    setSignOutError('');
    try {
      await signOut();
    } catch {
      setSignOutError('Signed out on this device, but server sign-out could not be confirmed.');
    }
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
            <Link to="/dashboard">Appointments</Link>
            <Link to="/emergency" className="public-emergency"><span /> Emergency</Link>
          </nav>
          <div className="public-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="public-user-name" title={user.email}>{user.name}</Link>
                <button type="button" className="public-signout" onClick={() => void handleSignOut()}>Sign out</button>
              </>
            ) : (
              <Link to="/login" className="public-signin">Sign in</Link>
            )}
            <Link to="/search" className="public-cta">Find care <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          {signOutError && <span className="auth-signout-error" role="status">{signOutError}</span>}
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
            <strong>QueueLess Care</strong>
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
            <div><strong>Hospital Network</strong><small>Live monitoring</small></div>
          </div>
          <Link to="/" className="sidebar-home-link">Back to public site <ArrowUpRight aria-hidden="true" /></Link>
          {user ? (
            <div className="sidebar-profile is-authenticated">
              <span className="profile-avatar">{user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
              <span><strong>{user.name}</strong><small>{user.email}</small></span>
              <button type="button" className="sidebar-signout" onClick={() => void handleSignOut()} aria-label="Sign out" title="Sign out">
                <LogOut aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="sidebar-profile">
              <span className="profile-avatar">QL</span>
              <span><strong>Guest workspace</strong><small>Sign in or create an account</small></span>
              <ChevronDown aria-hidden="true" />
            </Link>
          )}
        </div>
      </aside>

      <header className="workspace-topbar">
        <div className="topbar-context">
          <span className="topbar-context-mark"><LayoutDashboard aria-hidden="true" /></span>
          <span>QueueLess <span>/</span> {
            pathname === '/overview' ? 'Overview' :
            pathname === '/dashboard' ? 'My appointments' :
            pathname === '/hospitals' ? 'Directory' :
            pathname === '/emergency' ? 'Emergency guide' :
            pathname.startsWith('/hospital/') ? (pathname.endsWith('/book') ? 'Book appointment' : 'Hospital details') :
            pathname === '/results' ? 'Search results' : 'Find care'
          }</span>
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
        <div className="topbar-status" title={user?.email}>
          <span />
          <strong>{user?.name ?? 'Live Network'}</strong>
        </div>
      </header>
      {signOutError && <p className="auth-signout-error" role="status">{signOutError}</p>}
    </div>
  );
}
