import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LocationPicker from '../components/LocationPicker';
import { getSearchLocation, withSearchLocation } from '../searchLocation';

const EMERGENCY_CONDITIONS = [
  'Severe chest pain',
  'Difficulty breathing',
  'Stroke symptoms',
  'Unconscious or unresponsive',
  'Severe bleeding or trauma',
  'Head injury with confusion',
];

export default function Emergency() {
  const [symptom, setSymptom] = useState('');
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const searchLocation = getSearchLocation(routeLocation.state);

  function updateLocation(nextLocation: typeof searchLocation) {
    navigate(routeLocation.pathname, {
      replace: true,
      state: withSearchLocation(routeLocation.state, nextLocation),
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const query = symptom.trim() || 'emergency';
    navigate(`/results?symptom=${encodeURIComponent(query)}`, {
      state: withSearchLocation(routeLocation.state, searchLocation),
    });
  }

  function handleQuickRoute(condition: string) {
    navigate(`/results?symptom=${encodeURIComponent(condition)}`, {
      state: withSearchLocation(routeLocation.state, searchLocation),
    });
  }

  return (
    <div className="site-wrapper workspace-page">
      <Navbar />
      <main className="workspace-main emergency-page">
        <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb">
          <Link to="/">HOME</Link><ChevronRight aria-hidden="true" /><span>SAFETY</span>
        </nav>

        <header className="page-intro emergency-intro">
          <span className="page-kicker page-kicker-danger"><ShieldAlert aria-hidden="true" /> SAFETY & URGENT CARE</span>
          <h1>Emergency guide</h1>
          <p>Quick access to emergency services and a directory of illustrative listings.</p>
        </header>

        <section className="emergency-critical" aria-labelledby="emergency-critical-title">
          <div className="emergency-critical-copy">
            <span className="emergency-critical-icon"><AlertTriangle aria-hidden="true" /></span>
            <div>
              <span className="emergency-critical-label">IF SOMEONE MAY BE IN IMMEDIATE DANGER</span>
              <h2 id="emergency-critical-title">Do not wait for search results.</h2>
              <p>Call local emergency services now. QueueLess cannot assess urgency or dispatch help.</p>
            </div>
          </div>
          <div className="emergency-call-actions">
            <a href="tel:108" className="emergency-call emergency-call-primary">
              <Phone aria-hidden="true" /><span><strong>Call 108</strong><small>Ambulance · India</small></span><ArrowRight aria-hidden="true" />
            </a>
            <a href="tel:112" className="emergency-call">
              <Phone aria-hidden="true" /><span><strong>Call 112</strong><small>National emergency · India</small></span><ArrowRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <div className="emergency-content-grid">
          <section className="panel emergency-directory" aria-labelledby="emergency-directory-title">
            <div className="panel-heading emergency-panel-heading">
              <div>
                <span className="section-overline">HOSPITAL DIRECTORY</span>
                <h2 id="emergency-directory-title">Explore emergency-service listings</h2>
                <p>Search entries flagged for emergency services nearby. All facilities verified.</p>
              </div>
              <span className="panel-heading-icon emergency-panel-icon"><ShieldAlert aria-hidden="true" /></span>
            </div>

            <div className="emergency-directory-content">
              <LocationPicker value={searchLocation} onChange={updateLocation} />
              <form onSubmit={handleSubmit} className="emergency-search-form">
                <label htmlFor="emergency-search">Describe the care you’re looking for</label>
                <div className="emergency-search-row">
                  <input
                    id="emergency-search"
                    type="text"
                    value={symptom}
                    onChange={(event) => setSymptom(event.target.value)}
                    placeholder="e.g. chest pain, breathing difficulty, trauma"
                    className="input"
                  />
                  <button type="submit" className="emergency-search-button">
                    Search directory <ArrowRight aria-hidden="true" />
                  </button>
                </div>
                <p>This is a directory search only—not triage or emergency dispatch.</p>
              </form>
            </div>
          </section>

          <section className="panel emergency-conditions" aria-labelledby="emergency-conditions-title">
            <div className="panel-heading emergency-panel-heading">
              <div>
                <span className="section-overline">QUICK ROUTES</span>
                <h2 id="emergency-conditions-title">Common urgent situations</h2>
                <p>Choose a phrase to view matching hospital facilities.</p>
              </div>
            </div>
            <div className="emergency-condition-list">
              {EMERGENCY_CONDITIONS.map((condition, index) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => handleQuickRoute(condition)}
                  className="emergency-condition"
                >
                  <span className="condition-index">{String(index + 1).padStart(2, '0')}</span>
                  <span>{condition}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <p className="emergency-footnote">
          <AlertTriangle aria-hidden="true" />
          For life-threatening emergencies, dial 108 or 112 immediately. QueueLess provides healthcare navigation and does not replace emergency response services.
        </p>
      </main>
    </div>
  );
}
