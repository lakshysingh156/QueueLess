import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  IndianRupee,
  ChevronRight,
  ArrowUpDown,
  AlertTriangle,
  Search,
  RotateCcw,
  Star,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import LocationPicker from '../components/LocationPicker';
import { searchHospitals } from '../api';
import type { SearchResponse, SearchResult } from '../types';
import { getSearchLocation, withSearchLocation } from '../searchLocation';
import { getConsultationFeeRange } from '../demoFees';
import { getHospitalRating } from '../hospitalRatings';

type SortKey = 'rank' | 'distance_km' | 'estimated_wait_min' | 'consultation_fee_min';

export default function Results() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const symptom = params.get('symptom') || '';
  const searchLocation = getSearchLocation(routeLocation.state);

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  function updateLocation(nextLocation: typeof searchLocation) {
    setLoading(true);
    setError('');
    navigate(`${routeLocation.pathname}${routeLocation.search}`, {
      replace: true,
      state: withSearchLocation(routeLocation.state, nextLocation),
    });
  }

  useEffect(() => {
    if (!symptom) return;
    let active = true;
    searchHospitals(symptom, searchLocation.latitude, searchLocation.longitude)
      .then((response) => {
        if (active) setData(response);
      })
      .catch(() => {
        if (active) setError('Could not connect to the hospital service. Please verify the backend is running.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retryToken, searchLocation.latitude, searchLocation.longitude, symptom]);

  function retrySearch() {
    setLoading(true);
    setError('');
    setRetryToken((token) => token + 1);
  }

  const filtered = (data?.results ?? []).filter((r) => !filterEmergency || r.emergency_available);
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'consultation_fee_min') {
      const aFee = getResultFee(a);
      const bFee = getResultFee(b);
      return (aFee?.min ?? 9999) - (bFee?.min ?? 9999);
    }
    return (a[sortKey] as number) - (b[sortKey] as number);
  });

  if (!symptom) {
    return (
      <div className="site-wrapper bg-[#fbfcfd]">
        <Navbar />
        <main className="page-container flex-1 py-20 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Start with a symptom or specialty</h1>
          <p className="mt-3 text-sm text-slate-600">Search is a navigation aid, not a medical diagnosis.</p>
          <Link to="/search" className="btn btn-primary mt-6">Start a search</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />

      <main className="workspace-main results-page">
        <div className="results-content">
          <nav aria-label="Breadcrumb" className="workspace-breadcrumb page-breadcrumb results-breadcrumb">
            <Link to="/">HOME</Link>
            <ChevronRight aria-hidden="true" />
            <Link
              to="/search"
              state={withSearchLocation(routeLocation.state, searchLocation)}
            >
              FIND CARE
            </Link>
            <ChevronRight aria-hidden="true" />
            <span>{data?.routed_department || 'RESULTS'}</span>
          </nav>

          {data && !loading && (
            <header className="results-heading">
              <div className="results-heading-copy">
                <div className="results-labels">
                <span className="badge badge-blue">{data.routed_department}</span>
                {data.is_emergency && (
                  <span className="badge badge-red font-semibold">Emergency Priority</span>
                )}
                <span className="results-query">Results for “{symptom}”</span>
                </div>
                <h1>Hospital recommendations</h1>
                <p className="results-count">
                  {loading ? 'Searching nearby listings…' : `${sorted.length} ${sorted.length === 1 ? 'hospital' : 'hospitals'} to compare`}
                  <span>Ranked by estimated wait, distance, and listed consultation fees.</span>
                </p>
              </div>
              <Link
                to="/search"
                state={withSearchLocation(routeLocation.state, searchLocation)}
                className="results-change-search"
              >
                <Search aria-hidden="true" />
                Change search
              </Link>
            </header>
          )}

          <div className="results-location">
            <LocationPicker value={searchLocation} onChange={updateLocation} compact />
          </div>

        {data && !loading && (data.is_emergency || /\b(chest pain|breath|stroke|unconscious|bleeding|seizure|trauma|head injury)\b/i.test(symptom)) && (
          <aside className="results-emergency-banner">
            <div className="results-emergency-copy">
              <AlertTriangle aria-hidden="true" />
              <p>
              {data.is_emergency
                ? 'This phrase matched an emergency-routing keyword. QueueLess cannot assess urgency; call for emergency help now if someone may be in danger.'
                : 'If this situation may be an emergency, do not wait for search results. Call 108 or 112 in India.'}
              </p>
            </div>
            <div className="results-emergency-actions">
              <a href="tel:108">Call 108</a>
              <a href="tel:112">Call 112</a>
            </div>
          </aside>
        )}

        {data && !loading && sorted.length > 0 && (
          <section className="results-controls" aria-label="Sort and filter recommendations">
            <div className="results-sort-group">
              <span className="results-sort-label">
                <ArrowUpDown aria-hidden="true" /> Sort results
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
                  aria-pressed={sortKey === key}
                  className={`results-sort-button${sortKey === key ? ' is-selected' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFilterEmergency((prev) => !prev)}
              aria-pressed={filterEmergency}
              className={`results-emergency-filter${filterEmergency ? ' is-selected' : ''}`}
            >
              <AlertTriangle aria-hidden="true" />
              {filterEmergency ? 'Showing emergency listings' : 'Emergency services listed'}
            </button>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <div className="results-status">
            <div className="spinner mb-4" />
            <p className="text-sm font-medium text-slate-700">Searching hospital queues...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card results-state-card">
            <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-rose-900 mb-1">Failed to load results</h2>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <button type="button" onClick={retrySearch} className="btn btn-secondary btn-sm mx-auto">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sorted.length === 0 && (
          <div className="card results-state-card">
            <Search className="w-6 h-6 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-slate-900 mb-1">No hospitals found</h2>
            <p className="text-xs text-slate-500 mb-5">
              No nearby match was found for &ldquo;{symptom}&rdquo;. The current directory covers
              Delhi-NCR, Chandigarh, and Patiala; try one of these search areas or another symptom.
            </p>
            <Link to="/search" className="btn btn-primary btn-sm">
              Browse Departments
            </Link>
          </div>
        )}

        {/* Defined, High-Quality Hospital Cards */}
        {!loading && !error && sorted.length > 0 && (
          <div className="results-list">
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
        </div>
      </main>
    </div>
  );
}

function HospitalCard({ result: r, onClick }: { result: SearchResult; onClick: () => void }) {
  const isTopRanked = r.rank === 1;
  const fee = getResultFee(r);
  const rating = getHospitalRating(r.hospital_id, r.hospital_name);

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
            {isTopRanked && <span className="badge badge-blue">Top match</span>}
            <span className="badge badge-gray">{r.department}</span>
            {r.emergency_available && <span className="badge badge-red">Emergency services</span>}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-200/50">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {rating.score.toFixed(1)}
              <span className="font-normal text-slate-400">({rating.reviewsCount.toLocaleString()})</span>
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {r.explanation} Scores balance estimated wait, straight-line distance, and listed fees;
            this is not a clinical recommendation.
          </p>
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
            <strong>{r.distance_km < 0.5 ? '< 0.5' : r.distance_km.toFixed(1)} <small>km</small></strong>
          </div>
          <div className="result-metric">
            <IndianRupee aria-hidden="true" />
            <span>Consultation fee</span>
            <strong>
              {fee
                ? `${fee.min}–${fee.max}`
                : 'Not listed'}
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

function getResultFee(result: SearchResult) {
  return getConsultationFeeRange(
    result.hospital_name,
    result.department,
    result.consultation_fee_min,
    result.consultation_fee_max,
  );
}
