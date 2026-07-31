import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  LoadingSpinner, StatusBadge, EmptyState, PageHeader,
} from '../components/common/UIComponents';
import { BarChart3, TrendingUp, Users, Pill, Calendar, Download } from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('visits'); // visits | revenue | medicines
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [visitData, setVisitData] = useState([]);
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, count: 0, items: [] });
  const [medicineData, setMedicineData] = useState([]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'visits') {
        const res = await api.get(`/reports/visits?startDate=${startDate}&endDate=${endDate}`);
        if (res.data.success) setVisitData(res.data.data);
      } else if (activeTab === 'revenue') {
        const res = await api.get(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
        if (res.data.success) setRevenueData(res.data.data);
      } else if (activeTab === 'medicines') {
        const res = await api.get(`/reports/medicines?startDate=${startDate}&endDate=${endDate}`);
        if (res.data.success) setMedicineData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan & Rekapitulasi Klinik"
        subtitle="Analisis kunjungan pasien, omzet pendapatan, dan penggunaan obat"
      />

      {/* Date Range & Tab Navigation */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {[
            ['visits', 'Kunjungan Pasien', Users],
            ['revenue', 'Pendapatan Klinik', TrendingUp],
            ['medicines', 'Pemakaian Obat', Pill],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 md:flex-initial flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="outline-none bg-transparent"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Menyusun laporan..." />
        ) : activeTab === 'visits' ? (
          <div>
            <div className="card-header">
              <div className="text-sm font-bold text-slate-800">
                Total Kunjungan Pasien ({visitData.length} transaksi)
              </div>
            </div>
            {visitData.length === 0 ? (
              <EmptyState icon={Users} title="Tidak ada data kunjungan" description="Tidak ada kunjungan pada rentang tanggal terpilih." />
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>No. Registrasi</th>
                      <th>Pasien</th>
                      <th>Dokter & Poli</th>
                      <th>Pembayaran</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitData.map((v) => (
                      <tr key={v.id}>
                        <td className="font-semibold text-slate-800">{v.visit_date}</td>
                        <td className="font-bold text-slate-900">{v.registration_number}</td>
                        <td>
                          <div className="font-bold text-slate-900">{v.patient?.name}</div>
                          <div className="text-xs text-slate-500">{v.patient?.medical_record_number}</div>
                        </td>
                        <td>
                          <div className="text-xs font-semibold text-slate-800">{v.policlinic?.name}</div>
                          <div className="text-xs text-slate-500">{v.doctor?.name}</div>
                        </td>
                        <td>
                          <span className="badge badge-poly text-[10px] uppercase font-bold">{v.payment_type}</span>
                        </td>
                        <td><StatusBadge status={v.status} paymentStatus={v.payment?.payment_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'revenue' ? (
          <div>
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between">
              <div>
                <div className="text-xs opacity-80 uppercase tracking-wide font-semibold">Total Omzet Pendapatan</div>
                <div className="text-2xl font-black">
                  Rp {(revenueData.totalRevenue || 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-right text-xs opacity-90">
                <div>{revenueData.count} Transaksi Lunas</div>
              </div>
            </div>

            {revenueData.items.length === 0 ? (
              <EmptyState icon={TrendingUp} title="Tidak ada transaksi lunas" description="Belum ada transaksi pembayaran lunas pada rentang tanggal ini." />
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>No. Invoice</th>
                      <th>Pasien</th>
                      <th>Metode Bayar</th>
                      <th>Konsultasi</th>
                      <th>Obat</th>
                      <th className="text-right">Total Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.items.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold text-slate-900">{p.payment_number}</td>
                        <td className="font-semibold text-slate-800">{p.patient?.name}</td>
                        <td>
                          <span className="badge badge-done text-[10px] uppercase font-bold">{p.payment_method}</span>
                        </td>
                        <td>Rp {(parseFloat(p.consultation_fee) || 0).toLocaleString('id-ID')}</td>
                        <td>Rp {(parseFloat(p.medicine_fee) || 0).toLocaleString('id-ID')}</td>
                        <td className="text-right font-extrabold text-slate-900">
                          Rp {(parseFloat(p.total_amount) || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'medicines' ? (
          <div>
            <div className="card-header">
              <div className="text-sm font-bold text-slate-800">
                Laporan Frekuensi & Jumlah Resep Obat
              </div>
            </div>
            {medicineData.length === 0 ? (
              <EmptyState icon={Pill} title="Tidak ada data pemakaian obat" description="Belum ada obat yang diresepkan." />
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nama Obat</th>
                      <th>Satuan</th>
                      <th className="text-center">Total Diresepkan</th>
                      <th className="text-right">Total Jumlah Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicineData.map((m, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-slate-900">{m.medicine?.name}</td>
                        <td>{m.medicine?.unit}</td>
                        <td className="text-center font-semibold text-slate-700">{m.dataValues?.total_prescribed || m.total_prescribed}x</td>
                        <td className="text-right font-extrabold text-emerald-700">
                          {m.dataValues?.total_quantity || m.total_quantity} {m.medicine?.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ReportsPage;
