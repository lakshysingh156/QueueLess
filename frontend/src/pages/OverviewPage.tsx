import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  CalendarCheck,
  Stethoscope,
  SlidersHorizontal,
  Activity,
  Heart,
  Eye,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/Navbar';

const WORKFLOW = [
  {
    icon: Stethoscope,
    step: '01',
    title: 'Enter Everyday Symptoms',
    desc: 'Describe what you are experiencing in plain terms like knee pain, fever, or chest tightness. QueueLess uses clinical keyword mapping to identify the matching medical department.',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: 'Compare Ranked Options',
    desc: 'Nearby hospitals are evaluated using a deterministic scoring formula balancing current estimated waiting time (40%), travel distance (30%), and consultation fees (30%).',
  },
  {
    icon: Clock,
    step: '03',
    title: 'Time Your Departure',
    desc: 'Review 13-hour predicted queue forecasts from 8:00 AM to 8:00 PM to identify when patient volume drops, allowing you to choose the lowest-wait arrival window.',
  },
];

const SPECIALTIES = [
  { name: 'General Medicine', desc: 'Internal medicine, fever, viral infections, headaches', icon: Activity },
  { name: 'Orthopedics', desc: 'Bone fractures, joint pain, sports injuries, spine care', icon: Activity },
  { name: 'Cardiology', desc: 'Cardiac evaluations, chest discomfort, vascular diagnostics', icon: Heart },
  { name: 'Dermatology', desc: 'Skin rashes, eczema, acute dermatitis, allergic symptoms', icon: Activity },
  { name: 'Ophthalmology', desc: 'Eye pain, sudden vision changes, trauma, acute redness', icon: Eye },
  { name: 'Dentistry', desc: 'Acute toothache, dental trauma, oral infections', icon: Smile },
];

export default function OverviewPage() {
  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="flex-1">
        {/* ── Expansive Header Section ── */}
        <section className="py-24 sm:py-32 border-b border-slate-100 bg-white">
          <div className="page-container max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/60 px-4 py-1.5 mb-8 text-xs text-blue-700 font-medium">
              Platform Architecture & Methodology
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-6 leading-tight">
              How QueueLess helps you navigate care
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
              A transparent look at how symptoms are routed to departments, how wait times are projected, and how hospital rankings are computed.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/search" className="btn btn-primary btn-lg px-8">
                Find Nearby Care
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link to="/emergency" className="btn btn-secondary btn-lg px-6 text-rose-700 hover:text-rose-800">
                Emergency Guide
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3-Step Journey (Spacious & Open) ── */}
        <section className="py-28 sm:py-36 bg-[#fbfcfd]">
          <div className="page-container max-w-5xl">
            <div className="max-w-xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-2">
                User Journey
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
                Three steps from symptoms to departure
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Making a healthcare decision before leaving home prevents overcrowding in hospital waiting rooms.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {WORKFLOW.map((item) => (
                <div key={item.step} className="card p-8 sm:p-9 bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600 tracking-wider block mb-2">
                      STEP {item.step}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Deterministic Algorithm Breakdown ── */}
        <section className="py-28 sm:py-36 bg-white border-y border-slate-100">
          <div className="page-container max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-2">
                  Scoring Model
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">
                  Transparent, explainable ranking
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-8">
                  Unlike opaque machine learning systems, QueueLess uses a deterministic linear score so users understand why a specific hospital is recommended.
                </p>

                <div className="space-y-6">
                  <div className="p-5 rounded-2xl border border-slate-200/80 bg-[#fbfcfd]">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-semibold text-slate-900">Estimated Wait Time</h4>
                      <span className="text-xs font-bold text-blue-600">40% Weight</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Evaluates current queue depth multiplied by service throughput rate.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200/80 bg-[#fbfcfd]">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-semibold text-slate-900">Great-Circle Distance</h4>
                      <span className="text-xs font-bold text-blue-600">30% Weight</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Calculates Haversine travel distance from user coordinates to the hospital campus.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200/80 bg-[#fbfcfd]">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-semibold text-slate-900">Consultation Charges</h4>
                      <span className="text-xs font-bold text-blue-600">30% Weight</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Normalizes median outpatient consultation fees across municipal baselines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hourly Forecast Explanation Card */}
              <div className="card p-8 sm:p-10 bg-[#fafbfc] border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-semibold text-slate-900">Hourly Demand Projection</h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Queue volume fluctuates predictably throughout the day. Morning hours typically experience peak arrival volume, while mid-afternoon windows show the lowest queue depth.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { time: '8:00 AM – 11:00 AM', status: 'Peak Inflow', wait: '60–90 min', amber: true },
                    { time: '1:00 PM – 3:30 PM', status: 'Lowest Volume', wait: '15–30 min', green: true },
                    { time: '4:00 PM – 7:00 PM', status: 'Evening Inflow', wait: '40–60 min' },
                  ].map((row) => (
                    <div key={row.time} className="p-3.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{row.time}</div>
                        <div className={`text-[11px] ${row.green ? 'text-emerald-700' : row.amber ? 'text-amber-700' : 'text-slate-400'}`}>
                          {row.status}
                        </div>
                      </div>
                      <div className="font-bold text-slate-800">{row.wait}</div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400">
                  Forecasts provide directional planning assistance based on historical arrival distributions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Specialties Directory ── */}
        <section className="py-28 sm:py-36 bg-[#fbfcfd]">
          <div className="page-container max-w-5xl">
            <div className="max-w-xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-2">
                Clinical Coverage
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
                Supported clinical departments
              </h2>
              <p className="text-sm text-slate-500">
                The demo directory covers Delhi-NCR, Chandigarh, and Patiala with synthetic queue estimates.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SPECIALTIES.map((dept) => (
                <div key={dept.name} className="card p-7 bg-white">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                    <dept.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{dept.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{dept.desc}</p>
                  <Link
                    to={`/search?symptom=${encodeURIComponent(dept.name)}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View hospitals <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Healthcare Scheme Integration ── */}
        <section className="py-28 bg-white border-t border-slate-100">
          <div className="page-container max-w-4xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-4">
              Government Healthcare Scheme Support
            </h2>

            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mb-10">
              QueueLess identifies hospitals that accept Ayushman Bharat PM-JAY (₹5 lakh coverage), Employees&apos; State Insurance (ESI), and Delhi Arogya Kosh (DAK).
            </p>

            <Link to="/search" className="btn btn-primary btn-lg px-8">
              Explore Nearby Hospitals
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
