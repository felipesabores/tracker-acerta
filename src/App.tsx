import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import { LiveMap } from '@/features/map/LiveMap';
import { MaintenanceDashboard } from '@/features/maintenance/MaintenanceDashboard';
import { SafetyDashboard } from '@/features/safety/SafetyDashboard';
import { DevicesPage } from '@/pages/DevicesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { RequireAuth } from '@/components/RequireAuth';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <RequireAuth>
          <MainLayout />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="map" element={<LiveMap />} />

        <Route path="maintenance" element={<MaintenanceDashboard />} />
        <Route path="safety" element={<SafetyDashboard />} />

        <Route path="devices" element={<DevicesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
