import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LoadingSpinner, Pagination, StatusBadge, EmptyState,
  Modal, Alert, FormField, Input, Select, Textarea, PageHeader,
} from '../components/common/UIComponents';
import { Search, Plus, Edit2, History, Users, Phone, AlertTriangle } from 'lucide-react';

// ---- Patient Form (shared Add & Edit) ----
const PatientForm = ({ formData, setFormData, error, lockNik = false }) => (
  <div className="space-y-3">
    {error && <Alert type="error">{error}</Alert>}

    <FormField label="NIK (16 Digit)" required>
      <Input
        type="text"
        required
        maxLength={16}
        disabled={lockNik}
        value={formData.nik}
        onChange={e => setFormData(p => ({ ...p, nik: e.target.value }))}
        placeholder="3273012506980006"
        error={!lockNik && formData.nik && formData.nik.length !== 16 ? 'Harus 16 digit' : ''}
      />
    </FormField>

    <FormField label="Nama Lengkap" required>
      <Input
        type="text"
        required
        value={formData.name}
        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
        placeholder="Nama sesuai KTP"
      />
    </FormField>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FormField label="Jenis Kelamin" required>
        <Select
          value={formData.gender}
          onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}
        >
          <option value="MALE">Laki-laki</option>
          <option value="FEMALE">Perempuan</option>
        </Select>
      </FormField>
      <FormField label="Tanggal Lahir" required>
        <Input
          type="date"
          required
          value={formData.birth_date}
          onChange={e => setFormData(p => ({ ...p, birth_date: e.target.value }))}
        />
      </FormField>
    </div>

    <FormField label="No. Telepon / WhatsApp" required>
      <Input
        type="text"
        required
        value={formData.phone}
        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
        placeholder="08123456789"
      />
    </FormField>

    <FormField label="Alamat Lengkap" required>
      <Textarea
        required
        value={formData.address}
        onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
        placeholder="Jl. Merdeka No. 10, Kota"
        rows={2}
      />
    </FormField>
  </div>
);

const emptyForm = () => ({ nik: '', name: '', gender: 'MALE', birth_date: '', phone: '', address: '' });

