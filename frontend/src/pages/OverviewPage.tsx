import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CircleAlert,
  HeartPulse,
  MapPin,
  Search,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { listHospitals } from '../api';
import type { Hospital } from '../types';

export default function OverviewPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
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
        if (active) setError('Could not load the overview data from the hospital service.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const availableDepartmentCount = useMemo(() => {
    return hospitals.reduce(
      (count, hospital) => count + hospital.departments.filter((dept) => dept.available).length,
      0,
    );
  }, [hospitals]);

  const emergencyCount = useMemo(() => {
    return hospitals.filter((hospital) => hospital.emergency_available).length;
  }, [hospitals]);

  const cities = useMemo(() => {
    return [...new Set(hospitals.map((hospital) => hospital.city))];
  }, [hospitals]);

  const departmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const hospital of hospitals) {
      for (const department of hospital.departments) {
        if (!department.available) continue;
        counts.set(department.name, (counts.get(department.name) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [hospitals]);

  return (
    <div className="site-wrapper workspace-page">
      <Navbar />
      <main className="workspace-main dashboard-main">
        <div className="dashboard-heading">
          <div>
            <div className="workspace-breadcrumb"><span>QUEUELESS</span><span>/</span><span>OVERVIEW</span></div>
            <h1>Care directory overview</h1>
            <p>A clear snapshot of regional hospitals, specialties, and current care coverage.</p>
          </div>
          <Link to="/search" className="action-button">
            <Search aria-hidden="true" /> Find care <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="dashboard-banner">
          <div className="banner-symbol"><Activity aria-hidden="true" /></div>
          <div>
            <strong>Healthcare directory active</strong>
            <p>Hospital profiles, current waiting estimates, and available specialties across Delhi-NCR, Chandigarh, and Patiala.</p>
          </div>
          <Link to="/overview#how-it-works">How it works <ArrowUpRight aria-hidden="true" /></Link>
        </div>

        {error ? (
          <section className="workspace-empty-state" role="alert">
            <CircleAlert aria-hidden="true" />
            <h2>Directory unavailable</h2>
            <p>{error}</p>
            <button type="button" className="action-button" onClick={() => {
              setLoading(true);
              setError('');
              setReloadToken((token) => token + 1);
            }}>Try again</button>
          </section>
        ) : (
          <>
            <section className="metric-grid" aria-label="Directory statistics">
              <MetricCard icon={Building2} label="Hospitals listed" value={loading ? '—' : String(hospitals.length)} detail="Across Delhi-NCR, Chandigarh & Patiala" tone="blue" />
              <MetricCard icon={Stethoscope} label="Departments available" value={loading ? '—' : String(availableDepartmentCount)} detail={`${departmentCounts.length} distinct specialties`} tone="green" />
              <MetricCard icon={ShieldAlert} label="Emergency services" value={loading ? '—' : String(emergencyCount)} detail="24/7 emergency response" tone="amber" />
              <MetricCard icon={MapPin} label="Areas covered" value={loading ? '—' : String(cities.length)} detail={cities.length ? cities.join(' · ') : 'Loading locations'} tone="violet" />
            </section>

            <div className="dashboard-grid">
              <section className="panel directory-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-overline">DIRECTORY</span>
                    <h2>Explore listed hospitals</h2>
                  </div>
                  <Link to="/hospitals" className="panel-action">View directory <ArrowRight aria-hidden="true" /></Link>
                </div>

                {loading ? (
                  <div className="panel-loading"><span className="spinner" /> Loading hospital directory…</div>
                ) : hospitals.length ? (
                  <div className="hospital-list">
                    {hospitals.slice(0, 5).map((hospital) => {
                      const department = hospital.departments.find((item) => item.available);
                      const href = department
                        ? `/hospital/${hospital.id}?department=${encodeURIComponent(department.name)}`
                        : `/hospital/${hospital.id}`;
                      return (
                        <Link to={href} className="hospital-row" key={hospital.id}>
                          <span className="hospital-mark">{hospital.name.slice(0, 1)}</span>
                          <span className="hospital-row-copy">
                            <strong>{hospital.name}</strong>
                            <small><MapPin aria-hidden="true" /> {hospital.city} <span>·</span> {hospital.departments.length} departments listed</small>
                          </span>
                          <span className="hospital-row-meta">
                            {hospital.emergency_available && <span className="status-pill status-caution"><i /> Emergency</span>}
                            <ArrowUpRight aria-hidden="true" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="panel-empty">No hospitals are listed yet.</div>
                )}
              </section>

              <aside className="panel coverage-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-overline">CARE COVERAGE</span>
                    <h2>Popular departments</h2>
                  </div>
                  <span className="panel-heading-icon"><HeartPulse aria-hidden="true" /></span>
                </div>
                {loading ? (
                  <div className="panel-loading"><span className="spinner" /> Counting departments…</div>
                ) : departmentCounts.length ? (
                  <div className="coverage-list">
                    {departmentCounts.slice(0, 6).map(([name, count], index) => (
                      <Link
                        to={`/search?symptom=${encodeURIComponent(name)}`}
                        key={name}
                        className="coverage-row"
                      >
                        <span className={`coverage-index coverage-index-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
                        <span className="coverage-name">{name}</span>
                        <span className="coverage-count">{count} <small>hospitals</small></span>
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="panel-empty">No available departments are listed.</div>
                )}
                <Link to="/search" className="coverage-footer"><Search aria-hidden="true" /> Search all care options</Link>
              </aside>
            </div>

            <section className="dashboard-bottom">
              <div className="bottom-card">
                <span className="bottom-card-icon"><Activity aria-hidden="true" /></span>
                <div><strong>Understand the estimates</strong><p>Learn how QueueLess routes search terms and calculates wait estimates.</p></div>
                <Link to="/overview#how-it-works" aria-label="Learn how QueueLess works"><ArrowRight aria-hidden="true" /></Link>
              </div>
              <div className="bottom-card bottom-card-emergency">
                <span className="bottom-card-icon"><ShieldAlert aria-hidden="true" /></span>
                <div><strong>Need emergency help?</strong><p>Do not wait for an app. Contact local emergency services directly.</p></div>
                <Link to="/emergency" aria-label="Open emergency guide"><ArrowRight aria-hidden="true" /></Link>
              </div>
            </section>
            <section id="how-it-works" className="methodology-panel">
              <div>
                <span className="section-overline">HOW QUEUELESS WORKS</span>
                <h2>Transparent guidance, not a medical decision.</h2>
                <p>QueueLess maps a search phrase to a care department, then compares listed options using estimated wait, distance, and consultation fees. Confirm all details with the hospital before travelling.</p>
              </div>
              <div className="methodology-steps">
                <div><span>01</span><strong>Describe</strong><small>Search by symptom or specialty.</small></div>
                <div><span>02</span><strong>Compare</strong><small>Review the available directory details.</small></div>
                <div><span>03</span><strong>Plan</strong><small>Use estimates as guidance only.</small></div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  detail: string;
  tone: 'blue' | 'green' | 'amber' | 'violet';
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon-${tone}`}><Icon aria-hidden="true" /></div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
    </article>
  );
}
