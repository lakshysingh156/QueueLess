import { useState, type FormEvent } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../useAuth';

const MORNING_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
];

const AFTERNOON_SLOTS = [
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getMaxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export interface StoredAppointment {
  referenceId: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  symptoms: string;
  hospitalName: string;
  department: string;
  hospitalId: string;
  bookedAt: string;
}

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const department = params.get('department') || 'General Medicine';
  const hospitalName = params.get('hospital') || 'All India Institute of Medical Sciences (AIIMS)';

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(getTomorrowDate());
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<StoredAppointment | null>(null);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!time) {
      setError('Please select a preferred consultation time window.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const refId = `QL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const appointment: StoredAppointment = {
        referenceId: refId,
        name: name.trim(),
        phone: phone.trim(),
        date,
        time,
        symptoms: symptoms.trim(),
        hospitalName,
        department,
        hospitalId: id || '1',
        bookedAt: new Date().toISOString(),
      };

      const existing: StoredAppointment[] = JSON.parse(
        localStorage.getItem('ql_appointments') || '[]',
      );
      existing.unshift(appointment);
      localStorage.setItem('ql_appointments', JSON.stringify(existing));

      setBooking(appointment);
      setIsSubmitting(false);
    }, 700);
  }

  if (booking) {
    return (
      <div className="site-wrapper workspace-page booking-workspace">
        <Navbar />
        <main className="workspace-main booking-page booking-confirmation-page">
          <div className="booking-confirmation-content">
            <div className="booking-confirmation-heading">
              <div className="booking-confirmation-icon">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="badge badge-green text-xs mb-2">Confirmed Booking</span>
              <h1>Appointment Scheduled</h1>
              <p>
                Your consultation token is confirmed. An appointment slip has been filed in your patient dashboard.
              </p>
            </div>

            <div className="card booking-slip">
              <div className="booking-slip-header">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Booking Token</p>
                  <p className="text-3xl font-mono font-bold tracking-wider text-blue-400 mt-1">{booking.referenceId}</p>
                </div>
                <div className="text-right">
                  <span className="booking-slip-status">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active OPD Slot
                  </span>
                </div>
              </div>

              <div className="booking-slip-body">
                <div className="booking-slip-hospital">
                  <h2>{booking.hospitalName}</h2>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-700">{booking.department} Department</span>
                  </div>
                </div>

                <div className="booking-slip-details">
                  <div className="booking-slip-detail">
                    <span>Consultation Date</span>
                    <strong className="text-slate-900 font-bold">
                      {new Date(booking.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div className="booking-slip-detail">
                    <span>Assigned Window</span>
                    <strong className="text-blue-700 font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {booking.time}
                    </strong>
                  </div>
                  <div className="booking-slip-detail">
                    <span>Patient Name</span>
                    <span className="text-slate-800 font-semibold">{booking.name}</span>
                  </div>
                  <div className="booking-slip-detail">
                    <span>Contact Number</span>
                    <span className="text-slate-800 font-semibold">{booking.phone}</span>
                  </div>
                </div>

                {booking.symptoms && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">Stated Symptoms &amp; Notes:</span>
                    <p className="text-slate-600 italic">&ldquo;{booking.symptoms}&rdquo;</p>
                  </div>
                )}

                <div className="booking-slip-instructions">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Patient OPD Instructions</p>
                    <p className="text-blue-700 mt-1 leading-relaxed">
                      Please arrive 15 minutes prior to your time window. Show this booking reference at the registration desk for expedited token queue processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="booking-confirmation-actions">
              <Link to="/dashboard" className="btn btn-primary">
                Go to My Appointments
              </Link>
              <Link
                to={`/hospital/${id}?department=${encodeURIComponent(department)}`}
                className="btn btn-secondary"
              >
                Return to Hospital
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site-wrapper workspace-page booking-workspace">
      <Navbar />

      <main className="workspace-main booking-page">
        <div className="booking-content">
          <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb">
            <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link
              to={`/hospital/${id}?department=${encodeURIComponent(department)}`}
              className="hover:text-slate-700 transition-colors truncate max-w-xs"
            >
              {hospitalName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 font-medium">Book Appointment</span>
          </nav>

          <header className="booking-heading">
            <div className="booking-heading-badges">
              <span className="badge badge-blue text-xs font-semibold py-1 px-3">
                <Stethoscope className="w-3.5 h-3.5 mr-1" />
                {department}
              </span>
              <span className="badge badge-green text-xs font-medium">Online OPD booking</span>
            </div>
            <h1>{hospitalName}</h1>
            <p>
              Schedule your outpatient consultation slot to minimize on-site waiting. Your details are reserved directly in the care workflow.
            </p>
          </header>

          <div className="booking-layout">
            <form onSubmit={handleSubmit} className="booking-form">
              <section className="card booking-section">
                <div className="booking-section-header">
                  <div className="booking-section-title">
                    <span>
                      1
                    </span>
                    <div>
                      <h2>Patient details</h2>
                      <p>Who is this consultation for?</p>
                    </div>
                  </div>
                  <User className="w-5 h-5 text-slate-400" />
                </div>

                <div className="booking-form-fields">
                  <div className="booking-form-field">
                    <label htmlFor="book-name">
                      Full name <span>*</span>
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="book-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Virat Kohli"
                        className="input input-search"
                      />
                    </div>
                  </div>

                  <div className="booking-form-field">
                    <label htmlFor="book-phone">
                      Mobile phone number <span>*</span>
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="book-phone"
                        type="tel"
                        required
                        pattern="[0-9+\-\s]{8,15}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="input input-search"
                      />
                    </div>
                    <span>Used for booking alerts and OPD queue check-in.</span>
                  </div>

                  <div className="booking-form-field">
                    <label htmlFor="book-symptoms">
                      Symptoms or reason for visit <span className="booking-optional">(optional)</span>
                    </label>
                    <textarea
                      id="book-symptoms"
                      rows={3}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Briefly describe your symptoms (e.g. persistent fever for 3 days, joint pain...)"
                      className="input"
                    />
                  </div>
                </div>
              </section>

              <section className="card booking-section">
                <div className="booking-section-header">
                  <div className="booking-section-title">
                    <span>
                      2
                    </span>
                    <div>
                      <h2>Select date &amp; time</h2>
                      <p>Choose when you plan to visit.</p>
                    </div>
                  </div>
                  <CalendarCheck className="w-5 h-5 text-slate-400" />
                </div>

                <div className="booking-form-field">
                  <label htmlFor="book-date">
                    Consultation date
                  </label>
                  <input
                    id="book-date"
                    type="date"
                    required
                    min={getTomorrowDate()}
                    max={getMaxDate()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="booking-slot-group">
                  <div className="booking-slot-heading">
                    <span>
                      <Sparkles className="w-4 h-4 text-amber-500" /> Morning sessions
                    </span>
                    <small>9 AM – 1 PM</small>
                  </div>
                  <div className="booking-slot-grid">
                    {MORNING_SLOTS.map((slot) => {
                      const isSelected = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => { setTime(slot); setError(''); }}
                          className={`booking-slot${isSelected ? ' is-selected' : ''}`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="booking-slot-group">
                  <div className="booking-slot-heading">
                    <span>
                      <Clock className="w-4 h-4 text-blue-500" /> Afternoon sessions
                    </span>
                    <small>2 PM – 6 PM</small>
                  </div>
                  <div className="booking-slot-grid">
                    {AFTERNOON_SLOTS.map((slot) => {
                      const isSelected = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => { setTime(slot); setError(''); }}
                          className={`booking-slot${isSelected ? ' is-selected' : ''}`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="booking-error" role="alert">
                    {error}
                  </div>
                )}
              </section>

              <div className="booking-form-actions">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Reserving Token…' : 'Confirm Consultation Booking'}
                  {!isSubmitting && <CalendarCheck className="w-4 h-4 ml-2" />}
                </button>
              </div>
            </form>

            <aside className="booking-summary">
              <div className="card booking-summary-card">
                <div className="booking-summary-hospital">
                  <div>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2>{hospitalName}</h2>
                    <p>
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Delhi-NCR Regional Directory
                    </p>
                  </div>
                </div>

                <div className="booking-summary-details">
                  <div className="booking-summary-row">
                    <span>Department</span>
                    <strong>{department}</strong>
                  </div>
                  <div className="booking-summary-row">
                    <span>Consultation date</span>
                    <strong>
                      {date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </strong>
                  </div>
                  <div className="booking-summary-row">
                    <span>Selected window</span>
                    <strong className={time ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                      {time || 'Select a time slot'}
                    </strong>
                  </div>
                </div>

                <div className="booking-summary-points">
                  <div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant digital token generation with zero registration fee.</span>
                  </div>
                  <div>
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Real-time queue tracking enabled on the day of visit.</span>
                  </div>
                  <div>
                    <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>Government scheme (Ayushman Bharat / DAK) eligibility verified on arrival.</span>
                  </div>
                </div>

                <div className="booking-summary-security">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Your contact details are encrypted and kept strictly confidential.</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
