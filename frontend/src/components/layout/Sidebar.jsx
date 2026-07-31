import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  Building2,
  Pill,
  ClipboardList,
  Monitor,
  LogOut,
  X,
  HeartPulse,
  ChevronRight,
  CreditCard,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Menu Utama',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER', 'PHARMACIST', 'CASHIER'],
      },
      {
        label: 'Pendaftaran & Antrean',
        path: '/registrations',
        icon: ClipboardList,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'],
      },
      {
        label: 'Layar Antrean Live',
        path: '/queues',
        icon: Monitor,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'],
      },
      {
        label: 'Data Pasien',
        path: '/patients',
        icon: Users,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'],
      },
      {
        label: 'Pemeriksaan (SOAP)',
        path: '/medical-records',
        icon: Stethoscope,
        roles: ['ADMIN', 'DOCTOR'],
      },
      {
        label: 'Kasir & Pembayaran',
        path: '/payments',
        icon: CreditCard,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER', 'CASHIER'],
      },
      {
        label: 'Laporan Klinik',
        path: '/reports',
        icon: BarChart3,
        roles: ['ADMIN', 'DOCTOR'],
      },
    ],
  },
  {
    label: 'Master Data & Pengaturan',
    items: [
      {
        label: 'Data Poliklinik',
        path: '/policlinics',
        icon: Building2,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'],
      },
      {
        label: 'Data Dokter',
        path: '/doctors',
        icon: UserCheck,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER'],
      },
      {
        label: 'Stok Obat',
        path: '/medicines',
        icon: Pill,
        roles: ['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER', 'PHARMACIST'],
      },
      {
        label: 'Manajemen User',
        path: '/users',
        icon: ShieldCheck,
        roles: ['ADMIN'],
      },
    ],
  },
];

const roleLabels = {
  ADMIN: { label: 'Administrator', dot: 'bg-rose-400' },
  DOCTOR: { label: 'Dokter', dot: 'bg-emerald-400' },
  REGISTRATION_OFFICER: { label: 'Petugas Pendaftaran', dot: 'bg-sky-400' },
  PHARMACIST: { label: 'Apoteker', dot: 'bg-amber-400' },
  CASHIER: { label: 'Kasir', dot: 'bg-purple-400' },
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const roleInfo = roleLabels[user?.role] || { label: user?.role, dot: 'bg-slate-400' };

  const initial = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar--visible' : 'sidebar--hidden'}`}
      style={{ width: '260px' }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
            <HeartPulse className="w-4.5 h-4.5 text-white animate-pulse-gentle" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Mini Clinic</div>
            <div className="text-emerald-400 text-[10px] font-semibold tracking-widest uppercase">
              Info System
            </div>
          </div>
        </div>

        {/* Close button — visible on mobile/tablet only */}
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Tutup menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User Badge */}
      <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-white/5 border border-white/8 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ring-2 ring-white/10">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleInfo.dot}`} />
            <span className="text-slate-400 text-[10px] truncate">{roleInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(item =>
            !item.roles || item.roles.includes(user?.role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <div className="px-2 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? 'active' : ''}`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5 flex-shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
