import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import WeekPage from './pages/WeekPage';
import LabPage from './pages/LabPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/week/:id" element={<WeekPage />} />
          <Route path="/lab/:path" element={<LabPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
