import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  IndianRupee,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  Search,
  RotateCcw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
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
  const [filterEmergency, setFilterEmergency] = useState(false);

  const fetchResults = useCallback(() => {
    if (!symptom) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    searchHospitals(symptom)
      .then(setData)
      .catch(() => {
        setError('Could not connect to the hospital service. Please verify the backend is running.');
      })
      .finally(() => setLoading(false));
  }, [symptom]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const filtered = (data?.results ?? []).filter((r) => !filterEmergency || r.emergency_available);
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'consultation_fee_min') {
      return (a.consultation_fee_min ?? 9999) - (b.consultation_fee_min ?? 9999);
    }
    return (a[sortKey] as number) - (b[sortKey] as number);
  });

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="flex-1 page-container max-w-6xl py-16 sm:py-20 pb-28">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/search" className="hover:text-slate-700 transition-colors">Search</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium">{data?.routed_department || 'Results'}</span>
        </nav>

        {/* Search Header */}
        {data && !loading && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge badge-blue">{data.routed_department}</span>
                {data.is_emergency && (
                  <span className="badge badge-red font-semibold">Emergency Priority</span>
                )}
                <span className="text-sm text-slate-400">Results for &ldquo;{symptom}&rdquo;</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                Hospital Recommendations
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Showing {sorted.length} hospitals ranked by wait time, distance, and consultation fees.
              </p>
            </div>

            <Link to="/search" className="btn btn-secondary btn-sm self-start sm:self-auto px-3.5 py-2">
              <Search className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Change Search
            </Link>
          </div>
        )}

        {/* Filter and Sort Pills */}
        {data && !loading && sorted.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1.5 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> Sort by:
              </span>
              {(
                [
                  ['rank', 'Recommended'],
                  ['estimated_wait_min', 'Shortest Wait'],
                  ['distance_km', 'Closest Distance'],
                  ['consultation_fee_min', 'Lowest Fee'],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortKey(key)}
                  className={`btn btn-sm ${
                    sortKey === key ? 'btn-primary' : 'btn-secondary text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFilterEmergency((prev) => !prev)}
              className={`btn btn-sm ${
                filterEmergency ? 'btn-danger' : 'btn-secondary text-slate-600'
              }`}
            >
              Emergency Ready Only
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="spinner mb-4" />
            <p className="text-sm font-medium text-slate-700">Searching hospital queues...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card p-8 bg-rose-50/50 border-rose-200 max-w-lg mx-auto my-12 text-center">
            <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-rose-900 mb-1">Failed to load results</h2>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <button type="button" onClick={fetchResults} className="btn btn-secondary btn-sm mx-auto">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sorted.length === 0 && (
          <div className="card p-12 text-center max-w-md mx-auto my-12">
            <Search className="w-6 h-6 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-900 mb-1">No hospitals found</h2>
            <p className="text-xs text-slate-500 mb-5">
              No matching departments were found for &ldquo;{symptom}&rdquo;. Try another symptom like fever, knee pain, or chest pain.
            </p>
            <Link to="/search" className="btn btn-primary btn-sm">
              Browse Departments
            </Link>
          </div>
        )}

        {/* Defined, High-Quality Hospital Cards */}
        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-6">
            {sorted.map((item) => (
              <HospitalCard
                key={item.hospital_id}
                result={item}
                onClick={() =>
                  navigate(
                    `/hospital/${item.hospital_id}?department=${encodeURIComponent(item.department)}`
                  )
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function HospitalCard({ result: r, onClick }: { result: SearchResult; onClick: () => void }) {
  const isTopRanked = r.rank === 1;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      className={`result-card card card-hover cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all bg-white ${
        isTopRanked ? 'result-card-featured' : ''
      }`}
    >
      <div className="result-card-layout">
        <div className="result-card-info">
          <div className="result-card-title">
            <span className={`result-rank ${isTopRanked ? 'result-rank-featured' : ''}`}>
              {String(r.rank).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3>{r.hospital_name}</h3>
              <p className="result-card-address">
                <MapPin aria-hidden="true" />
                <span>{r.address}, {r.city}</span>
              </p>
            </div>
          </div>
          <div className="result-card-badges">
            {isTopRanked && <span className="badge badge-blue">Recommended</span>}
            <span className="badge badge-gray">{r.department}</span>
            {r.emergency_available && <span className="badge badge-red">24/7 Emergency</span>}
          </div>
        </div>

        <div className="result-card-metrics">
          <div className="result-metric result-metric-wait">
            <Clock aria-hidden="true" />
            <span>Estimated wait</span>
            <strong>{r.estimated_wait_min} <small>min</small></strong>
          </div>
          <div className="result-metric">
            <MapPin aria-hidden="true" />
            <span>Distance</span>
            <strong>{r.distance_km.toFixed(1)} <small>km</small></strong>
          </div>
          <div className="result-metric">
            <IndianRupee aria-hidden="true" />
            <span>Consultation fee</span>
            <strong>
              {r.consultation_fee_min ?? 0}–{r.consultation_fee_max ?? 0}
            </strong>
          </div>
        </div>

        <div className="result-card-action">
          <span>View hospital details</span>
          <ChevronRight aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
