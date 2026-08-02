import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  LoadingSpinner, StatusBadge, EmptyState, PageHeader,
} from '../components/common/UIComponents';
import { BarChart3, TrendingUp, Users, Pill, Calendar, Download, Printer } from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('visits'); // visits | revenue | medicines
  const [periodPreset, setPeriodPreset] = useState('monthly'); // daily | weekly | monthly | custom

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

  const setFilterPreset = (preset) => {
    setPeriodPreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'daily') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'weekly') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'monthly') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    let contentHtml = '';
    let titleText = '';

    if (activeTab === 'visits') {
      titleText = 'LAPORAN KUNJUNGAN PASIEN';
      contentHtml = `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>No. Registrasi</th>
              <th>Pasien</th>
              <th>Poli / Dokter</th>
              <th>Pembayaran</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${visitData.map((v, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${v.visit_date}</td>
                <td><strong>${v.registration_number}</strong></td>
                <td>${v.patient?.name || '-'} (${v.patient?.medical_record_number || '-'})</td>
                <td>${v.policlinic?.name || '-'} / ${v.doctor?.name || '-'}</td>
                <td>${v.payment_type}</td>
                <td>${v.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'revenue') {
      titleText = 'LAPORAN PENDAPATAN KLINIK';
      contentHtml = `
        <div style="margin-bottom: 15px; font-weight: bold; font-size: 13px;">
          Total Omzet: Rp ${(revenueData.totalRevenue || 0).toLocaleString('id-ID')} (${revenueData.count} Transaksi Lunas)
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Dibuat</th>
              <th>No. Invoice</th>
              <th>Pasien</th>
              <th>Metode Bayar</th>
              <th>Konsultasi</th>
              <th>Obat</th>
              <th>Total Pembayaran</th>
            </tr>
          </thead>
          <tbody>
            ${(revenueData.items || []).map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '-'}</td>
                <td><strong>${p.payment_number}</strong></td>
                <td>${p.patient?.name || '-'}</td>
                <td>${p.payment_method}</td>
                <td>Rp ${(parseFloat(p.consultation_fee) || 0).toLocaleString('id-ID')}</td>
                <td>Rp ${(parseFloat(p.medicine_fee) || 0).toLocaleString('id-ID')}</td>
                <td><strong>Rp ${(parseFloat(p.total_amount) || 0).toLocaleString('id-ID')}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'medicines') {
      titleText = 'LAPORAN REKAPITULASI PEMAKAIAN OBAT';
      contentHtml = `
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Obat</th>
              <th>Satuan</th>
              <th>Tanggal Terakhir</th>
              <th>Frekuensi Diresepkan</th>
              <th>Total Jumlah Unit</th>
            </tr>
          </thead>
          <tbody>
            ${medicineData.map((m, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${m.medicine?.name || '-'}</strong></td>
                <td>${m.medicine?.unit || '-'}</td>
                <td>${(m.last_date || m.dataValues?.last_date) ? new Date(m.last_date || m.dataValues?.last_date).toISOString().split('T')[0] : '-'}</td>
                <td>${m.dataValues?.total_prescribed || m.total_prescribed || 0} kali</td>
                <td><strong>${m.dataValues?.total_quantity || m.total_quantity || 0} ${m.medicine?.unit || ''}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${titleText} - Clinica</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
            .clinic-title { font-size: 22px; font-weight: bold; color: #0f766e; }
            .clinic-sub { font-size: 12px; color: #64748b; }
            .report-title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 5px; color: #0f172a; text-transform: uppercase; }
            .period-info { text-align: center; font-size: 12px; color: #475569; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 12px; }
            th { background-color: #f1f5f9; font-weight: bold; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; }
            .sig-space { height: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-title">CLINICA HEALTHCARE SYSTEM</div>
            <div class="clinic-sub">Jl. Kesehatan No. 123, Jakarta · Telp: (021) 555-0199 · Email: info@clinica.com</div>
          </div>
          <div class="report-title">${titleText}</div>
          <div class="period-info">Periode Laporan: <strong>${startDate}</strong> s/d <strong>${endDate}</strong></div>
          ${contentHtml}
          <div class="footer">
            <div>
              Dicetak pada: ${new Date().toLocaleString('id-ID')}<br>
              Oleh: Administrator Klinik
            </div>
            <div style="text-align: right;">
              Penanggung Jawab Klinik,
              <div class="sig-space"></div>
              <strong>(_________________________)</strong>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan & Rekapitulasi Klinik"
        subtitle="Analisis kunjungan pasien, omzet pendapatan, dan penggunaan obat"
        action={
          <button onClick={handlePrint} className="btn btn-primary gap-2 w-full sm:w-auto">
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        }
      />

      {/* Date Range & Tab Navigation */}
      <div className="card p-4 space-y-4">
        {/* Preset Period Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-1">Filter Periode:</span>
            {[
              ['daily', 'Harian (Hari Ini)'],
              ['weekly', 'Mingguan (7 Hari)'],
              ['monthly', 'Bulanan (Bulan Ini)'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterPreset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  periodPreset === key
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPeriodPreset('custom');
                setStartDate(e.target.value);
              }}
              className="outline-none bg-transparent"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPeriodPreset('custom');
                setEndDate(e.target.value);
              }}
              className="outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {[
            ['visits', 'Kunjungan Pasien', Users],
            ['revenue', 'Pendapatan Klinik', TrendingUp],
            ['medicines', 'Pemakaian Obat', Pill],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
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
                      <th>Tanggal Dibuat</th>
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
                        <td className="font-semibold text-slate-800">{p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '-'}</td>
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
                      <th>Tanggal Terakhir</th>
                      <th className="text-center">Total Diresepkan</th>
                      <th className="text-right">Total Jumlah Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicineData.map((m, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-slate-900">{m.medicine?.name}</td>
                        <td>{m.medicine?.unit}</td>
                        <td className="text-xs text-slate-600 font-medium">
                          {(m.last_date || m.dataValues?.last_date) ? new Date(m.last_date || m.dataValues?.last_date).toISOString().split('T')[0] : '-'}
                        </td>
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
