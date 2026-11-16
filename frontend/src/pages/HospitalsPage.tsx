import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, MapPin, Search, ShieldCheck, SlidersHorizontal, Star } from 'lucide-react';
import { getHospitalRating } from '../hospitalRatings';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { listHospitals } from '../api';
import type { Hospital } from '../types';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All areas');
  const [department, setDepartment] = useState('All specialties');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    listHospitals()
      .then((records) => {
        if (active) setHospitals(records);
      })
      .catch(() => {
        if (active) setError('The hospital directory could not be loaded. Check that the API is running, then try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const cities = useMemo(
    () => [...new Set(hospitals.map((hospital) => hospital.city))].sort(),
    [hospitals],
  );
  const departments = useMemo(
    () => [...new Set(hospitals.flatMap((hospital) => hospital.departments.map((item) => item.name)))].sort(),
    [hospitals],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return hospitals.filter((hospital) => {
      const matchesQuery =
        !query ||
        [hospital.name, hospital.address, hospital.city].some((value) =>
          value.toLowerCase().includes(query),
        );
      return (
        matchesQuery &&
        (city === 'All areas' || hospital.city === city) &&
        (department === 'All specialties' ||
          hospital.departments.some((item) => item.name === department && item.available)) &&
        (!emergencyOnly || hospital.emergency_available)
      );
    });
  }, [city, department, emergencyOnly, hospitals, search]);

  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />
      <main className="workspace-main directory-page">
        <div className="page-intro directory-intro">
          <span className="page-kicker"><MapPin aria-hidden="true" /> CARE DIRECTORY</span>
          <h1>Hospitals near you</h1>
          <p>
            Explore hospitals by area, specialty, or listed emergency services. Confirm details,
            availability, and costs directly before travelling.
          </p>
        </div>

        <div className="directory-filter-panel">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Search hospitals</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Hospital, city, or address"
                className="input input-search py-2.5"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Area</span>
            <select className="input py-2.5" value={city} onChange={(event) => setCity(event.target.value)}>
              <option>All areas</option>
              {cities.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Specialty</span>
            <select
              className="input py-2.5"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option>All specialties</option>
              {departments.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button
            type="button"
            aria-pressed={emergencyOnly}
            onClick={() => setEmergencyOnly((current) => !current)}
            className={`btn btn-sm min-h-10 ${emergencyOnly ? 'btn-danger' : 'btn-secondary'}`}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Emergency services
          </button>
        </div>

        <div className="directory-results-heading">
          <div>
            <span className="section-overline">AVAILABLE LISTINGS</span>
            <p aria-live="polite">
            {loading ? 'Loading the directory…' : `${filtered.length} ${filtered.length === 1 ? 'hospital' : 'hospitals'} found`}
            </p>
          </div>
          <Link to="/search" className="directory-search-link">
            Search by symptom <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {error && (
          <div className="card my-12 p-8 text-center" role="alert">
            <AlertCircle className="mx-auto mb-3 h-6 w-6 text-rose-600" aria-hidden="true" />
            <p className="mb-4 text-sm text-slate-700">{error}</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setLoading(true);
                setError('');
                setReloadToken((token) => token + 1);
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="card my-12 p-10 text-center">
            <SlidersHorizontal className="mx-auto mb-3 h-6 w-6 text-slate-400" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-900">No hospitals match those filters</h2>
            <p className="mt-2 text-sm text-slate-600">Try another area, specialty, or search term.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-5"
              onClick={() => {
                setSearch('');
                setCity('All areas');
                setDepartment('All specialties');
                setEmergencyOnly(false);
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="directory-grid">
            {filtered.map((hospital) => {
              const firstDepartment = hospital.departments.find((item) => item.available);
              const detailUrl = firstDepartment
                ? `/hospital/${hospital.id}?department=${encodeURIComponent(firstDepartment.name)}`
                : `/hospital/${hospital.id}`;
              return (
                <li key={hospital.id}>
                  <Link
                    to={detailUrl}
                    className="directory-card card card-hover group flex h-full flex-col text-inherit no-underline"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="directory-card-title">
                          {hospital.name}
                        </h2>
                      </div>
                      <span className="directory-card-mark">{hospital.name.slice(0, 1)}</span>
                    </div>
                    <p className="directory-card-location">
                      <MapPin aria-hidden="true" />
                      <span>{hospital.address}, {hospital.city}</span>
                    </p>
                    <div className="directory-card-footer">
                      <span className="badge badge-gray">{hospital.departments.length} departments listed</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-full border border-amber-200/50">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {getHospitalRating(hospital.id, hospital.name).score.toFixed(1)}
                      </span>
                      {hospital.emergency_available && <span className="badge badge-red">Emergency services</span>}
                      <ArrowRight aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="directory-disclaimer">
          Hospital profiles, fees, and estimated queue data are sourced from our directory. Always confirm details directly with the hospital. For emergencies in India, call 108 or 112.
        </p>
      </main>
    </div>
  );
}