const PatientsPage = () => {
  const { isAdmin, isOfficer } = useAuth();
  const toast = useToast();
  const canWrite = isAdmin || isOfficer;

  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'history'
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/patients', { params: { page, limit: 10, search: search || undefined } });
      if (res.data.success) {
        setPatients(res.data.data.items);
        setPagination(res.data.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(1), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setFormData(emptyForm()); setFormError(''); setModal('add'); };

  const openEdit = (p) => {
    setSelected(p);
    setFormData({ nik: p.nik, name: p.name, gender: p.gender, birth_date: p.birth_date, phone: p.phone, address: p.address });
    setFormError('');
    setModal('edit');
  };

  const openHistory = async (p) => {
    setSelected(p);
    setModal('history');
    setHistLoading(true);
    try {
      const res = await api.get(`/patients/${p.id}/history`);
      setHistory(res.data.data?.items || []);
    } finally {
      setHistLoading(false);
    }
  };

  const closeModal = () => setModal(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post('/patients', formData);
      toast.success('Data pasien baru berhasil ditambahkan!');
      closeModal(); fetchPatients(1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan data pasien.';
      setFormError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.put(`/patients/${selected.id}`, { name: formData.name, gender: formData.gender, birth_date: formData.birth_date, phone: formData.phone, address: formData.address });
      toast.success('Data pasien berhasil diperbarui!');
      closeModal(); fetchPatients(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui data pasien.';
      setFormError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <PageHeader
        title="Data Pasien"
        subtitle={`${pagination.totalItems} pasien terdaftar`}
        action={canWrite && (
          <button onClick={openAdd} className="btn btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Pasien Baru
          </button>
        )}
      />

      {/* Search bar */}
      <div className="mb-4">
        <div className="search-wrapper max-w-md">
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari NIK, nama, No. RM, atau telepon..."
            className="search-input"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading
          ? <LoadingSpinner label="Memuat daftar pasien..." />
          : patients.length === 0
            ? <EmptyState
                icon={Users}
                title="Pasien tidak ditemukan"
                description={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada pasien terdaftar.'}
                action={canWrite && <button onClick={openAdd} className="btn btn-primary btn-sm">Tambah Pasien</button>}
              />
            : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>No. RM</th>
                      <th>Nama & NIK</th>
                      <th>Kelamin / Lahir</th>
                      <th>Kontak</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id}>
                        <td>
                          <span className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md border border-indigo-100">
                            {p.medical_record_number}
                          </span>
                        </td>
                        <td>
                          <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{p.nik}</div>
                        </td>
                        <td className="text-slate-600">
                          <div className="text-xs">{p.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</div>
                          <div className="text-xs text-slate-400">{p.birth_date}</div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {p.phone}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openHistory(p)}
                              className="btn btn-ghost btn-icon btn-sm"
                              title="Riwayat Rekam Medis"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            {canWrite && (
                              <button
                                onClick={() => openEdit(p)}
                                className="btn btn-ghost btn-icon btn-sm"
                                title="Edit Data"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={p => fetchPatients(p)}
        />
      </div>

      {/* Add Modal */}
      <Modal
        open={modal === 'add'}
        onClose={closeModal}
        title="Daftarkan Pasien Baru"
        subtitle="Isi data sesuai KTP / identitas resmi pasien"
        footer={
          <>
            <button onClick={closeModal} className="btn btn-secondary">Batal</button>
            <button form="form-add-patient" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan Pasien'}
            </button>
          </>
        }
      >
        <form id="form-add-patient" onSubmit={handleAdd}>
          <PatientForm formData={formData} setFormData={setFormData} error={formError} />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={modal === 'edit'}
        onClose={closeModal}
        title="Edit Data Pasien"
        subtitle={`No. RM: ${selected?.medical_record_number}`}
        footer={
          <>
            <button onClick={closeModal} className="btn btn-secondary">Batal</button>
            <button form="form-edit-patient" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Memperbarui...' : 'Update Data'}
            </button>
          </>
        }
      >
        <form id="form-edit-patient" onSubmit={handleEdit}>
          <PatientForm formData={formData} setFormData={setFormData} error={formError} lockNik />
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        open={modal === 'history'}
        onClose={closeModal}
        title={`Riwayat: ${selected?.name}`}
        subtitle={`RM: ${selected?.medical_record_number} · NIK: ${selected?.nik}`}
        size="lg"
      >
        {histLoading
          ? <LoadingSpinner label="Memuat riwayat rekam medis..." />
          : history.length === 0
            ? <EmptyState title="Belum ada rekam medis" description="Pasien ini belum memiliki riwayat pemeriksaan." />
            : (
              <div className="space-y-4">
                {history.map(rec => (
                  <div key={rec.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* Record header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{rec.examination_date?.split('T')[0]}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span className="text-xs font-semibold text-emerald-700">{rec.doctor?.name}</span>
                      </div>
                      <StatusBadge status={rec.registration?.status} paymentStatus={rec.registration?.payment?.payment_status} />
                    </div>
                    {/* SOAP */}
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">SOAP</div>
                          <div className="text-xs space-y-1">
                            <div><span className="font-semibold text-slate-600">S:</span> <span className="text-slate-800">{rec.subjective}</span></div>
                            <div><span className="font-semibold text-emerald-700">A:</span> <span className="text-slate-800 font-medium">{rec.assessment}</span></div>
                            <div><span className="font-semibold text-slate-600">P:</span> <span className="text-slate-700">{rec.plan}</span></div>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tanda Vital</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-700">
                            {[
                              ['TD', rec.blood_pressure],
                              ['Suhu', rec.body_temperature ? `${rec.body_temperature}°C` : null],
                              ['BB', rec.weight ? `${rec.weight} kg` : null],
                              ['TB', rec.height ? `${rec.height} cm` : null],
                            ].map(([k, v]) => (
                              <div key={k}><span className="font-medium text-slate-500">{k}:</span> {v || '-'}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {rec.prescription?.details?.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                          <div className="text-[10px] font-bold text-indigo-700 uppercase mb-1.5">Resep Obat</div>
                          <ul className="space-y-1">
                            {rec.prescription.details.map(d => (
                              <li key={d.id} className="text-xs text-indigo-900">
                                <span className="font-semibold">{d.medicine?.name}</span>
                                {' '}&mdash; {d.dosage} {d.frequency} &times; {d.quantity} {d.medicine?.unit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
        }
      </Modal>
    </>
  );
};

export default PatientsPage;
