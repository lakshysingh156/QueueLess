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
      <div className="site-wrapper bg-[#fbfcfd] min-h-screen">
        <Navbar />
        <main className="page-container py-16 sm:py-24 flex flex-col items-center">
          <div className="w-full max-w-xl mx-auto space-y-8">
            {/* Confirmation Pill */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100/90 text-emerald-600 mb-5 ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="badge badge-green text-xs mb-2">Confirmed Booking</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Appointment Scheduled</h1>
              <p className="mt-2 text-sm text-slate-600">
                Your consultation token is confirmed. An appointment slip has been filed in your patient dashboard.
              </p>
            </div>

            {/* Slip Card */}
            <div className="card shadow-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-7 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Booking Token</p>
                  <p className="text-3xl font-mono font-bold tracking-wider text-blue-400 mt-1">{booking.referenceId}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active OPD Slot
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{booking.hospitalName}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-700">{booking.department} Department</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 py-5 border-y border-slate-100 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Consultation Date</span>
                    <strong className="text-slate-900 font-bold">
                      {new Date(booking.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Assigned Window</span>
                    <strong className="text-blue-700 font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {booking.time}
                    </strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Patient Name</span>
                    <span className="text-slate-800 font-semibold">{booking.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Contact Number</span>
                    <span className="text-slate-800 font-semibold">{booking.phone}</span>
                  </div>
                </div>

                {booking.symptoms && (
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 block mb-1">Stated Symptoms &amp; Notes:</span>
                    <p className="text-slate-600 italic">&ldquo;{booking.symptoms}&rdquo;</p>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <Link to="/dashboard" className="btn btn-primary w-full sm:flex-1 py-3.5 text-center justify-center font-semibold text-sm">
                Go to My Appointments
              </Link>
              <Link
                to={`/hospital/${id}?department=${encodeURIComponent(department)}`}
                className="btn btn-secondary w-full sm:w-auto py-3.5 px-6 text-center justify-center font-semibold text-sm"
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
    <div className="site-wrapper bg-[#fbfcfd] min-h-screen">
      <Navbar />

      <main className="page-container py-12 sm:py-16">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Breadcrumb */}
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

          {/* Page Header (Spacious, matching Hospitals Page) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue text-xs font-semibold py-1 px-3">
                <Stethoscope className="w-3.5 h-3.5 mr-1" />
                {department}
              </span>
              <span className="badge badge-green text-xs font-medium">Online OPD Queue Booking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{hospitalName}</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Schedule your outpatient consultation slot to minimize on-site waiting. Your details are reserved directly in the care workflow.
            </p>
          </div>

          {/* Main Grid: Form + Sticky Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Form: 7 cols */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
              {/* Section 1: Patient Information */}
              <div className="card p-8 sm:p-10 space-y-6 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Patient Details</h2>
                      <p className="text-xs text-slate-500">Who is this consultation for?</p>
                    </div>
                  </div>
                  <User className="w-5 h-5 text-slate-400" />
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="book-name" className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Full Name <span className="text-rose-500">*</span>
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
                        className="input input-search py-3.5 text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="book-phone" className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Mobile Phone Number <span className="text-rose-500">*</span>
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
                        className="input input-search py-3.5 text-sm rounded-xl"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">Used for booking SMS alerts &amp; OPD queue check-in.</span>
                  </div>

                  <div>
                    <label htmlFor="book-symptoms" className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Symptoms or Reason for Visit <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <textarea
                      id="book-symptoms"
                      rows={3}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Briefly describe your symptoms (e.g. persistent fever for 3 days, joint pain...)"
                      className="input py-3 px-4 text-sm rounded-xl resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Date & Slot Selection */}
              <div className="card p-8 sm:p-10 space-y-6 border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Select Date &amp; Time Window</h2>
                      <p className="text-xs text-slate-500">Choose when you plan to visit</p>
                    </div>
                  </div>
                  <CalendarCheck className="w-5 h-5 text-slate-400" />
                </div>

                <div>
                  <label htmlFor="book-date" className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Consultation Date
                  </label>
                  <input
                    id="book-date"
                    type="date"
                    required
                    min={getTomorrowDate()}
                    max={getMaxDate()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input py-3.5 px-4 text-sm rounded-xl w-full"
                  />
                </div>

                {/* Morning Slots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Morning Sessions (9 AM – 1 PM)
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Standard OPD</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {MORNING_SLOTS.map((slot) => {
                      const isSelected = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => { setTime(slot); setError(''); }}
                          className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all duration-150 text-center ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> Afternoon Sessions (2 PM – 6 PM)
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">Shorter Queue Windows</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AFTERNOON_SLOTS.map((slot) => {
                      const isSelected = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => { setTime(slot); setError(''); }}
                          className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all duration-150 text-center ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Submit Bar */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-secondary py-3.5 px-6 text-sm font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 py-3.5 px-6 text-sm font-semibold justify-center shadow-md shadow-blue-500/20"
                >
                  {isSubmitting ? 'Reserving Token…' : 'Confirm Consultation Booking'}
                  {!isSubmitting && <CalendarCheck className="w-4 h-4 ml-2" />}
                </button>
              </div>
            </form>

            {/* Right Column: 5 cols Sticky Overview */}
            <aside className="lg:col-span-5 sticky top-24 space-y-6">
              <div className="card p-8 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{hospitalName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Delhi-NCR Regional Directory
                    </p>
                  </div>
                </div>

                {/* Department details */}
                <div className="rounded-xl bg-slate-50 p-5 border border-slate-100 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Department:</span>
                    <strong className="text-slate-900 font-bold">{department}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Consultation Date:</span>
                    <strong className="text-slate-900 font-bold">
                      {date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Selected Window:</span>
                    <strong className={time ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                      {time || 'Select a time slot'}
                    </strong>
                  </div>
                </div>

                {/* Summary Points */}
                <div className="space-y-3.5 pt-2 text-xs text-slate-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Instant digital token generation with zero registration fee.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Real-time queue tracking enabled on the day of visit.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>Government scheme (Ayushman Bharat / DAK) eligibility verified on arrival.</span>
                  </div>
                </div>

                {/* Security note */}
                <div className="pt-5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
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
