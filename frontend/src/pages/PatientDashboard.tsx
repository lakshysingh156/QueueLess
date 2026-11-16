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

      <main className="page-container py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb mb-8">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium">Patient Dashboard</span>
        </nav>

        {/* Profile Card */}
        <div className="card p-6 sm:p-8 mb-10 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
                {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    Registered Patient
                  </span>
                  <span className="text-xs text-slate-400">Delhi-NCR</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{displayName}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  {appointments.length} {appointments.length === 1 ? 'consultation token' : 'consultation tokens'} registered on this device
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/hospitals" className="btn btn-primary py-2.5 px-5 text-xs font-semibold shadow-sm">
                <Plus className="w-4 h-4 mr-1.5" /> Book New Consultation
              </Link>
              <Link to="/search" className="btn btn-secondary py-2.5 px-4 text-xs font-semibold">
                Find Care
              </Link>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        {appointments.length === 0 ? (
          <div className="card py-20 px-8 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-blue-50/50">
              <CalendarX className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Appointments Yet</h2>
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
          <div className="space-y-10">
            {/* Upcoming Appointments */}
            {upcoming.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Upcoming Appointments</h2>
                  </div>
                  <span className="badge badge-green text-xs font-semibold py-0.5 px-2.5">
                    {upcoming.length} {upcoming.length === 1 ? 'Active Token' : 'Active Tokens'}
                  </span>
                </div>

                <div className="space-y-4">
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
              <section className="space-y-4 pt-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-700">Past &amp; Completed Consultations</h2>
                  </div>
                  <span className="badge badge-gray text-xs font-medium py-0.5 px-2.5">
                    {past.length} History
                  </span>
                </div>

                <div className="space-y-4 opacity-80">
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
    <div className={`card p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all ${
      upcoming ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-slate-300'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Date Block + Hospital & Dept details */}
        <div className="flex items-start gap-5">
          {/* Calendar Badge */}
          <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 shrink-0 text-center">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              {apptDate.toLocaleDateString('en-IN', { month: 'short' })}
            </span>
            <span className="text-xl font-extrabold text-slate-900 leading-none my-0.5">
              {apptDate.toLocaleDateString('en-IN', { day: 'numeric' })}
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              {apptDate.toLocaleDateString('en-IN', { weekday: 'short' })}
            </span>
          </div>

          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-blue text-[11px] font-semibold py-0.5 px-2.5">
                <Stethoscope className="w-3 h-3 mr-1" /> {department}
              </span>
              {upcoming ? (
                <span className="badge badge-green text-[11px] font-semibold py-0.5 px-2.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed OPD
                </span>
              ) : (
                <span className="badge badge-gray text-[11px] font-medium py-0.5 px-2.5">
                  Completed
                </span>
              )}
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Token: {appt.referenceId}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
              <span>{hospital}</span>
            </h3>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {appt.time}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {formatDate(appt.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {appt.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {appt.phone}
              </span>
            </div>

            {appt.symptoms && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 max-w-xl">
                <strong className="text-slate-700">Reported Concerns:</strong> {appt.symptoms}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 self-end lg:self-center shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto justify-end">
          {appt.hospitalId && (
            <Link
              to={`/hospital/${appt.hospitalId}?department=${encodeURIComponent(department)}`}
              className="btn btn-secondary btn-sm text-xs font-semibold py-2 px-3.5 flex items-center gap-1.5"
            >
              <span>Hospital Details</span>
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
  );
}
