import { useState } from 'react';
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
  const [appointments, setAppointments] = useState<StoredAppointment[]>(() => {
    const stored = localStorage.getItem('ql_appointments');
    if (!stored) return [];

    try {
      return JSON.parse(stored) as StoredAppointment[];
    } catch {
      return [];
    }
  });

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
    <div className="site-wrapper workspace-page">
      <Navbar />

      <main className="workspace-main patient-dashboard-page">
        <div className="patient-dashboard-content">
          <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb">
            <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 font-medium">Patient Dashboard</span>
          </nav>

          <header className="patient-dashboard-heading">
            <span className="page-kicker">
              <CalendarCheck aria-hidden="true" /> Care management
            </span>
            <h1>My consultations and tokens</h1>
            <p>
              Track confirmed OPD tokens, view appointment windows, and manage visit history.
            </p>
          </header>

          <section className="card patient-profile-card" aria-label="Patient profile">
            <div className="patient-profile-identity">
              <div className="patient-profile-avatar">
                  {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="patient-profile-copy">
                <div className="patient-profile-meta">
                  <span className="badge badge-blue">Verified patient</span>
                  <span>Delhi-NCR Care Network</span>
                </div>
                <h2>{displayName}</h2>
                <p>
                  {appointments.length} {appointments.length === 1 ? 'consultation token' : 'consultation tokens'} registered on this device
                </p>
              </div>
            </div>

            <div className="patient-profile-actions">
              <Link to="/hospitals" className="btn btn-primary">
                <Plus className="w-4 h-4" /> Book consultation
              </Link>
              <Link to="/search" className="btn btn-secondary">
                Find care
              </Link>
            </div>
          </section>

          {appointments.length === 0 ? (
            <section className="card patient-empty-state">
              <div className="patient-empty-icon">
                <CalendarX className="w-8 h-8" />
              </div>
              <h2>No appointments yet</h2>
              <p>
                You haven’t scheduled any hospital OPD consultations. Explore nearby hospitals, compare waiting estimates, and reserve a digital token.
              </p>
              <Link to="/hospitals" className="btn btn-primary">
                Browse hospital directory <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          ) : (
            <div className="patient-appointment-sections">
              {upcoming.length > 0 && (
                <section className="patient-appointment-section">
                  <div className="patient-section-heading">
                    <div>
                      <span className="patient-section-icon patient-section-icon-upcoming">
                        <CalendarCheck className="w-4 h-4" />
                      </span>
                      <h2>Upcoming appointments</h2>
                    </div>
                    <span className="badge badge-green">
                      {upcoming.length} {upcoming.length === 1 ? 'Active Token' : 'Active Tokens'}
                    </span>
                  </div>

                  <div className="patient-appointment-list">
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

              {past.length > 0 && (
                <section className="patient-appointment-section patient-past-section">
                  <div className="patient-section-heading">
                    <div>
                      <span className="patient-section-icon patient-section-icon-past">
                        <Clock className="w-4 h-4" />
                      </span>
                      <h2>Past consultations</h2>
                    </div>
                    <span className="badge badge-gray">
                      {past.length} {past.length === 1 ? 'visit' : 'visits'}
                    </span>
                  </div>

                  <div className="patient-appointment-list">
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
    <article className={`card patient-appointment-card ${
      upcoming ? 'is-upcoming' : 'is-completed'
    }`}>
      <div className="patient-appointment-card-content">
        <div className="patient-appointment-card-header">
          <div className="patient-appointment-card-title">
            <div className="patient-appointment-badges">
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
            <h3 className="patient-appointment-hospital">
              <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
              <span>{hospital}</span>
            </h3>
          </div>

          <span className="patient-appointment-reference">
              Ref: {appt.referenceId}
          </span>
        </div>

        <div className="patient-appointment-details">
          <div className="patient-appointment-detail">
            <div className="patient-appointment-detail-icon patient-date-icon">
              <span className="text-[9px] font-bold text-rose-600 uppercase leading-none">
                {apptDate.toLocaleDateString('en-IN', { month: 'short' })}
              </span>
              <span className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">
                {apptDate.toLocaleDateString('en-IN', { day: 'numeric' })}
              </span>
            </div>
            <div className="patient-appointment-detail-copy">
              <span className="patient-appointment-detail-label">Appointment date</span>
              <strong className="text-slate-800 text-sm font-semibold">{formatDate(appt.date)}</strong>
            </div>
          </div>

          <div className="patient-appointment-detail">
            <div className="patient-appointment-detail-icon">
              <Clock className="w-5 h-5" />
            </div>
            <div className="patient-appointment-detail-copy">
              <span className="patient-appointment-detail-label">Assigned window</span>
              <strong className="text-blue-700 text-sm font-semibold">{appt.time}</strong>
            </div>
          </div>

          <div className="patient-appointment-detail">
            <div className="patient-appointment-detail-icon patient-patient-icon">
              <User className="w-5 h-5" />
            </div>
            <div className="patient-appointment-detail-copy">
              <span className="patient-appointment-detail-label">Patient details</span>
              <span className="text-slate-800 font-semibold block">{appt.name}</span>
              <span className="patient-appointment-phone">
                <Phone className="w-3 h-3" /> {appt.phone}
              </span>
            </div>
          </div>
        </div>

        {appt.symptoms && (
          <div className="patient-appointment-concerns">
            <span>Reported symptoms and concerns</span>
            <p className="text-slate-600 italic">&ldquo;{appt.symptoms}&rdquo;</p>
          </div>
        )}

        <div className="patient-appointment-footer">
          <div className="patient-appointment-note">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Show token reference at hospital counter for priority queue slip.</span>
          </div>

          <div className="patient-appointment-actions">
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
              aria-label={`Cancel appointment ${appt.referenceId}`}
              onClick={() => onRemove(appt.referenceId)}
              className="patient-cancel-button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
