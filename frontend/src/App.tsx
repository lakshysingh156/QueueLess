import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OverviewPage from './pages/OverviewPage';
import SearchPage from './pages/SearchPage';
import Results from './pages/Results';
import HospitalDetail from './pages/HospitalDetail';
import Emergency from './pages/Emergency';
import Login from './pages/Login';
import HospitalsPage from './pages/HospitalsPage';
import { AuthProvider } from './auth';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/results" element={<Results />} />
          <Route path="/hospital/:id" element={<HospitalDetail />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFoundPage() {
  return (
    <div className="site-wrapper bg-[#fbfcfd]">
      <Navbar />
      <main className="page-container flex flex-1 items-center justify-center py-24 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">404</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
          <p className="mt-2 text-sm text-slate-600">That page is not part of the QueueLess demo.</p>
          <Link to="/hospitals" className="btn btn-primary mt-6">Browse hospitals</Link>
        </div>
      </main>
    </div>
  );
}
