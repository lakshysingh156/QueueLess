import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  MapPin, Phone, Clock, ChevronRight, Loader2,
  CheckCircle2, UserCheck, Stethoscope,
  ShieldCheck, Info
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getHospital, getQueue } from '../api';
import type { HospitalDetail, QueueResponse } from '../types';

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const department = params.get('department') || 'General Medicine';

  const [hospital, setHospital] = useState<HospitalDetail | null>(null);
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const hid = parseInt(id);
    Promise.all([getHospital(hid), getQueue(hid, department)])
      .then(([h, q]) => { setHospital(h); setQueue(q); })
      .finally(() => setLoading(false));
  }, [id, department]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading…
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-500">Hospital not found.</div>
      </div>
    );
  }

  const dept = hospital.departments.find(d => d.name.toLowerCase() === department.toLowerCase())
    ?? hospital.departments[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/results" className="hover:text-slate-700">Results</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-medium truncate">{hospital.name}</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-xl font-bold text-slate-900">{hospital.name}</h1>
                {hospital.emergency_available && (
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    Emergency
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
                <MapPin className="w-4 h-4 flex-shrink-0" /> {hospital.address}, {hospital.city}
              </p>
              {hospital.phone && (
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone className="w-4 h-4 flex-shrink-0" /> {hospital.phone}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Viewing department</p>
              <p className="text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg">{department}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Queue & Wait */}
            {queue && <QueueSection queue={queue} />}

            {/* Departments */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-600" /> Departments
              </h2>
              <div className="space-y-2">
                {hospital.departments.map(d => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.specialty}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-slate-800">₹{d.consultation_fee_min}–{d.consultation_fee_max}</p>
                      <p className="text-xs text-slate-400">{d.current_queue} in queue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctors */}
            {hospital.doctors.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-600" /> Specialists
                </h2>
                <div className="space-y-3">
                  {hospital.doctors.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-semibold text-sm">
                        {doc.name.split(' ').pop()?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.qualification} · {doc.experience_years} yrs</p>
                      </div>
                      {doc.available_today && (
                        <span className="ml-auto text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Available today
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Cost */}
            {dept && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Estimated Cost</h2>
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  ₹{dept.consultation_fee_min}–{dept.consultation_fee_max}
                </p>
                <p className="text-xs text-slate-500">Consultation fee for {dept.name}</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    Scheme information may be available (Ayushman Bharat, ESI)
                  </p>
                </div>
              </div>
            )}

            {/* Facilities */}
            {hospital.facilities && hospital.facilities.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">Facilities</h2>
                <div className="flex flex-wrap gap-2">
                  {hospital.facilities.map(f => (
                    <span key={f} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                This is a navigation prototype. Queue and cost data are simulated for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function QueueSection({ queue }: { queue: QueueResponse }) {
  const maxWait = Math.max(...queue.hourly_predictions.map(h => h.estimated_wait_min));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" /> Queue & Wait Time
        </h2>
        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full font-medium">
          Simulated demo data
        </span>
      </div>

      {/* Current */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
          <p className="text-2xl font-bold text-slate-900">{queue.current_queue}</p>
          <p className="text-xs text-slate-500 mt-0.5">People in queue</p>
        </div>
        <div className="bg-sky-50 rounded-lg p-3 text-center border border-sky-100">
          <p className="text-2xl font-bold text-sky-700">{queue.current_wait_min} min</p>
          <p className="text-xs text-slate-500 mt-0.5">Est. wait now</p>
        </div>
      </div>

      {/* Suggested time */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-green-800">Suggested visit time: {queue.suggested_label}</p>
          <p className="text-xs text-green-700">Estimated wait — {queue.suggested_wait_min} min</p>
        </div>
      </div>

      {/* Hourly chart */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Predicted wait by hour</p>
        <div className="space-y-2">
          {queue.hourly_predictions.map(h => {
            const pct = (h.estimated_wait_min / maxWait) * 100;
            const isBest = h.hour === queue.suggested_hour;
            return (
              <div key={h.hour} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-16 flex-shrink-0">{h.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isBest ? 'bg-green-500' : pct > 70 ? 'bg-amber-400' : 'bg-sky-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-14 text-right flex-shrink-0 ${isBest ? 'text-green-700 font-semibold' : 'text-slate-600'}`}>
                  {h.estimated_wait_min} min {isBest && '⭐'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mt-4">{queue.disclaimer}</p>
    </div>
  );
}
