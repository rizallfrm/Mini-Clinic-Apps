import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LoadingSpinner, StatusBadge, EmptyState, Modal,
  Alert, FormField, Input, Select, Textarea, PageHeader,
} from '../components/common/UIComponents';
import { Plus, Filter, ClipboardList, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'WAITING',     label: 'Menunggu' },
  { value: 'CHECKED_IN',  label: 'Check-In (Dipanggil)' },
  { value: 'EXAMINATION', label: 'Dalam Pemeriksaan' },
  { value: 'COMPLETED',   label: 'Selesai' },
  { value: 'CANCELLED',   label: 'Dibatalkan' },
];

const PAYMENT_OPTIONS = [
  { value: 'BPJS',      label: 'BPJS Kesehatan' },
  { value: 'CASH',      label: 'Mandiri / Cash' },
  { value: 'INSURANCE', label: 'Asuransi Swasta' },
  { value: 'OTHER',     label: 'Lainnya' },
];

const emptyForm = () => ({
  patient_id: '',
  policlinic_id: '',
  doctor_id: '',
  visit_date: new Date().toISOString().split('T')[0],
  payment_type: 'BPJS',
  initial_complaint: '',
});

const RegistrationsPage = () => {
  const { isAdmin, isOfficer } = useAuth();
  const canWrite = isAdmin || isOfficer;

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [modal, setModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [policlinics, setPoliclinics] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [formData, setFormData] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredDoctors = formData.policlinic_id
    ? allDoctors.filter(d => String(d.policlinic_id) === String(formData.policlinic_id))
    : allDoctors;

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/registrations/today', {
        params: { status: statusFilter || undefined },
      });
      if (res.data.success) setRegistrations(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const openModal = async () => {
    setFormData(emptyForm());
    setFormError('');
    setModal(true);
    try {
      const [patRes, poliRes, docRes] = await Promise.all([
        api.get('/patients?limit=200'),
        api.get('/policlinics/active'),
        api.get('/doctors/active'),
      ]);
      if (patRes.data.success)  setPatients(patRes.data.data.items);
      if (poliRes.data.success) setPoliclinics(poliRes.data.data);
      if (docRes.data.success)  setAllDoctors(docRes.data.data);
    } catch { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post('/registrations', formData);
      setModal(false);
      fetchRegistrations();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal membuat pendaftaran.');
    } finally { setSubmitting(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/registrations/${id}/status`, { status });
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status.');
    }
  };

  return (
    <>
      <PageHeader
        title="Pendaftaran & Antrean"
        subtitle={`${registrations.length} pendaftaran hari ini`}
        action={canWrite && (
          <button onClick={openModal} className="btn btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Daftarkan Pasien
          </button>
        )}
      />

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-600 flex-shrink-0">Status:</span>
        <div className="relative">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pr-8 text-xs py-1.5 min-w-[180px]"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading
          ? <LoadingSpinner label="Memuat antrean hari ini..." />
          : registrations.length === 0
            ? <EmptyState
                icon={ClipboardList}
                title="Belum ada pendaftaran hari ini"
                description="Klik 'Daftarkan Pasien' untuk membuat pendaftaran dan nomor antrean baru."
                action={canWrite && <button onClick={openModal} className="btn btn-primary btn-sm">Daftar Sekarang</button>}
              />
            : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Antrean</th>
                      <th>No. Registrasi</th>
                      <th>Pasien</th>
                      <th>Dokter / Poli</th>
                      <th>Pembayaran</th>
                      <th>Status</th>
                      {canWrite && <th className="text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id}>
                        <td>
                          <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-lg shadow-sm border border-emerald-200">
                            {reg.queue?.queue_number || '-'}
                          </span>
                        </td>
                        <td className="font-bold text-slate-700 text-xs tracking-wide">{reg.registration_number}</td>
                        <td>
                          <div className="font-bold text-slate-900 text-sm mb-0.5">{reg.patient?.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{reg.patient?.medical_record_number}</div>
                        </td>
                        <td className="text-slate-700">
                          <div className="text-xs font-bold text-slate-800 mb-0.5">{reg.doctor?.name}</div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase">{reg.policlinic?.name}</div>
                        </td>
                        <td>
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {reg.payment_type}
                          </span>
                        </td>
                        <td><StatusBadge status={reg.status} paymentStatus={reg.payment?.payment_status} /></td>
                        {canWrite && (
                          <td>
                            <div className="flex items-center justify-end gap-1">
                              {reg.status === 'WAITING' && (
                                <>
                                  <button
                                    onClick={() => handleStatus(reg.id, 'CHECKED_IN')}
                                    className="btn btn-sm text-xs bg-indigo-600 text-white hover:bg-indigo-700 border-transparent"
                                  >
                                    Panggil
                                  </button>
                                  <button
                                    onClick={() => handleStatus(reg.id, 'CANCELLED')}
                                    className="btn btn-danger btn-sm text-xs"
                                  >
                                    Batal
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>

      {/* Add Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Daftarkan Pasien Baru"
        subtitle="Isi formulir pendaftaran — nomor antrean akan dibuat otomatis"
        footer={
          <>
            <button onClick={() => setModal(false)} className="btn btn-secondary">Batal</button>
            <button form="form-reg" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Memproses...' : 'Buat Pendaftaran & Antrean'}
            </button>
          </>
        }
      >
        <form id="form-reg" onSubmit={handleSubmit} className="space-y-3">
          {formError && <Alert type="error">{formError}</Alert>}

          <FormField label="Pilih Pasien" required>
            <Select
              required
              value={formData.patient_id}
              onChange={e => setFormData(p => ({ ...p, patient_id: e.target.value }))}
            >
              <option value="">-- Pilih Pasien --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.medical_record_number})</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Poliklinik Tujuan" required>
            <Select
              required
              value={formData.policlinic_id}
              onChange={e => setFormData(p => ({ ...p, policlinic_id: e.target.value, doctor_id: '' }))}
            >
              <option value="">-- Pilih Poli --</option>
              {policlinics.map(pol => (
                <option key={pol.id} value={pol.id}>{pol.name} ({pol.code})</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Dokter Bertugas" required>
            <Select
              required
              disabled={!formData.policlinic_id}
              value={formData.doctor_id}
              onChange={e => setFormData(p => ({ ...p, doctor_id: e.target.value }))}
            >
              <option value="">{formData.policlinic_id ? '-- Pilih Dokter --' : '-- Pilih poli dahulu --'}</option>
              {filteredDoctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Jenis Pembayaran" required>
              <Select
                value={formData.payment_type}
                onChange={e => setFormData(p => ({ ...p, payment_type: e.target.value }))}
              >
                {PAYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Tanggal Kunjungan" required>
              <Input
                type="date"
                required
                value={formData.visit_date}
                onChange={e => setFormData(p => ({ ...p, visit_date: e.target.value }))}
              />
            </FormField>
          </div>

          <FormField label="Keluhan Awal Pasien" required>
            <Textarea
              required
              rows={2}
              value={formData.initial_complaint}
              onChange={e => setFormData(p => ({ ...p, initial_complaint: e.target.value }))}
              placeholder="Deskripsikan keluhan utama pasien saat mendaftar..."
            />
          </FormField>
        </form>
      </Modal>
    </>
  );
};

export default RegistrationsPage;
