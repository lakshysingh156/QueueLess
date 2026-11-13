import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  Clock3,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import hospitalWard from '../assets/hospital-ward.png';
import { getQueue, listHospitals, searchHospitals } from '../api';
import { DEFAULT_SEARCH_LOCATION } from '../searchLocation';
import type { QueueResponse, SearchResult } from '../types';

const QUICK_SYMPTOMS = ['Knee pain', 'Fever', 'Chest pain', 'Skin rash', 'Eye problem', 'Dental pain'];

const SPECIALTIES = [
  'General medicine',
  'Orthopedics',
  'Cardiology',
  'Dermatology',
  'Eye care',
  'Dentistry',
  'Emergency',
];

const STEPS = [
  {
    number: '01',
    title: 'Tell us what’s going on',
    description: 'Search in everyday language. We’ll suggest a medical department to explore.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Compare nearby hospitals',
    description: 'Review estimated waits, distance, and consultation fees in one place.',
    icon: Activity,
  },
  {
    number: '03',
    title: 'Choose a time that works',
    description: 'See how estimated queues change through the day before you set out.',
    icon: CalendarCheck,
  },
];

export default function Home() {
  const [symptom, setSymptom] = useState('');
  const [directorySummary, setDirectorySummary] = useState<{ hospitals: number; specialties: number } | null>(null);
  const [featuredResult, setFeaturedResult] = useState<SearchResult | null>(null);
  const [featuredForecast, setFeaturedForecast] = useState<QueueResponse | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const maxFeaturedWait = featuredForecast?.hourly_predictions.reduce(
    (maximum, hour) => Math.max(maximum, hour.estimated_wait_min),
    1,
  ) ?? 1;

  useEffect(() => {
    let active = true;
    Promise.all([
      listHospitals(),
      searchHospitals('knee pain', DEFAULT_SEARCH_LOCATION.latitude, DEFAULT_SEARCH_LOCATION.longitude),
    ])
      .then(async ([hospitals, search]) => {
        if (!active) return;
        const specialties = new Set(hospitals.flatMap((hospital) => hospital.departments.map((dept) => dept.name)));
        setDirectorySummary({ hospitals: hospitals.length, specialties: specialties.size });
        const recommendation = search.results[0] ?? null;
        setFeaturedResult(recommendation);
        if (recommendation) {
          const forecast = await getQueue(recommendation.hospital_id, recommendation.department);
          if (active) setFeaturedForecast(forecast);
        }
      })
      .catch(() => {
        if (active) setPreviewError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const query = symptom.trim();
    if (!query) {
      searchInputRef.current?.focus();
      return;
    }
    navigate(`/search?symptom=${encodeURIComponent(query)}`);
  }

  function handleQuickSelect(value: string) {
    navigate(`/search?symptom=${encodeURIComponent(value)}`);
  }

  return (
    <div className="site-wrapper bg-white text-slate-900">
      <Navbar dark />

      <main className="flex-1">
        <section className="home-hero">
          <svg
            className="home-ecg"
            viewBox="0 0 1600 420"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              className="home-ecg-track"
              d="M0 210 H120 L145 203 L160 216 L180 150 L202 254 L222 210 H380 L405 203 L420 216 L440 150 L462 254 L482 210 H640 L665 203 L680 216 L700 150 L722 254 L742 210 H900 L925 203 L940 216 L960 150 L982 254 L1002 210 H1160 L1185 203 L1200 216 L1220 150 L1242 254 L1262 210 H1420 L1445 203 L1460 216 L1480 150 L1502 254 L1522 210 H1600"
            />
            <path
              className="home-ecg-pulse"
              pathLength="1600"
              d="M0 210 H120 L145 203 L160 216 L180 150 L202 254 L222 210 H380 L405 203 L420 216 L440 150 L462 254 L482 210 H640 L665 203 L680 216 L700 150 L722 254 L742 210 H900 L925 203 L940 216 L960 150 L982 254 L1002 210 H1160 L1185 203 L1200 216 L1220 150 L1242 254 L1262 210 H1420 L1445 203 L1460 216 L1480 150 L1502 254 L1522 210 H1600"
            />
          </svg>
          <div className="page-container home-hero-grid">
            <div className="home-hero-copy">
              <span className="eyebrow">
                <span className="eyebrow-mark" />
                Healthcare navigation, made clearer
              </span>
              <h1>
                A calmer way to
                <br />
                <span>find your next step.</span>
              </h1>
              <p className="home-intro">
                Compare nearby hospitals, estimated wait times, and consultation fees before you
                head out.
              </p>

              <form onSubmit={handleSearch} className="home-search">
                <label className="sr-only" htmlFor="home-symptom">
                  Search by symptom
                </label>
                <Search className="home-search-icon" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  id="home-symptom"
                  type="text"
                  value={symptom}
                  onChange={(event) => setSymptom(event.target.value)}
                  placeholder="Try “knee pain” or “fever”"
                />
                <button type="submit" className="btn btn-primary home-search-button">
                  Find care
                  <ArrowRight aria-hidden="true" />
                </button>
              </form>

              <div className="home-quick-search">
                <span>Popular searches</span>
                <div className="home-quick-search-list">
                  {QUICK_SYMPTOMS.map((item) => (
                    <button key={item} type="button" onClick={() => handleQuickSelect(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="care-preview" aria-label="Live demonstration hospital comparison">
              <div className="care-preview-top">
                <div>
                  <span className="preview-kicker">A clearer care plan</span>
                  <h2>Make an informed choice.</h2>
                </div>
                <div className="preview-icon">
                  <ShieldCheck aria-hidden="true" />
                </div>
              </div>

              <div className="preview-location">
                <MapPin aria-hidden="true" />
                New Delhi demo centre
                <span className="preview-count"><span /> {directorySummary?.hospitals ?? '—'} listed hospitals</span>
              </div>

              {featuredResult ? (
                <Link
                  to={`/hospital/${featuredResult.hospital_id}?department=${encodeURIComponent(featuredResult.department)}`}
                  className="preview-hospital preview-hospital-featured"
                >
                  <div className="preview-hospital-heading">
                    <div className="preview-hospital-mark">{featuredResult.hospital_name.charAt(0)}</div>
                    <div>
                      <h3>{featuredResult.hospital_name}</h3>
                      <p>{featuredResult.address}, {featuredResult.city}</p>
                    </div>
                    <span className="preview-recommended">Highest match</span>
                  </div>
                  <div className="preview-metrics">
                    <div>
                      <Clock3 aria-hidden="true" />
                      <span><strong>{featuredResult.estimated_wait_min} min</strong>estimated wait</span>
                    </div>
                    <div>
                      <MapPin aria-hidden="true" />
                      <span><strong>{featuredResult.distance_km.toFixed(1)} km</strong>approx. distance</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="preview-hospital preview-hospital-featured">
                  <h3>{previewError ? 'Live preview unavailable' : 'Finding a nearby hospital…'}</h3>
                  <p>{previewError ? 'Start a search to check the local API.' : 'Loading the demonstration directory.'}</p>
                </div>
              )}

              {featuredForecast && (
                <div className="preview-forecast">
                  <div className="preview-forecast-heading">
                    <div>
                      <CalendarCheck aria-hidden="true" />
                      <span>Plan your visit</span>
                    </div>
                    <span className="preview-best-time">Lowest estimate · {featuredForecast.suggested_label}</span>
                  </div>
                  <div className="preview-forecast-track" role="img" aria-label="Illustrative hourly wait forecast">
                    {featuredForecast.hourly_predictions.map((hour) => (
                      <span
                        key={hour.hour}
                        className={hour.hour === featuredForecast.suggested_hour ? 'preview-forecast-best' : ''}
                        style={{ height: `${Math.max(12, (hour.estimated_wait_min / maxFeaturedWait) * 100)}%` }}
                      />
                    ))}
                  </div>
                  <div className="preview-forecast-labels">
                    <span>{featuredForecast.hourly_predictions[0]?.label}</span>
                    <span>{featuredForecast.hourly_predictions[4]?.label}</span>
                    <span>{featuredForecast.hourly_predictions[8]?.label}</span>
                    <span>{featuredForecast.hourly_predictions[12]?.label}</span>
                  </div>
                  <p className="preview-disclaimer">Illustrative queue estimates only; not live hospital data.</p>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="home-metrics" aria-label="QueueLess at a glance">
          <div className="page-container home-metrics-grid">
            <div className="home-metric"><strong>{directorySummary?.hospitals ?? '—'}</strong><span>Demo hospitals listed</span></div>
            <div className="home-metric"><strong>{directorySummary?.specialties ?? '—'}</strong><span>Specialties in directory</span></div>
            <div className="home-metric"><strong>13 hours</strong><span>Illustrative forecast window</span></div>
            <Link to="/hospitals" className="home-metrics-link">
              Explore hospitals <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="home-emergency">
          <div className="page-container">
            <div className="emergency-notice">
              <div className="emergency-notice-copy">
                <span className="emergency-notice-icon"><AlertTriangle aria-hidden="true" /></span>
                <div>
                  <strong>Need emergency help?</strong>
                  <p>For a life-threatening emergency, call 108 or 112 now.</p>
                </div>
              </div>
              <Link to="/emergency" className="emergency-notice-link">
                Emergency information <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="care-network-section">
          <div className="page-container care-network-grid">
            <div className="care-network-image-wrap">
              <img
                className="care-network-image"
                src={hospitalWard}
                alt="A bright, modern hospital ward with patient beds and blue privacy curtains"
                loading="lazy"
              />
              <div className="care-network-image-shade" />
              <div className="care-network-image-caption">
                <span><HeartPulse aria-hidden="true" /></span>
                <div>
                  <strong>Care, closer to home</strong>
                  <p>Delhi-NCR, Chandigarh, and Patiala</p>
                </div>
              </div>
              <div className="care-network-image-note">
                <ShieldCheck aria-hidden="true" />
                <span>Compare care with confidence</span>
              </div>
            </div>

            <div className="care-network-content">
              <span className="section-kicker">Your local care network</span>
              <h2>More options. A little more clarity.</h2>
              <p className="care-network-intro">
                Browse the demonstration hospital directory, explore listed specialties, and compare
                nearby options before contacting a facility.
              </p>

              <div className="care-network-counts">
                <div><strong>{directorySummary?.hospitals ?? '—'}</strong><span>demo hospitals</span></div>
                <div><strong>{directorySummary?.specialties ?? '—'}</strong><span>listed specialties</span></div>
                <div><strong>50 km</strong><span>search radius</span></div>
              </div>

              <div className="care-network-specialties">
                <h3>Browse specialties</h3>
                <div>
                  {SPECIALTIES.map((specialty) => (
                    <span key={specialty}>{specialty}</span>
                  ))}
                </div>
              </div>

              <div className="care-network-doctors">
                <div className="care-network-doctors-heading">
                  <h3>Transparent by design</h3>
                  <span>Prototype directory</span>
                </div>
                <p>Hospital, physician, fee, and queue information is illustrative and has not been verified with facilities.</p>
              </div>

              <Link to="/hospitals" className="care-network-link">
                Browse the hospital directory <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="home-steps-section">
          <div className="page-container">
            <div className="section-heading">
              <span className="section-kicker">Simple by design</span>
              <h2>From a question to a clearer plan.</h2>
              <p>Useful information for planning care, without the noise.</p>
            </div>
            <div className="home-steps-grid">
              {STEPS.map(({ number, title, description, icon: Icon }) => (
                <article className="home-step-card" key={number}>
                  <div className="home-step-top">
                    <span className="home-step-icon"><Icon aria-hidden="true" /></span>
                    <span className="home-step-number">{number}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-final-cta">
          <div className="page-container home-final-cta-inner">
            <div>
              <span className="section-kicker">Start with what you know</span>
              <h2>Find care near you.</h2>
              <p>Search symptoms or browse departments to compare available hospitals.</p>
            </div>
            <Link to="/hospitals" className="btn btn-primary btn-lg">
              Browse hospitals <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-container site-footer-inner">
          <Link to="/" className="site-footer-brand">QueueLess</Link>
          <p>Hospital navigation and simulated queue estimates.</p>
          <Link to="/emergency">In an emergency, call 108 or 112.</Link>
        </div>
      </footer>
    </div>
  );
}
