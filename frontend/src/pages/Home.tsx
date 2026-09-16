import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  ShieldCheck,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const QUICK_SYMPTOMS = [
  { label: 'Knee pain', icon: '🦴' },
  { label: 'Skin rash', icon: '🩺' },
  { label: 'Fever', icon: '🌡️' },
  { label: 'Eye problem', icon: '👁️' },
  { label: 'Dental pain', icon: '🦷' },
  { label: 'Chest pain', icon: '❤️' },
];

const HOW_IT_WORKS = [
  {
    icon: Stethoscope,
    title: 'Describe your need',
    body: 'Tell us your symptom or the type of care you need. We map it to the right department.',
  },
  {
    icon: BarChart2,
    title: 'See live estimates',
    body: 'Compare hospitals by distance, estimated wait time, and cost — all in one place.',
  },
  {
    icon: Clock,
    title: 'Choose the best time',
    body: 'View hourly predicted queue sizes and pick the slot that works best for you.',
  },
  {
    icon: ShieldCheck,
    title: 'Navigate with confidence',
    body: 'Get directions, facility info, and doctor availability before you leave home.',
  },
];

export default function Home() {
  const [symptom, setSymptom] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!symptom.trim()) return;
    navigate(`/results?symptom=${encodeURIComponent(symptom.trim())}`);
  }

  function handleQuick(label: string) {
    navigate(`/results?symptom=${encodeURIComponent(label)}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Healthcare Navigation — B.Tech Prototype
            </span>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
              Find the right hospital,{' '}
              <span className="text-sky-600">at the right time.</span>
            </h1>

            <p className="text-lg text-slate-500 mb-10 leading-relaxed">
              QueueLess helps you compare hospitals by department, wait time, distance, and cost — so you can make an informed decision before you leave home.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="e.g. knee pain, skin rash, fever…"
                  className="w-full pl-10 pr-4 py-3.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white placeholder-slate-400 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3.5 rounded-xl font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
              >
                Find hospitals
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick symptoms */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 flex items-center mr-1">Quick select:</span>
              {QUICK_SYMPTOMS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleQuick(s.label)}
                  className="text-xs text-slate-600 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency banner */}
      <section className="bg-rose-50 border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-900">Medical emergency?</p>
              <p className="text-xs text-rose-600">Find the nearest emergency-ready hospital with available capacity.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/emergency')}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            Emergency mode
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">How QueueLess works</h2>
          <p className="text-slate-500 text-sm">Four steps from symptom to hospital visit.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-sky-600" />
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Step {i + 1}</p>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Compare hospitals the smart way
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Instead of calling every hospital or guessing the wait, QueueLess gives you a ranked list based on distance, department availability, queue length, and consultation cost.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: MapPin, text: 'Distance from your location' },
                  { icon: Clock, text: 'Estimated queue wait time' },
                  { icon: BarChart2, text: 'Hourly queue predictions' },
                  { icon: ShieldCheck, text: 'Cost and scheme information' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-6 h-6 rounded-md bg-sky-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-sky-600" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/search')}
                className="mt-8 inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Try it now <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Visual card preview */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Sample result — Orthopedics</p>
              {[
                { name: 'AIIMS New Delhi', wait: '42 min', dist: '3.2 km', fee: '₹300–700', rank: 1, badge: 'Best match' },
                { name: 'Safdarjung Hospital', wait: '55 min', dist: '3.8 km', fee: '₹150–400', rank: 2, badge: null },
                { name: 'Max Saket', wait: '28 min', dist: '7.1 km', fee: '₹700–1800', rank: 3, badge: null },
              ].map((h) => (
                <div key={h.name} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {h.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{h.name}</p>
                        {h.badge && (
                          <span className="hidden sm:inline text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-full">
                            {h.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{h.dist} · {h.fee}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{h.wait}</p>
                    <p className="text-xs text-slate-400">est. wait</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
