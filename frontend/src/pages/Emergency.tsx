import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Phone, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

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
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = symptom.trim() || 'emergency';
    navigate(`/results?symptom=${encodeURIComponent(query)}`);
  }

  function handleQuickRoute(condition: string) {
    navigate(`/results?symptom=${encodeURIComponent(condition)}`);
  }

  return (
    <div className="site-wrapper bg-[#fcfbfa]">
      <Navbar />

      <main className="flex-1 page-container py-14 max-w-2xl">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-rose-700 font-semibold">Emergency</span>
        </nav>

        {/* Immediate Call Notice */}
        <div className="card p-7 sm:p-8 bg-rose-50/70 border-rose-200 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-950 mb-1.5">
                Life-Threatening Emergency?
              </h1>
              <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
                Do not wait for search results if a patient is unresponsive, having severe chest pain, or struggling to breathe.
              </p>
            </div>
          </div>

          {/* Direct Telephone Call Buttons */}
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="tel:108"
              className="btn btn-danger btn-lg text-center justify-center py-3.5"
            >
              <Phone className="w-4 h-4 mr-1.5" />
              Call 108 (Ambulance)
            </a>

            <a
              href="tel:112"
              className="btn btn-secondary btn-lg text-center justify-center py-3.5 border-rose-200 text-rose-800 hover:bg-rose-100"
            >
              <Phone className="w-4 h-4 mr-1.5 text-rose-600" />
              Call 112 (National Emergency)
            </a>
          </div>
        </div>

        {/* Emergency Hospital Search */}
        <div className="card p-7 sm:p-8 mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Find Emergency Trauma Centers
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Filter nearby hospitals with accredited 24/7 emergency departments.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              autoFocus
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g. chest pain, cardiac distress, trauma..."
              className="input py-3 text-sm focus:border-rose-500 focus:ring-rose-500/10 flex-1"
            />
            <button type="submit" className="btn btn-danger btn-lg px-6">
              Find Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Quick Condition Chips */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Common Situations
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {EMERGENCY_CONDITIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleQuickRoute(item)}
                  className="card card-hover p-3 text-left text-xs text-slate-700 hover:text-rose-700 hover:border-rose-200 transition-all flex items-center justify-between"
                >
                  <span>{item}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
          QueueLess provides hospital routing and does not dispatch emergency personnel or perform medical triage.
        </p>
      </main>
    </div>
  );
}
