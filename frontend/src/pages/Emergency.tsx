import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EMERGENCY_SYMPTOMS = [
  'Severe chest pain', 'Heart attack', 'Stroke symptoms',
  'Difficulty breathing', 'Severe bleeding', 'Unconscious / not responding',
  'Seizure', 'Severe accident injury',
];

export default function Emergency() {
  const [symptom, setSymptom] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = symptom.trim() || 'emergency';
    navigate(`/results?symptom=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">

        {/* Warning header */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mb-8 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-900 mb-1">Life-threatening emergency?</p>
            <p className="text-sm text-rose-700 leading-relaxed">
              Call <strong>108</strong> (Ambulance) or <strong>112</strong> (Emergency) immediately.
              QueueLess is a navigation prototype and does not provide medical diagnosis or emergency dispatch.
            </p>
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 mt-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" /> Call 108 Ambulance
            </a>
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">Emergency Hospital Finder</h1>
        <p className="text-sm text-slate-500 mb-8">
          Find the nearest emergency-capable hospital with current queue status.
          Results are ranked by distance and emergency availability.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
          <input
            type="text"
            autoFocus
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="e.g. severe chest pain, accident…"
            className="flex-1 px-4 py-3.5 text-sm border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3.5 rounded-xl text-sm font-medium transition-colors"
          >
            Find now <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick buttons */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Common emergencies</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {EMERGENCY_SYMPTOMS.map(s => (
              <button
                key={s}
                onClick={() => navigate(`/results?symptom=${encodeURIComponent(s)}`)}
                className="text-sm text-left text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-3 rounded-lg transition-colors font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
