import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const routeTitles = {
  '/dashboard':       { title: 'Dashboard', sub: 'Ringkasan statistik & aktivitas klinik hari ini' },
  '/registrations':   { title: 'Pendaftaran & Antrean', sub: 'Daftarkan pasien & kelola antrean kunjungan' },
  '/queues':          { title: 'Layar Antrean Live', sub: 'Monitor antrean realtime untuk tampilan ruang tunggu' },
  '/patients':        { title: 'Data Pasien', sub: 'Cari, tambah & kelola rekam medis pasien' },
  '/medical-records': { title: 'Pemeriksaan (SOAP)', sub: 'Lakukan pemeriksaan, input diagnosis & resep' },
  '/policlinics':     { title: 'Data Poliklinik', sub: 'Kelola daftar poliklinik layanan klinik' },
  '/doctors':         { title: 'Data Dokter', sub: 'Kelola profil & akun login dokter' },
  '/medicines':       { title: 'Stok Obat', sub: 'Inventaris & penyesuaian stok obat klinik' },
};

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Lock body scroll when sidebar open (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const route = routeTitles[location.pathname] || { title: 'Mini Clinic', sub: '' };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="main-content">
        <Header
          title={route.title}
          subtitle={route.sub}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
