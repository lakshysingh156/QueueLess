import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, Eye, EyeOff, HeartPulse, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (isSignup) {
        await signUp(name, email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/overview', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoSignIn() {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await signInDemo();
      navigate('/overview', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start a demo session.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="site-wrapper auth-page">
      <main className="auth-shell">
        <section className="auth-story" aria-label="About QueueLess">
          <Link to="/" className="auth-brand" aria-label="QueueLess home">
            <span className="auth-brand-mark" aria-hidden="true">
              <HeartPulse />
            </span>
            <span>QueueLess</span>
          </Link>

          <div className="auth-story-content">
            <div className="auth-story-label">
              <span />
              Healthcare, made easier to navigate
            </div>
            <h1>Make your next care decision with confidence.</h1>
            <p>
              Find nearby hospitals, compare estimated wait times, and plan your visit with a
              little more peace of mind.
            </p>

            <div className="auth-story-visual" aria-hidden="true">
              <div className="auth-visual-glow" />
              <div className="auth-visual-grid" />
              <svg viewBox="0 0 520 180" preserveAspectRatio="none">
                <path
                  className="auth-ecg-track"
                  d="M0 92 H100 L120 86 L134 98 L152 42 L171 137 L190 92 H300 L320 86 L334 98 L352 42 L371 137 L390 92 H520"
                />
                <path
                  className="auth-ecg-pulse"
                  pathLength="520"
                  d="M0 92 H100 L120 86 L134 98 L152 42 L171 137 L190 92 H300 L320 86 L334 98 L352 42 L371 137 L390 92 H520"
                />
              </svg>
              <div className="auth-visual-caption">
                <span className="auth-visual-icon"><Clock3 /></span>
                <span>
                  <strong>Plan at your pace</strong>
                  <small>Compare care options in one place</small>
                </span>
                <ArrowRight className="auth-visual-arrow" />
              </div>
            </div>

            <ul className="auth-benefits">
              <li><MapPin /> Explore hospitals near you</li>
              <li><Clock3 /> Check estimated wait times</li>
              <li><ShieldCheck /> Browse without creating an account</li>
            </ul>
          </div>

          <div className="auth-story-footer">
            <span className="auth-footer-dot" />
            Less searching. More clarity for your next visit.
          </div>
        </section>

        <section className="auth-form-side" aria-label={isSignup ? 'Create an account' : 'Sign in'}>
          <Link to="/" className="auth-back-link">
            <ArrowLeft />
            Back to QueueLess
          </Link>

          <div className="auth-form-wrap">
            <div className="auth-form-heading">
              <span className="auth-form-kicker">{isSignup ? 'GET STARTED' : 'WELCOME BACK'}</span>
              <h2>{isSignup ? 'Create your account' : 'Sign in to your account'}</h2>
              <p>
                {isSignup
                  ? 'Create an account to save your name for your QueueLess visits.'
                  : 'Sign in to continue to your QueueLess workspace.'}
              </p>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="auth-form">
              {isSignup && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="auth-password">Password</label>
                </div>
                <div className="auth-password-wrap">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    minLength={isSignup ? 8 : undefined}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {isSignup && <span className="auth-field-hint">Use at least 8 characters.</span>}
              </div>

              {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}

              <button type="submit" disabled={isSubmitting} className="auth-submit">
                {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
                {!isSubmitting && <ArrowRight />}
              </button>
            </form>

            <div className="auth-divider"><span>or</span></div>
            <button type="button" className="auth-demo-submit" disabled={isSubmitting} onClick={() => void handleDemoSignIn()}>
              <UserRound />
              Continue as guest
            </button>
            <p className="auth-demo-caption">Access QueueLess without an account.</p>

            <div className="auth-switch">
              <span>{isSignup ? 'Already have an account?' : 'New to QueueLess?'}</span>
              <button
                type="button"
                onClick={() => {
                  setIsSignup((previous) => !previous);
                  setErrorMessage('');
                  setPassword('');
                }}
              >
                {isSignup ? 'Sign in' : 'Create an account'}
              </button>
            </div>

            <p className="auth-demo-note">
              <ShieldCheck />
              Passwords are securely hashed. Do not enter medical or other sensitive information.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
