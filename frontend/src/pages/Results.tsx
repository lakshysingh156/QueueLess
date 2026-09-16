import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Clock, DollarSign, ChevronRight, ArrowUpDown,
  Loader2, AlertTriangle, SlidersHorizontal, CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchHospitals } from '../api';
import type { SearchResponse, SearchResult } from '../types';

type SortKey = 'rank' | 'distance_km' | 'estimated_wait_min' | 'consultation_fee_min';

export default function Results() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const symptom = params.get('symptom') || '';

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');

  useEffect(() => {
    if (!symptom) return;
    setLoading(true);
    setError('');
    searchHospitals(symptom)
      .then(setData)
      .catch(() => setError('Could not load results. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [symptom]);

  const sorted = [...(data?.results ?? [])].sort((a, b) => {
    if (sortKey === 'consultation_fee_min') {
      return (a.consultation_fee_min ?? 9999) - (b.consultation_fee_min ?? 9999);
    }
    return (a[sortKey] as number) - (b[sortKey] as number);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link to="/" className="hover:text-slate-700">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-medium">Results</span>
          </div>
          {data && (
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">
                {data.routed_department}
                {data.is_emergency && (
                  <span className="ml-2 text-xs font-semibold text-white bg-rose-600 px-2 py-0.5 rounded-full align-middle">
                    EMERGENCY
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500">
                Showing hospitals for "<span className="italic">{symptom}</span>" — {sorted.length} results
              </p>
            </div>
          )}
        </div>

        {/* Sort bar */}
        {data && !loading && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 mr-1">Sort by:</span>
            {([
              ['rank', 'Recommended'],
              ['distance_km', 'Distance'],
              ['estimated_wait_min', 'Wait time'],
              ['consultation_fee_min', 'Cost'],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  sortKey === key
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                }`}
              >
                <ArrowUpDown className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Finding hospitals…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">No hospitals found. Try a different symptom.</p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((r) => (
              <HospitalCard key={r.hospital_id} result={r} onClick={() =>
                navigate(`/hospital/${r.hospital_id}?department=${encodeURIComponent(r.department)}`)
              } />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function HospitalCard({ result: r, onClick }: { result: SearchResult; onClick: () => void }) {
  const isHighWait = r.estimated_wait_min > 60;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {/* Rank badge */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
            r.rank === 1 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {r.rank}
          </div>

          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                {r.hospital_name}
              </h3>
              {r.rank === 1 && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Recommended
                </span>
              )}
              {r.emergency_available && (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Emergency
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" /> {r.address}, {r.city}
            </p>

            {/* Explanation */}
            <p className="text-xs text-slate-600 italic mb-3 leading-relaxed">{r.explanation}</p>

            {/* Metrics row */}
            <div className="flex flex-wrap gap-4">
              <Metric icon={MapPin} label="Distance" value={`${r.distance_km.toFixed(1)} km`} />
              <Metric
                icon={Clock}
                label="Est. wait"
                value={`${r.estimated_wait_min} min`}
                highlight={isHighWait ? 'warn' : undefined}
              />
              <Metric
                icon={DollarSign}
                label="Consult fee"
                value={
                  r.consultation_fee_min != null
                    ? `₹${r.consultation_fee_min}–${r.consultation_fee_max}`
                    : 'N/A'
                }
              />
              <Metric icon={Clock} label="Queue" value={`${r.current_queue} people`} />
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: 'warn';
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${highlight === 'warn' ? 'text-amber-500' : 'text-slate-400'}`} />
      <span className="text-xs text-slate-500">{label}:</span>
      <span className={`text-xs font-medium ${highlight === 'warn' ? 'text-amber-700' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
