import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Activity, Heart, Eye, Smile, AlertTriangle, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import LocationPicker from '../components/LocationPicker';
import { getSearchLocation, withSearchLocation } from '../searchLocation';

const CLINICAL_CATEGORIES = [
  {
    dept: 'General Medicine',
    specialty: 'Internal Medicine',
    symptoms: 'Fever, cough, headache, fatigue',
    fee: '₹50–₹700',
    icon: Activity,
  },
  {
    dept: 'Orthopedics',
    specialty: 'Bone & Joint',
    symptoms: 'Knee pain, joint stiffness, fracture',
    fee: '₹100–₹1000',
    icon: Activity,
  },
  {
    dept: 'Cardiology',
    specialty: 'Heart & Vascular',
    symptoms: 'Chest pain, shortness of breath',
    fee: '₹500–₹1200',
    icon: Heart,
  },
  {
    dept: 'Dermatology',
    specialty: 'Skin & Allergy',
    symptoms: 'Skin rash, eczema, itching',
    fee: '₹50–₹700',
    icon: Activity,
  },
  {
    dept: 'Ophthalmology',
    specialty: 'Eye Care',
    symptoms: 'Eye pain, blurry vision, redness',
    fee: '₹50–₹800',
    icon: Eye,
  },
  {
    dept: 'Dentistry',
    specialty: 'Dental & Oral Health',
    symptoms: 'Toothache, gum pain, dental swelling',
    fee: '₹100–₹600',
    icon: Smile,
  },
  {
    dept: 'Emergency',
    specialty: 'Urgent & Trauma Care',
    symptoms: 'Urgent care, trauma, emergency services',
    fee: '24/7',
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

      <main className="flex-1 page-container max-w-5xl py-24 sm:py-28">
        {/* Crisp, Airy Header */}
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Explore care</span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mt-3 mb-4 leading-tight">
            Find the right department
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            Search by symptom or select a medical specialty below.
          </p>
        </div>

        <div className="mb-5 max-w-4xl">
          <LocationPicker value={searchLocation} onChange={updateLocation} />
        </div>

        {/* Clean Search Console with Guaranteed Space (No Overlap) */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-10 max-w-4xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g. knee pain, fever, chest pain, rash..."
              style={{ paddingLeft: '3.25rem' }}
              className="input py-3.5 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg px-7">
            Search
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Minimal Emergency Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 border border-rose-200/70 mb-20 flex items-center justify-between gap-4 max-w-4xl">
          <div className="flex items-center gap-2.5 text-xs text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Severe chest pain or trauma? Call 108 or 112 immediately.</span>
          </div>
          <Link to="/emergency" className="btn btn-danger btn-sm shrink-0 px-3.5 py-1.5">
            Emergency
          </Link>
        </div>

        {/* Clean Department Grid with Open Spacing */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Browse Specialties
            </h2>
            <span className="text-xs text-slate-400">7 clinical departments</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 pb-24">
            {CLINICAL_CATEGORIES.map((cat) => (
              <button
                key={cat.dept}
                type="button"
                onClick={() => handleSelect(cat.dept)}
                className="card card-hover p-7 min-h-64 text-left flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <cat.icon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[11px] text-slate-400">{cat.fee}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                    {cat.dept}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-2">{cat.specialty}</p>
                  <p className="text-xs text-slate-400">{cat.symptoms}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                  <span>View hospitals</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
