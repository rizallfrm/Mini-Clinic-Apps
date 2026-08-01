import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  LoadingSpinner, StatusBadge, StatCard, Alert,
} from '../components/common/UIComponents';
import {
  Users, UserCheck, Pill, ClipboardList,
  TrendingUp, ArrowRight, Clock, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const QuickAction = ({ to, icon: Icon, iconBg, iconColor, title, sub }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 group transition"
  >
    <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition truncate">{title}</div>
      <div className="text-[11px] text-slate-500 truncate">{sub}</div>
    </div>
    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => { if (res.data.success) setData(res.data.data); })
      .catch(() => setError('Gagal memuat data dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Memuat dashboard..." />;
  if (error) return <Alert type="error">{error}</Alert>;

  const { metrics, trends, recent_registrations } = data || {};
  const reg = metrics?.today_registrations;

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${user?.role === 'DOCTOR' ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
        <StatCard
          label={user?.role === 'DOCTOR' ? "Total Pasien Saya" : "Total Pasien"}
          value={metrics?.total_patients ?? 0}
          sub={user?.role === 'DOCTOR' ? "Pasien terdaftar ke Anda" : "Pasien terdaftar aktif"}
          icon={Users}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        {user?.role !== 'DOCTOR' && (
          <StatCard
            label="Dokter Aktif"
            value={metrics?.active_doctors ?? 0}
            sub="Siap bertugas"
            icon={UserCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        )}
        <StatCard
          label={user?.role === 'DOCTOR' ? "Kunjungan Pasien Saya" : "Kunjungan Hari Ini"}
          value={reg?.total ?? 0}
          sub={`${reg?.completed ?? 0} selesai · ${reg?.pending ?? 0} menunggu`}
          icon={ClipboardList}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        {user?.role !== 'DOCTOR' && (
          <StatCard
            label="Stok Obat Menipis"
            value={metrics?.low_stock_medicines ?? 0}
            sub="Stok di bawah 20 unit"
            icon={Pill}
            iconBg={metrics?.low_stock_medicines > 0 ? 'bg-amber-50' : 'bg-slate-50'}
            iconColor={metrics?.low_stock_medicines > 0 ? 'text-amber-600' : 'text-slate-500'}
          />
        )}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Chart */}
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <div>
              <div className="text-sm font-bold text-slate-800">Tren Kunjungan Pasien</div>
              <div className="text-xs text-slate-500">7 hari terakhir</div>
            </div>
            <span className="badge badge-done text-xs">Grafik Harian</span>
          </div>
          <div className="px-4 pb-4 pt-2">
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '0.625rem', color: '#f8fafc', fontSize: '12px', padding: '8px 12px' }}
                    formatter={v => [`${v} Pasien`, 'Kunjungan']}
                    cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={2} fill="url(#visitGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions (Hidden for Doctors) */}
        {user?.role !== 'DOCTOR' && (
          <div className="card">
            <div className="card-header">
              <div>
                <div className="text-sm font-bold text-slate-800">Akses Cepat</div>
                <div className="text-xs text-slate-500">Alur operasional klinik</div>
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              <QuickAction
                to="/registrations"
                icon={ClipboardList}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-700"
                title="Daftarkan Pasien Baru"
                sub="Buat kunjungan & nomor antrean"
              />
              <QuickAction
                to="/queues"
                icon={Clock}
                iconBg="bg-indigo-100"
                iconColor="text-indigo-700"
                title="Layar Antrean Live"
                sub="Monitor antrean ruang tunggu"
              />
              <QuickAction
                to="/patients"
                icon={Users}
                iconBg="bg-teal-100"
                iconColor="text-teal-700"
                title="Cari Data Pasien"
                sub="NIK, No. RM, atau nama"
              />
              <QuickAction
                to="/medicines"
                icon={Pill}
                iconBg={metrics?.low_stock_medicines > 0 ? 'bg-amber-100' : 'bg-slate-100'}
                iconColor={metrics?.low_stock_medicines > 0 ? 'text-amber-700' : 'text-slate-600'}
                title="Cek Stok Obat"
                sub={metrics?.low_stock_medicines > 0 ? `${metrics.low_stock_medicines} obat stok menipis!` : 'Inventaris obat klinik'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent Registrations */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <div className="text-sm font-bold text-slate-800">
              {user?.role === 'DOCTOR' ? 'Pasien Terbaru Hari Ini' : 'Pendaftaran Terbaru Hari Ini'}
            </div>
            <div className="text-xs text-slate-500">5 kunjungan terkini</div>
          </div>
          <Link to="/registrations" className="btn btn-ghost btn-sm gap-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No. Registrasi</th>
                <th>Pasien</th>
                <th>Dokter / Poli</th>
                <th>Antrean</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent_registrations && recent_registrations.length > 0
                ? recent_registrations.map(reg => (
                    <tr key={reg.id}>
                      <td className="font-semibold text-slate-700">{reg.registration_number}</td>
                      <td className="font-semibold text-slate-900">{reg.patient_name}</td>
                      <td className="text-slate-600">
                        <div className="leading-tight">{reg.doctor_name}</div>
                        <div className="text-xs text-slate-400">{reg.policlinic_name}</div>
                      </td>
                      <td>
                        <span className="queue-number">{reg.queue_number || '-'}</span>
                      </td>
                      <td><StatusBadge status={reg.status} paymentStatus={reg.payment?.payment_status} /></td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                        Belum ada pendaftaran hari ini.
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
