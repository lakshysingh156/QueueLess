import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  ChevronRight,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
  CalendarCheck,
  RotateCcw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getHospital, getQueue } from '../api';
import type { HospitalDetail, QueueResponse } from '../types';

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const department = params.get('department') || 'General Medicine';

  const [hospital, setHospital] = useState<HospitalDetail | null>(null);
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(() => {
    if (!id) return;
    const hid = parseInt(id, 10);
    if (isNaN(hid)) {
      setError('Invalid hospital ID specified');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([getHospital(hid), getQueue(hid, department)])
      .then(([h, q]) => {
        setHospital(h);
        setQueue(q);
      })
      .catch(() => setError('Could not load hospital data from the backend.'))
      .finally(() => setLoading(false));
  }, [id, department]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleDepartmentChange(deptName: string) {
    setParams({ department: deptName });
  }

  if (loading) {
    return (
      <div className="site-wrapper bg-[#fbfcfd]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <div className="spinner mb-4" />
          <p className="text-sm font-medium text-slate-700">Loading hospital details...</p>
        </div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="site-wrapper bg-[#fbfcfd]">
        <Navbar />
        <div className="flex-1 page-container py-24 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mb-3" />
          <h1 className="text-base font-semibold text-slate-900 mb-1">Hospital not found</h1>
          <p className="text-xs text-slate-500 mb-5">{error || 'Could not locate hospital record.'}</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={loadData} className="btn btn-secondary btn-sm">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Try again
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeDept =
    hospital.departments.find((d) => d.name.toLowerCase() === department.toLowerCase()) ??
    hospital.departments[0];

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="flex-1 page-container max-w-5xl py-14 sm:py-16 pb-28">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hover:text-slate-700 transition-colors"
          >
            Results
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium truncate">{hospital.name}</span>
        </nav>

        {/* Clean Hospital Header */}
        <div className="card p-7 sm:p-10 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                  {hospital.name}
                </h1>
                {hospital.emergency_available && (
                  <span className="badge badge-red text-xs">24/7 Emergency</span>
                )}
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{hospital.address}, {hospital.city}</span>
              </p>

              {hospital.phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${hospital.phone}`} className="hover:text-blue-600 transition-colors">
                    {hospital.phone}
                  </a>
                </p>
              )}
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[11px] text-slate-400 block mb-1">Current Department</span>
              <span className="badge badge-blue font-semibold text-xs py-1 px-3">
                <Stethoscope className="w-3.5 h-3.5 mr-1" />
                {department}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Clean Layout with Generous Gap */}
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          {/* Main 2-column pane */}
          <div className="lg:col-span-2 space-y-10">
            {/* Queue & Hourly Forecast Card */}
            {queue && <QueueForecastSection queue={queue} />}

            {/* Departments List */}
            <div className="card p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Hospital Departments</h2>
                <span className="text-xs text-slate-400">{hospital.departments.length} units</span>
              </div>

              <div className="divide-y divide-slate-100">
                {hospital.departments.map((d) => {
                  const isCurrent = d.name.toLowerCase() === department.toLowerCase();
                  return (
                    <div
                      key={d.id}
                      className={`py-3.5 flex items-center justify-between gap-4 transition-colors ${
                        isCurrent ? 'bg-blue-50/40 -mx-3 px-3 rounded-lg' : ''
                      }`}
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => handleDepartmentChange(d.name)}
                          className={`text-xs font-semibold hover:text-blue-600 transition-colors text-left ${
                            isCurrent ? 'text-blue-700' : 'text-slate-800'
                          }`}
                        >
                          {d.name}
                        </button>
                        <p className="text-[11px] text-slate-400 mt-0.5">{d.specialty}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold text-slate-800">
                          {d.consultation_fee_min != null && d.consultation_fee_max != null
                            ? `₹${d.consultation_fee_min} to ₹${d.consultation_fee_max}`
                            : 'Fee not listed'}
                        </div>
                        <div className="text-[11px] text-slate-400">{d.current_queue} waiting</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctors on Duty */}
            {hospital.doctors.length > 0 && (
              <div className="card p-6 sm:p-7">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Physicians</h2>
                  </div>
                  <span className="text-xs text-slate-400">{hospital.doctors.length} listed</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {hospital.doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {doc.name.split(' ').slice(-1)[0]?.charAt(0) ?? 'D'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 truncate">{doc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{doc.qualification}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-400">{doc.experience_years} yrs exp</span>
                          {doc.available_today && (
                            <span className="badge badge-green text-[9px] py-0 px-1.5">
                              Available today
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultation Cost */}
            {activeDept && (
              <div className="card p-6">
                <span className="text-xs text-slate-400 block mb-1">Consultation Fee</span>
                <div className="flex items-baseline gap-1 text-slate-900 mb-1">
                  <IndianRupee className="w-4 h-4 text-slate-600 self-center" />
                  <span className="text-2xl font-bold tracking-tight">
                    {activeDept.consultation_fee_min != null && activeDept.consultation_fee_max != null
                      ? `${activeDept.consultation_fee_min} to ${activeDept.consultation_fee_max}`
                      : 'Not listed'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{activeDept.name} department</p>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Scheme information:</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Participation varies by hospital and service. Confirm eligibility directly
                        with the facility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Facilities Tags */}
            {hospital.facilities && hospital.facilities.length > 0 && (
              <div className="card p-6">
                <span className="text-xs font-semibold text-slate-900 block mb-3">
                  Facilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clean, Non-intrusive Data Notice */}
            <p className="text-[11px] text-slate-400 px-2 leading-relaxed">
              Queue counts and wait predictions are generated from synthetic hourly models for demonstration. Emergency cases are triaged immediately upon arrival.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function QueueForecastSection({ queue }: { queue: QueueResponse }) {
  const maxWait = Math.max(...queue.hourly_predictions.map((h) => h.estimated_wait_min), 1);

  return (
    <div className="card p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Queue & Wait Forecast</h2>
          <span className="text-xs text-slate-400">8:00 AM to 8:00 PM operating hours</span>
        </div>
        <span className="badge badge-gray text-[10px]">Simulated Data</span>
      </div>

      {/* 2 Clean Stat Boxes */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div className="text-2xl font-bold text-slate-900">{queue.current_queue}</div>
          <div className="text-xs text-slate-500 mt-0.5">Patients waiting now</div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
          <div className="text-2xl font-bold text-blue-700">{queue.current_wait_min} min</div>
          <div className="text-xs text-blue-600 mt-0.5">Estimated wait time</div>
        </div>
      </div>

      {/* Suggested Lowest Wait Alert */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 mb-6 flex items-center gap-3">
        <CalendarCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <div className="text-xs">
          <span className="font-semibold text-emerald-900">
            Best time to visit: {queue.suggested_label}
          </span>
          <span className="text-emerald-700 ml-1.5">
            (Estimated wait ~{queue.suggested_wait_min} min)
          </span>
        </div>
      </div>

      {/* Hourly Bars */}
      <div className="space-y-2.5">
        {queue.hourly_predictions.map((h) => {
          const pct = Math.min((h.estimated_wait_min / maxWait) * 100, 100);
          const isBest = h.hour === queue.suggested_hour;

          return (
            <div key={h.hour} className="flex items-center gap-3 text-xs">
              <span
                className={`w-16 shrink-0 text-right ${
                  isBest ? 'font-semibold text-emerald-700' : 'text-slate-400'
                }`}
              >
                {h.label}
              </span>

              <div className="bar-track">
                <div
                  className={`bar-fill ${
                    isBest ? 'bar-fill-green' : pct > 65 ? 'bar-fill-amber' : 'bar-fill'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span
                className={`w-14 text-right shrink-0 ${
                  isBest ? 'font-semibold text-emerald-700' : 'text-slate-600'
                }`}
              >
                {h.estimated_wait_min} min
              </span>

              {isBest && (
                <span className="badge badge-green text-[9px] py-0 px-1.5 shrink-0 hidden sm:inline-flex">
                  Lowest
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
