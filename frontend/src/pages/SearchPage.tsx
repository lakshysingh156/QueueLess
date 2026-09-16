import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CATEGORIES = [
  { dept: 'General Medicine', symptoms: 'Fever, cold, headache, fatigue', icon: '🩺' },
  { dept: 'Orthopedics', symptoms: 'Knee pain, joint pain, fracture', icon: '🦴' },
  { dept: 'Cardiology', symptoms: 'Chest pain, heart palpitations', icon: '❤️' },
  { dept: 'Dermatology', symptoms: 'Skin rash, acne, eczema', icon: '🌿' },
  { dept: 'Ophthalmology', symptoms: 'Eye pain, vision problems', icon: '👁️' },
  { dept: 'Dentistry', symptoms: 'Toothache, dental pain', icon: '🦷' },
];

export default function SearchPage() {
  const [symptom, setSymptom] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!symptom.trim()) return;
    navigate(`/results?symptom=${encodeURIComponent(symptom.trim())}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">What brings you in today?</h1>
          <p className="text-slate-500 text-sm">Describe your symptom and we'll find the right department and nearby hospitals.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g. knee pain, rash, fever, eye problem…"
              className="w-full pl-10 pr-4 py-3.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3.5 rounded-xl text-sm font-medium transition-colors"
          >
            Search <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Browse by department</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.dept}
                onClick={() => navigate(`/results?symptom=${encodeURIComponent(cat.dept)}`)}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-4 hover:border-sky-300 hover:bg-sky-50 transition-all text-left group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-sky-700 transition-colors">{cat.dept}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.symptoms}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
