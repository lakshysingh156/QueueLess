import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Activity, Heart, Eye, Smile, AlertTriangle, ShieldCheck, PhoneCall } from 'lucide-react';
import Navbar from '../components/Navbar';
import LocationPicker from '../components/LocationPicker';
import { getSearchLocation, withSearchLocation } from '../searchLocation';

const CLINICAL_CATEGORIES = [
  {
    dept: 'General Medicine',
    specialty: 'Internal Medicine',
    symptoms: 'Fever, cough, headache, fatigue',
    icon: Activity,
  },
  {
    dept: 'Orthopedics',
    specialty: 'Bone & Joint',
    symptoms: 'Knee pain, joint stiffness, fracture',
    icon: Activity,
  },
  {
    dept: 'Cardiology',
    specialty: 'Heart & Vascular',
    symptoms: 'Chest pain, shortness of breath',
    icon: Heart,
  },
  {
    dept: 'Dermatology',
    specialty: 'Skin & Allergy',
    symptoms: 'Skin rash, eczema, itching',
    icon: Activity,
  },
  {
    dept: 'Ophthalmology',
    specialty: 'Eye Care',
    symptoms: 'Eye pain, blurry vision, redness',
    icon: Eye,
  },
  {
    dept: 'Dentistry',
    specialty: 'Dental & Oral Health',
    symptoms: 'Toothache, gum pain, dental swelling',
    icon: Smile,
  },
  {
    dept: 'Emergency',
    specialty: 'Urgent & Trauma Care',
    symptoms: 'Urgent care, trauma, emergency services',
    icon: ShieldCheck,
  },
];

export default function SearchPage() {
  const location = useLocation();
  const [symptom, setSymptom] = useState(
    () => new URLSearchParams(location.search).get('symptom') || '',
  );
  const navigate = useNavigate();
  const searchLocation = getSearchLocation(location.state);

  function updateLocation(nextLocation: typeof searchLocation) {
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: withSearchLocation(location.state, nextLocation),
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = symptom.trim();
    if (!query) return;
    navigate(`/results?symptom=${encodeURIComponent(query)}`, {
      state: withSearchLocation(location.state, searchLocation),
    });
  }

  function handleSelect(dept: string) {
    navigate(`/results?symptom=${encodeURIComponent(dept)}`, {
      state: withSearchLocation(location.state, searchLocation),
    });
  }

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="workspace-main find-care-page">
        <div className="find-care-content">
          <header className="find-care-heading">
            <span className="section-overline">FIND CARE</span>
            <h1>Find the right department</h1>
            <p>Search by symptom or choose a specialty to compare nearby hospitals.</p>
          </header>

          <section className="find-care-search-panel" aria-label="Search for care">
            <LocationPicker value={searchLocation} onChange={updateLocation} />
            <form onSubmit={handleSubmit} className="find-care-form">
              <div className="find-care-input-wrap">
                <Search aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Describe your symptom or care need"
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="Try knee pain, fever, chest pain, or a rash"
                />
              </div>
              <button type="submit" className="find-care-submit">
                Search hospitals
                <ArrowRight aria-hidden="true" />
              </button>
            </form>
          </section>

          <aside className="find-care-emergency" aria-label="Emergency information">
            <div className="find-care-emergency-copy">
              <span className="find-care-emergency-icon"><AlertTriangle aria-hidden="true" /></span>
              <div>
                <strong>Possible emergency?</strong>
                <p>Severe chest pain, breathing difficulty, or serious injury? Call now—don’t wait for search results.</p>
              </div>
            </div>
            <div className="find-care-emergency-actions">
              <a href="tel:108"><PhoneCall aria-hidden="true" /> Call 108</a>
              <a href="tel:112"><PhoneCall aria-hidden="true" /> Call 112</a>
              <Link to="/emergency">Emergency guide <ArrowRight aria-hidden="true" /></Link>
            </div>
          </aside>

          <section className="find-care-specialties" aria-labelledby="specialties-heading">
            <div className="find-care-section-heading">
              <div>
                <span className="section-overline">EXPLORE BY SPECIALTY</span>
                <h2 id="specialties-heading">Browse departments</h2>
              </div>
              <span className="find-care-specialty-count">7 departments</span>
            </div>

            <div className="find-care-specialty-grid">
            {CLINICAL_CATEGORIES.map((cat) => (
              <button
                key={cat.dept}
                type="button"
                onClick={() => handleSelect(cat.dept)}
                className="find-care-specialty-card"
              >
                <div className="find-care-specialty-top">
                  <span className="find-care-specialty-icon"><cat.icon aria-hidden="true" /></span>
                  <ArrowRight className="find-care-specialty-arrow" aria-hidden="true" />
                </div>
                <div className="find-care-specialty-copy">
                  <h3>{cat.dept}</h3>
                  <p className="find-care-specialty-name">{cat.specialty}</p>
                  <p className="find-care-specialty-symptoms">{cat.symptoms}</p>
                </div>
                <span className="find-care-specialty-link">View hospitals <ArrowRight aria-hidden="true" /></span>
              </button>
            ))}
          </div>
          </section>
          <p className="find-care-disclaimer">QueueLess provides navigation support only. Directory and wait information are illustrative and unverified—not medical advice or a diagnosis.</p>
        </div>
      </main>
    </div>
  );
}
