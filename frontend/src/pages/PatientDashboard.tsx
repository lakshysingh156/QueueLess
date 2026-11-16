import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  CalendarX,
  ChevronRight,
  Clock,
  Trash2,
  UserRound,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../useAuth';

interface Appointment {
  name: string;
  phone: string;
  date: string;
  time: string;
  symptoms: string;
  referenceId: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isUpcoming(dateStr: string, time: string) {
  const appointmentDate = new Date(`${dateStr}T${convertTo24(time)}`);
  return appointmentDate >= new Date();
}

function convertTo24(time12: string) {
  const [time, period] = time12.split(' ');
  const [h, m] = time.split(':').map(Number);
  const hours = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ql_appointments');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored) as Appointment[]);
      } catch {
        setAppointments([]);
      }
    }
  }, []);

  function removeAppointment(referenceId: string) {
    const updated = appointments.filter((a) => a.referenceId !== referenceId);
    setAppointments(updated);
    localStorage.setItem('ql_appointments', JSON.stringify(updated));
  }

  const upcoming = appointments.filter((a) => isUpcoming(a.date, a.time));
  const past = appointments.filter((a) => !isUpcoming(a.date, a.time));

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="workspace-main">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium">My appointments</span>
        </nav>

        {/* Profile header */}
        <div className="card mb-6 p-6 flex items-center gap-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 shrink-0">
            <UserRound className="w-7 h-7 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Patient account</p>
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {user?.name ?? appointments[0]?.name ?? 'Your account'}
            </h1>
            <p className="text-xs text-slate-500">
              {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} on record
            </p>
          </div>
          <Link to="/hospitals" className="btn btn-secondary btn-sm ml-auto shrink-0">
            Find a hospital <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="card py-16 text-center">
            <CalendarX className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-slate-900 mb-1">No appointments yet</h2>
            <p className="text-sm text-slate-500 mb-6">
              Book an appointment from any hospital's detail page.
            </p>
            <Link to="/hospitals" className="btn btn-primary btn-sm mx-auto">
              Browse hospitals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-slate-900">Upcoming appointments</h2>
                  <span className="ml-auto badge badge-green text-[10px]">{upcoming.length}</span>
                </div>
                <div className="space-y-3">
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

            {/* Past */}
            {past.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-700">Past appointments</h2>
                  <span className="ml-auto badge badge-gray text-[10px]">{past.length}</span>
                </div>
                <div className="space-y-3 opacity-75">
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
  appt: Appointment;
  onRemove: (id: string) => void;
  upcoming: boolean;
}) {
  return (
    <div className={`card p-5 flex gap-4 items-start ${upcoming ? 'border-l-2 border-l-emerald-500' : ''}`}>
      <div className="shrink-0 flex flex-col items-center pt-0.5">
        <span className="text-xs font-bold text-slate-800">
          {new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
        </span>
        <span className="text-[11px] text-slate-400">{appt.time}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-900 truncate">{appt.name}</p>
          <span className="shrink-0 text-[10px] font-mono text-slate-400">{appt.referenceId}</span>
        </div>
        <p className="text-xs text-slate-500 mb-0.5">{appt.phone}</p>
        {appt.symptoms && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{appt.symptoms}</p>
        )}
        <p className="text-[11px] text-slate-400 mt-2">
          {formatDate(appt.date)}
        </p>
      </div>

      <button
        type="button"
        title="Remove appointment"
        onClick={() => onRemove(appt.referenceId)}
        className="shrink-0 p-1.5 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
