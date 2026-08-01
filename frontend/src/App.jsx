import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import RegistrationsPage from './pages/RegistrationsPage';
import QueuesPage from './pages/QueuesPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import PoliclinicsPage from './pages/PoliclinicsPage';
import DoctorsPage from './pages/DoctorsPage';
import MedicinesPage from './pages/MedicinesPage';
import UsersPage from './pages/UsersPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes (App Layout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* General Protected Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Role Restricted Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER']} />}>
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/registrations" element={<RegistrationsPage />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER']} />}>
                <Route path="/queues" element={<QueuesPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'REGISTRATION_OFFICER', 'CASHIER']} />}>
                <Route path="/payments" element={<PaymentsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']} />}>
                <Route path="/medical-records" element={<MedicalRecordsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'PHARMACIST']} />}>
                <Route path="/medicines" element={<MedicinesPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/policlinics" element={<PoliclinicsPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
