import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  ChevronRight,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
  CalendarCheck,
  CalendarPlus,
  RotateCcw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getHospital, getQueue } from '../api';
import type { HospitalDetail, QueueResponse } from '../types';
import { getConsultationFeeRange } from '../demoFees';

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const department = params.get('department') || 'General Medicine';

  const [hospital, setHospital] = useState<HospitalDetail | null>(null);
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const hospitalId = Number(id);
    if (!id || !Number.isInteger(hospitalId) || hospitalId <= 0) return;
    let active = true;
    Promise.all([getHospital(hospitalId), getQueue(hospitalId, department)])
      .then(([h, q]) => {
        if (active) {
          setHospital(h);
          setQueue(q);
        }
      })
      .catch(() => {
        if (active) setError('Could not load hospital data from the backend.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [department, id, retryToken]);

  function handleDepartmentChange(deptName: string) {
    setLoading(true);
    setError('');
    setParams({ department: deptName });
  }

  function retryLoading() {
    setLoading(true);
    setError('');
    setRetryToken((token) => token + 1);
  }

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return (
      <div className="site-wrapper bg-[#fbfcfd]">
        <Navbar />
        <main className="page-container flex-1 py-24 text-center">
          <h1 className="text-base font-semibold text-slate-900">Invalid hospital link</h1>
          <p className="mt-2 text-sm text-slate-600">Choose a hospital from the directory to continue.</p>
          <Link to="/hospitals" className="btn btn-primary mt-5">Browse hospitals</Link>
        </main>
      </div>
    );
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
          <h1 className="text-base font-semibold text-slate-900 mb-1">Hospital details unavailable</h1>
          <p className="text-xs text-slate-500 mb-5">{error || 'Could not locate hospital record.'}</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={retryLoading} className="btn btn-secondary btn-sm">
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
  const activeFee = activeDept
    ? getConsultationFeeRange(
        hospital.name,
        activeDept.name,
        activeDept.consultation_fee_min,
        activeDept.consultation_fee_max,
      )
    : null;

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="workspace-main hospital-detail-page">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb">
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

        {/* Hospital Header */}
        <div className="hospital-profile-header card">
          <div className="hospital-profile-copy">
            <div className="hospital-profile-title">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1>{hospital.name}</h1>
                {hospital.emergency_available && (
                  <span className="badge badge-red text-xs">Emergency services</span>
                )}
              </div>
              <p className="hospital-profile-meta">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{hospital.address}, {hospital.city}</span>
              </p>

              {hospital.phone && (
                <p className="hospital-profile-meta">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${hospital.phone}`} className="hover:text-blue-600 transition-colors">
                    {hospital.phone}
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="hospital-profile-department flex flex-col items-end gap-3">
            <span>Viewing department</span>
            <span className="badge badge-blue font-semibold text-xs py-1 px-3">
              <Stethoscope className="w-3.5 h-3.5 mr-1" />
              {department}
            </span>
            <Link
              to={`/hospital/${id}/book?department=${encodeURIComponent(department)}&hospital=${encodeURIComponent(hospital.name)}`}
              className="btn btn-primary btn-sm"
            >
              <CalendarPlus className="w-3.5 h-3.5 mr-1" />
              Book appointment
            </Link>
          </div>
        </div>

        <div className="hospital-detail-grid">
          <div className="hospital-detail-primary">
            {/* Queue & Hourly Forecast Card */}
            {queue && <QueueForecastSection queue={queue} />}

            {/* Departments List */}
            <div className="card department-panel">
              <div className="department-panel-heading">
                <div>
                  <span className="section-overline">SPECIALTIES &amp; AVAILABILITY</span>
                  <h2>Hospital departments</h2>
                </div>
                <span className="text-xs text-slate-400">{hospital.departments.length} units</span>
              </div>

              <div className="department-list">
                {hospital.departments.map((d) => {
                  const isCurrent = d.name.toLowerCase() === department.toLowerCase();
                  const fee = getConsultationFeeRange(
                    hospital.name,
                    d.name,
                    d.consultation_fee_min,
                    d.consultation_fee_max,
                  );
                  return (
                    <div
                      key={d.id}
                      className={`department-row transition-colors ${
                        isCurrent ? 'bg-blue-50/40 -mx-3 px-3 rounded-lg' : ''
                      }`}
                    >
                      <div className="department-row-name">
                        <button
                          type="button"
                          onClick={() => handleDepartmentChange(d.name)}
                          disabled={!d.available}
                          className={`text-xs font-semibold text-left transition-colors ${
                            !d.available
                              ? 'cursor-not-allowed text-slate-400'
                              : isCurrent
                                ? 'text-blue-700 hover:text-blue-600'
                                : 'text-slate-800 hover:text-blue-600'
                          }`}
                        >
                          {d.name}
                        </button>
                        <p>{d.specialty}</p>
                      </div>

                      <div className="department-row-meta">
                        <div className="department-fee">
                          {fee
                            ? `₹${fee.min} to ₹${fee.max}`
                            : 'Fee not listed'}
                        </div>
                        <div className="department-queue">
                          {d.available ? `${d.current_queue} in queue` : 'Currently unavailable'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctors */}
            {hospital.doctors.length > 0 && (
              <div className="card clinician-note">
                <div className="clinician-note-heading">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Our clinicians</h2>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  These are listed clinicians at this hospital. Contact the hospital to confirm current availability and scheduling.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hospital-detail-sidebar">
            {/* Book Appointment CTA */}
            <div className="card detail-side-card bg-blue-600 text-white">
              <CalendarPlus className="w-5 h-5 mb-2 opacity-80" />
              <h2 className="text-sm font-semibold mb-1">Book an appointment</h2>
              <p className="text-xs opacity-80 mb-4">
                Choose your preferred date and time slot for {department}.
              </p>
              <Link
                to={`/hospital/${id}/book?department=${encodeURIComponent(department)}&hospital=${encodeURIComponent(hospital.name)}`}
                className="block text-center text-xs font-semibold bg-white text-blue-700 rounded-lg py-2.5 hover:bg-blue-50 transition-colors"
              >
                Schedule a visit
              </Link>
            </div>

            {/* Consultation Cost */}
            {activeDept && (
              <div className="card detail-side-card">
                <span className="section-overline">COST OVERVIEW</span>
                <h2>Consultation fee</h2>
                <div className="flex items-baseline gap-1 text-slate-900 mb-1">
                  <IndianRupee className="w-4 h-4 text-slate-600 self-center" />
                  <span className="text-2xl font-bold tracking-tight">
                  {activeFee
                    ? `${activeFee.min} to ${activeFee.max}`
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
              <div className="card detail-side-card">
                <span className="section-overline">FACILITY INFORMATION</span>
                <h2>
                  Facilities
                </h2>
                <div className="facility-list">
                  {hospital.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="facility-tag"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="hospital-data-disclaimer">
              Queue estimates are updated periodically. For medical emergencies, call 108 or 112 immediately.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function QueueForecastSection({ queue }: { queue: QueueResponse }) {
  const maxWait = Math.max(...queue.hourly_predictions.map((h) => h.estimated_wait_min), 1);

  return (
    <div className="card forecast-panel">
      <div className="forecast-panel-heading">
        <div>
          <span className="section-overline">QUEUE FORECAST</span>
          <h2>Queue &amp; wait forecast</h2>
          <p>8:00 AM–8:00 PM · {queue.estimate_method}</p>
        </div>
        <span className="badge badge-gray text-[10px]">Updated estimates</span>
      </div>

      {/* 2 Clean Stat Boxes */}
      <div className="forecast-stats">
        <div className="forecast-stat">
          <div className="text-2xl font-bold text-slate-900">{queue.current_queue}</div>
          <div className="text-xs text-slate-500 mt-0.5">Patients waiting now</div>
        </div>
        <div className="forecast-stat forecast-stat-primary">
          <div className="text-2xl font-bold text-blue-700">{queue.current_wait_min} min</div>
          <div className="text-xs text-blue-600 mt-0.5">Estimated wait time</div>
        </div>
      </div>

      {/* Suggested Lowest Wait Alert */}
      <div className="forecast-best">
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
      <div className="forecast-list">
        {queue.hourly_predictions.map((h) => {
          const pct = Math.min((h.estimated_wait_min / maxWait) * 100, 100);
          const isBest = h.hour === queue.suggested_hour;

          return (
            <div key={h.hour} className={`forecast-row${isBest ? ' is-best' : ''}`}>
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
      <p className="forecast-disclaimer">{queue.disclaimer}</p>
    </div>
  );
}
