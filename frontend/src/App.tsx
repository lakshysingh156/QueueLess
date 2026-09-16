import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import Results from './pages/Results';
import HospitalDetail from './pages/HospitalDetail';
import Emergency from './pages/Emergency';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/hospital/:id" element={<HospitalDetail />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
