import { useState, type FormEvent } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Time slots across the day
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
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

interface BookingData {
  name: string;
  phone: string;
  date: string;
  time: string;
  symptoms: string;
  referenceId: string;
}

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const department = params.get('department') || 'General Medicine';
  const hospitalName = params.get('hospital') || 'the hospital';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(getTomorrowDate());
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!time) {
      setError('Please select a time slot.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Simulate a brief API call
    setTimeout(() => {
      const refId = `QL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const bookingData: BookingData = {
        name,
        phone,
        date,
        time,
        symptoms,
        referenceId: refId,
      };

      // Persist to localStorage
      const existing: BookingData[] = JSON.parse(
        localStorage.getItem('ql_appointments') || '[]',
      );
      existing.push({ ...bookingData, name, phone });
      localStorage.setItem('ql_appointments', JSON.stringify(existing));

      setBooking(bookingData);
      setIsSubmitting(false);
    }, 900);
  }

  if (booking) {
    return (
      <div className="site-wrapper bg-[#fbfcfd]">
        <Navbar />
        <main className="page-container flex-1 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-6">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Appointment confirmed</h1>
            <p className="text-sm text-slate-500 mb-8">
              A summary has been saved to your appointments.
            </p>

            <div className="card text-left divide-y divide-slate-100 mb-6">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Booking reference</p>
                <p className="text-xl font-bold text-blue-700 tracking-wide">{booking.referenceId}</p>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Patient</p>
                  <p className="font-medium text-slate-800">{booking.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Contact</p>
                  <p className="font-medium text-slate-800">{booking.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Date</p>
                  <p className="font-medium text-slate-800">
                    {new Date(booking.date).toLocaleDateString('en-IN', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Time</p>
                  <p className="font-medium text-slate-800">{booking.time}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 mb-0.5">Department</p>
                  <p className="font-medium text-slate-800">{department}</p>
                </div>
                {booking.symptoms && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-0.5">Notes</p>
                    <p className="font-medium text-slate-800">{booking.symptoms}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard" className="btn btn-primary">
                View my appointments
              </Link>
              <Link to={`/hospital/${id}?department=${encodeURIComponent(department)}`} className="btn btn-secondary">
                Back to hospital
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="workspace-main">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            to={`/hospital/${id}?department=${encodeURIComponent(department)}`}
            className="hover:text-slate-700 transition-colors"
          >
            {hospitalName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium">Book appointment</span>
        </nav>

        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <span className="section-overline">APPOINTMENT BOOKING</span>
            <h1 className="text-2xl font-semibold text-slate-900 mt-1 mb-1">{hospitalName}</h1>
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{department}</span> department
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient info */}
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-900">Patient information</h2>

              <div>
                <label htmlFor="book-name" className="block text-xs font-medium text-slate-600 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="book-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter patient name"
                    className="input input-search"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="book-phone" className="block text-xs font-medium text-slate-600 mb-1.5">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="book-phone"
                    type="tel"
                    required
                    pattern="[0-9+\-\s]{7,15}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input input-search"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="book-symptoms" className="block text-xs font-medium text-slate-600 mb-1.5">
                  Brief description of concern <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="book-symptoms"
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. knee pain for 3 weeks, follow-up after surgery…"
                  className="input resize-none py-2.5"
                />
              </div>
            </div>

            {/* Date & time */}
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-slate-900">Choose a date and time</h2>

              <div>
                <label htmlFor="book-date" className="block text-xs font-medium text-slate-600 mb-1.5">
                  <CalendarCheck className="inline w-3.5 h-3.5 mr-1 text-slate-400" />
                  Preferred date
                </label>
                <input
                  id="book-date"
                  type="date"
                  required
                  min={getTomorrowDate()}
                  max={getMaxDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input py-2.5"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-2.5">
                  <Clock className="inline w-3.5 h-3.5 mr-1 text-slate-400" />
                  Available time slots
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => { setTime(slot); setError(''); }}
                      className={`text-xs font-medium py-2 px-3 rounded-lg border transition-all text-center ${
                        time === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
              </div>
            </div>

            {/* Summary */}
            {time && (
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-0.5">Appointment summary</p>
                  <p>
                    {department} · {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {time}
                  </p>
                  <p className="text-blue-600 mt-0.5">{hospitalName}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-1"
              >
                {isSubmitting ? 'Booking…' : 'Confirm appointment'}
                {!isSubmitting && <CalendarCheck className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
