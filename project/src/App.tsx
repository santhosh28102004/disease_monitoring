import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { ToastProvider } from '@/components/Toast';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';

import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { ReportHealthIssue } from '@/pages/citizen/ReportHealthIssue';
import { MyReports } from '@/pages/citizen/MyReports';
import { DiseaseInformation } from '@/pages/citizen/DiseaseInformation';
import { CitizenAlerts } from '@/pages/citizen/CitizenAlerts';
import { Profile } from '@/pages/citizen/Profile';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { PendingReports, VerifyReport } from '@/pages/admin/PendingReports';
import { VerifiedCases, ActiveCases } from '@/pages/admin/CaseTables';
import { AssignedLocations } from '@/pages/admin/AssignedLocations';
import { DiseaseAnalytics } from '@/pages/admin/DiseaseAnalytics';
import { AlertsManagement } from '@/pages/admin/AlertsManagement';
import { AdminProfile } from '@/pages/admin/AdminProfile';
import { HealthOfficialOverview } from '@/pages/official/HealthOfficialOverview';
import type { AccountRole } from '@/data/mockData';

function ProtectedRoute({ children, role, accountRole }: { children: ReactNode; role: 'citizen' | 'official'; accountRole?: AccountRole }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user || user.role !== role || (accountRole && user.accountRole !== accountRole)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute role="citizen"><ReportHealthIssue /></ProtectedRoute>} />
      <Route path="/my-reports" element={<ProtectedRoute role="citizen"><MyReports /></ProtectedRoute>} />
      <Route path="/disease-info" element={<ProtectedRoute role="citizen"><DiseaseInformation /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute role="citizen"><CitizenAlerts /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="citizen"><Profile /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute role="official"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/pending" element={<ProtectedRoute role="official"><PendingReports /></ProtectedRoute>} />
      <Route path="/admin/verify/:id" element={<ProtectedRoute role="official"><VerifyReport /></ProtectedRoute>} />
      <Route path="/admin/verified" element={<ProtectedRoute role="official"><VerifiedCases /></ProtectedRoute>} />
      <Route path="/admin/active" element={<ProtectedRoute role="official"><ActiveCases /></ProtectedRoute>} />
      <Route path="/admin/locations" element={<ProtectedRoute role="official"><AssignedLocations /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute role="official"><DiseaseAnalytics /></ProtectedRoute>} />
      <Route path="/admin/alerts" element={<ProtectedRoute role="official"><AlertsManagement /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute role="official"><AdminProfile /></ProtectedRoute>} />
      <Route path="/official/user-overview" element={<ProtectedRoute role="official" accountRole="HEALTH_OFFICIAL"><HealthOfficialOverview /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
