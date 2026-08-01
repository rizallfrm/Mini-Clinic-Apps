import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  LoadingSpinner, StatusBadge, EmptyState, Modal,
  Alert, FormField, Select, PageHeader,
} from '../components/common/UIComponents';
import { CreditCard, Printer, CheckCircle, Receipt, DollarSign } from 'lucide-react';

const PaymentsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReg, setSelectedReg] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCompletedRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/registrations/today');
      if (res.data.success) {
        // filter completed or checked-in registrations
        setRegistrations(res.data.data.filter(r => r.status === 'COMPLETED' || r.status === 'EXAMINATION'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompletedRegistrations(); }, [fetchCompletedRegistrations]);

  const openInvoiceModal = async (reg) => {
    setSelectedReg(reg);
    setLoadingInvoice(true);
    setErrorMsg('');
    setShowModal(true);
    try {
      const res = await api.get(`/payments/invoice/${reg.id}`);
      if (res.data.success) {
        setInvoice(res.data.data);
        if (res.data.data.payment) {
          setPaymentMethod(res.data.data.payment.payment_method);
        } else {
          setPaymentMethod(reg.payment_type === 'BPJS' ? 'BPJS' : reg.payment_type === 'INSURANCE' ? 'INSURANCE' : 'CASH');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat invoice.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedReg) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/payments/process/${selectedReg.id}`, {
        payment_method: paymentMethod,
      });
      if (res.data.success) {
        setInvoice(p => ({ ...p, payment: res.data.data }));
        await fetchCompletedRegistrations();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memproses pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!invoice || !selectedReg) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kuitansi Pembayaran - ${selectedReg.patient?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .clinic-title { font-size: 20px; font-weight: bold; }
            .clinic-sub { font-size: 12px; color: #666; }
            .inv-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #4338ca; text-align: center; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; }
            th { background-color: #f8fafc; text-align: left; }
            .total-row { font-weight: bold; background-color: #f1f5f9; }
            .footer { margin-top: 40px; text-align: right; font-size: 13px; }
            .sig-space { height: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-title">CLINICA HEALTHCARE SYSTEM</div>
            <div class="clinic-sub">Jl. Kesehatan No. 123, Jakarta · Telp: (021) 555-0199</div>
          </div>
          <div class="inv-title">KUITANSI PEMBAYARAN (${invoice.payment?.payment_number || 'INV-DRAFT'})</div>
          <div class="info-grid">
            <div>
              <strong>No. Pendaftaran:</strong> ${selectedReg.registration_number}<br>
              <strong>Nama Pasien:</strong> ${selectedReg.patient?.name}<br>
              <strong>No. Rekam Medis:</strong> ${selectedReg.patient?.medical_record_number}
            </div>
            <div>
              <strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}<br>
              <strong>Dokter:</strong> ${selectedReg.doctor?.name}<br>
              <strong>Metode Bayar:</strong> ${invoice.payment?.payment_method || paymentMethod}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Rincian Layanan / Item</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Harga Satuan</th>
                <th style="text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.item_name}</td>
                  <td style="text-align:center">${item.quantity}</td>
                  <td style="text-align:right">Rp ${(parseFloat(item.unit_price) || 0).toLocaleString('id-ID')}</td>
                  <td style="text-align:right">Rp ${(parseFloat(item.subtotal) || 0).toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align:right">TOTAL PEMBAYARAN</td>
                <td style="text-align:right">Rp ${(parseFloat(invoice.total_amount) || 0).toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <div>Petugas Kasir / Admin,</div>
            <div class="sig-space"></div>
            <div><strong>( ..................................... )</strong></div>
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
        title="Kasir & Pembayaran"
        subtitle="Proses rincian biaya konsultasi, obat, dan penerbitan kuitansi"
      />

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Memuat pendaftaran..." />
        ) : registrations.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Tidak ada tagihan aktif"
            description="Belum ada pendaftaran pasien yang selesai diperiksa hari ini."
          />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>No. Antrean</th>
                  <th>Pasien</th>
                  <th>Poliklinik & Dokter</th>
                  <th>Tipe Registrasi</th>
                  <th>Status Pemeriksaan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {r.queue?.queue_number || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{r.patient?.name}</div>
                      <div className="text-xs text-slate-500">{r.patient?.medical_record_number}</div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-slate-800">{r.policlinic?.name}</div>
                      <div className="text-xs text-slate-500">{r.doctor?.name}</div>
                    </td>
                    <td>
                      <span className="badge badge-poly uppercase text-[10px] font-bold">
                        {r.payment_type}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={r.status} paymentStatus={r.payment?.payment_status} />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => openInvoiceModal(r)}
                        className="btn btn-primary btn-sm gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Kasir & Tagihan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Kasir & Rincian Tagihan"
        subtitle={selectedReg ? `${selectedReg.patient?.name} · ${selectedReg.registration_number}` : ''}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            {invoice?.payment ? (
              <button onClick={handlePrintReceipt} className="btn btn-secondary gap-1.5 text-indigo-700 bg-indigo-50 border-indigo-200">
                <Printer className="w-4 h-4" />
                Cetak Kuitansi
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Tutup</button>
              {!invoice?.payment && (
                <button onClick={handleProcessPayment} disabled={submitting} className="btn btn-primary gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Memproses...' : 'Proses Pembayaran (Lunas)'}
                </button>
              )}
            </div>
          </div>
        }
      >
        {loadingInvoice ? (
          <LoadingSpinner label="Kalkulasi biaya..." />
        ) : invoice ? (
          <div className="space-y-4">
            {errorMsg && <Alert type="error">{errorMsg}</Alert>}
            {invoice.payment && (
              <Alert type="success">
                Pembayaran telah <strong>LUNAS</strong> (No: {invoice.payment.payment_number}) pada {new Date(invoice.payment.paid_at).toLocaleString('id-ID')}.
              </Alert>
            )}

            {/* Payment Method Selector */}
            {!invoice.payment && (
              <FormField label="Metode Pembayaran">
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="CASH">Tunai (CASH)</option>
                  <option value="BPJS">BPJS Kesehatan</option>
                  <option value="INSURANCE">Asuransi Swasta</option>
                  <option value="CARD">Kartu Debit / Kredit</option>
                </Select>
              </FormField>
            )}

            {/* Items Breakdown */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">Rincian Layanan</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Harga</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-800">{item.item_name}</td>
                      <td className="p-3 text-center font-bold text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-right text-slate-600">Rp {(parseFloat(item.unit_price) || 0).toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-bold text-slate-900">Rp {(parseFloat(item.subtotal) || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50 font-bold text-indigo-900 text-sm">
                    <td colSpan="3" className="p-3 text-right uppercase">Total Tagihan</td>
                    <td className="p-3 text-right text-base text-indigo-700">
                      Rp {(parseFloat(invoice.total_amount) || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
