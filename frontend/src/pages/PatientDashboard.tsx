import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Phone,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../useAuth';

export interface StoredAppointment {
  referenceId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  symptoms: string;
  hospitalName?: string;
  department?: string;
  hospitalId?: string;
  bookedAt?: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function parseDateObject(dateStr: string, time12: string) {
  try {
    const [time, period] = time12.split(' ');
    const [h, m] = time.split(':').map(Number);
    const hours = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
    return new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`);
  } catch {
    return new Date(dateStr);
  }
}

function isUpcoming(dateStr: string, time: string) {
  try {
    const appointmentDate = parseDateObject(dateStr, time);
    return appointmentDate >= new Date();
  } catch {
    return true;
  }
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ql_appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored) as StoredAppointment[]);
      } catch {
        setAppointments([]);
      }
    }
  }, []);

  function removeAppointment(referenceId: string) {
    if (!window.confirm('Are you sure you want to cancel this appointment token?')) return;
    const updated = appointments.filter((a) => a.referenceId !== referenceId);
    setAppointments(updated);
    localStorage.setItem('ql_appointments', JSON.stringify(updated));
  }

  const upcoming = appointments.filter((a) => isUpcoming(a.date, a.time));
  const past = appointments.filter((a) => !isUpcoming(a.date, a.time));
  const displayName = user?.name || appointments[0]?.name || 'Patient Account';

  return (
    <div className="site-wrapper bg-[#fbfcfd] min-h-screen">
      <Navbar />

      <main className="page-container py-12 sm:py-16">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb">
            <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 font-medium">Patient Dashboard</span>
          </nav>

          {/* Page Title & Intro (Matching Hospitals near you style) */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5 mb-2">
              <CalendarCheck className="w-3.5 h-3.5" /> Care Management
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              My Consultations &amp; Tokens
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Track your confirmed hospital OPD tokens, view scheduled appointment windows, and manage clinical visit history.
            </p>
          </div>

          {/* Profile Card */}
          <div className="card p-8 sm:p-10 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
                  {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      Verified Patient
                    </span>
                    <span className="text-xs text-slate-400">Delhi-NCR Care Network</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{displayName}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {appointments.length} {appointments.length === 1 ? 'consultation token' : 'consultation tokens'} registered on this device
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link to="/hospitals" className="btn btn-primary py-3 px-5 text-xs font-semibold shadow-sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Book Consultation
                </Link>
                <Link to="/search" className="btn btn-secondary py-3 px-4 text-xs font-semibold">
                  Find Care
                </Link>
              </div>
            </div>
          </div>

          {/* Appointments Section */}
          {appointments.length === 0 ? (
            <div className="card py-24 px-8 text-center border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-blue-50/50">
                <CalendarX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                You haven’t scheduled any hospital OPD consultations. Explore hospitals in your area, compare live waiting times, and book a free digital token.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/hospitals" className="btn btn-primary py-3 px-6 text-sm font-semibold shadow-sm">
                  Browse Hospital Directory <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Upcoming Appointments */}
              {upcoming.length > 0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Upcoming Appointments</h3>
                    </div>
                    <span className="badge badge-green text-xs font-semibold py-1 px-3">
                      {upcoming.length} {upcoming.length === 1 ? 'Active Token' : 'Active Tokens'}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {upcoming.map((appt) => (
                      <AppointmentCard
                        key={appt.referenceId}
                        appt={appt}
                        onRemove={removeAppointment}
                        upcoming
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Visits */}
              {past.length > 0 && (
                <section className="space-y-6 pt-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">Past &amp; Completed Consultations</h3>
                    </div>
                    <span className="badge badge-gray text-xs font-medium py-1 px-3">
                      {past.length} History
                    </span>
                  </div>

                  <div className="space-y-6 opacity-85">
                    {past.map((appt) => (
                      <AppointmentCard
                        key={appt.referenceId}
                        appt={appt}
                        onRemove={removeAppointment}
                        upcoming={false}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function AppointmentCard({
  appt,
  onRemove,
  upcoming,
}: {
  appt: StoredAppointment;
  onRemove: (id: string) => void;
  upcoming: boolean;
}) {
  const hospital = appt.hospitalName || 'All India Institute of Medical Sciences (AIIMS)';
  const department = appt.department || 'General Medicine';
  const apptDate = new Date(appt.date);

  return (
    <div className={`card p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all ${
      upcoming ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-slate-300'
    }`}>
      <div className="space-y-6">
        {/* Top Line: Hospital Name, Badges, and Reference ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-blue text-[11px] font-semibold py-0.5 px-2.5">
                <Stethoscope className="w-3 h-3 mr-1" /> {department}
              </span>
              {upcoming ? (
                <span className="badge badge-green text-[11px] font-semibold py-0.5 px-2.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed OPD Token
                </span>
              ) : (
                <span className="badge badge-gray text-[11px] font-medium py-0.5 px-2.5">
                  Completed
                </span>
              )}
            </div>
            <h4 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 pt-1">
              <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
              <span>{hospital}</span>
            </h4>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              Ref: {appt.referenceId}
            </span>
          </div>
        </div>

        {/* Middle Line: Date, Time, and Patient Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-rose-600 uppercase leading-none">
                {apptDate.toLocaleDateString('en-IN', { month: 'short' })}
              </span>
              <span className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">
                {apptDate.toLocaleDateString('en-IN', { day: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 text-[11px]">Appointment Date</span>
              <strong className="text-slate-800 text-sm font-semibold">{formatDate(appt.date)}</strong>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 text-[11px]">Assigned Window</span>
              <strong className="text-blue-700 text-sm font-semibold">{appt.time}</strong>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5 text-[11px]">Patient Details</span>
              <span className="text-slate-800 font-semibold block">{appt.name}</span>
              <span className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {appt.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Reported Concerns (Properly spaced container) */}
        {appt.symptoms && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">Reported Symptoms &amp; Concerns:</span>
            <p className="text-slate-600 italic">&ldquo;{appt.symptoms}&rdquo;</p>
          </div>
        )}

        {/* Bottom Action Line */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Show token reference at hospital counter for priority queue slip.</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {appt.hospitalId && (
              <Link
                to={`/hospital/${appt.hospitalId}?department=${encodeURIComponent(department)}`}
                className="btn btn-secondary btn-sm text-xs font-semibold py-2 px-3.5 flex items-center gap-1.5"
              >
                <span>Hospital Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              type="button"
              title="Cancel Appointment"
              onClick={() => onRemove(appt.referenceId)}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
