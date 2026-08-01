import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LoadingSpinner, EmptyState, Modal, Alert, RoleBadge,
  FormField, Input, Select, PageHeader,
} from '../components/common/UIComponents';
import { Plus, Edit2, UserCheck, Stethoscope, Search, Mail, Phone } from 'lucide-react';

const SPECIALIZATIONS = [
  'Dokter Umum', 'Dokter Spesialis Anak', 'Dokter Spesialis Penyakit Dalam',
  'Dokter Spesialis Bedah', 'Dokter Gigi', 'Dokter Spesialis Kulit',
  'Dokter Spesialis Kandungan', 'Dokter Spesialis Jantung', 'Dokter Spesialis Mata',
  'Dokter Spesialis THT', 'Dokter Spesialis Paru', 'Lainnya',
];

const emptyForm = () => ({
  name: '', email: '', password: '', specialization: 'Dokter Umum',
  phone: '', policlinic_id: '', is_active: true,
});

const DoctorsPage = () => {
  const { isAdmin } = useAuth();

  const [doctors, setDoctors]       = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [policlinics, setPoliclinics] = useState([]);

  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [formData, setFormData]     = useState(emptyForm());
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const [docRes, poliRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/policlinics/active'),
      ]);
      if (docRes.data.success) {
        const raw = docRes.data.data;
        const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setDoctors(items);
        setFiltered(items);
      }
      if (poliRes.data.success) {
        const raw = poliRes.data.data;
        setPoliclinics(Array.isArray(raw) ? raw : (raw?.items ?? []));
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(doctors); return; }
    const q = search.toLowerCase();
    setFiltered(doctors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q)
    ));
  }, [search, doctors]);

  const openAdd = () => { setFormData(emptyForm()); setFormError(''); setModal('add'); };
  const openEdit = (d) => {
    setSelected(d);
    setFormData({ name: d.name, email: d.email, password: '', specialization: d.specialization || 'Dokter Umum', phone: d.phone || '', policlinic_id: d.policlinic_id || '', is_active: d.is_active });
    setFormError('');
    setModal('edit');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    const payload = { ...formData };
    if (!payload.phone) delete payload.phone;
    payload.policlinic_id = Number(payload.policlinic_id);
    try {
      await api.post('/doctors', payload);
      setModal(null); fetchDoctors();
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.errors && Object.keys(data.errors).length > 0
        ? Object.values(data.errors).join(', ')
        : data?.message || 'Gagal menambah dokter.';
      setFormError(errorMsg);
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    const payload = { ...formData };
    if (!payload.password) delete payload.password;
    if (!payload.phone) delete payload.phone;
    payload.policlinic_id = Number(payload.policlinic_id);
    try {
      await api.put(`/doctors/${selected.id}`, payload);
      setModal(null); fetchDoctors();
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.errors && Object.keys(data.errors).length > 0
        ? Object.values(data.errors).join(', ')
        : data?.message || 'Gagal memperbarui dokter.';
      setFormError(errorMsg);
    } finally { setSubmitting(false); }
  };

  const DoctorForm = ({ isEdit }) => (
    <div className="space-y-3">
      {formError && <Alert type="error">{formError}</Alert>}
      <FormField label="Nama Lengkap" required>
        <Input required value={formData.name}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          placeholder="dr. Adi Santoso, Sp.PD" />
      </FormField>
      <FormField label="Email Login" required>
        <Input type="email" required value={formData.email}
          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
          placeholder="dokter@clinica.com" />
      </FormField>
      <FormField label={isEdit ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'} required={!isEdit}>
        <Input type="password" required={!isEdit} value={formData.password}
          onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="Minimal 8 karakter, wajib mengandung huruf besar, huruf kecil, dan angka."
          placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Min 8 kar, huruf besar, kecil & angka'} />
      </FormField>
      <FormField label="Spesialisasi" required>
        <Select value={formData.specialization}
          onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))}>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Poliklinik" required>
          <Select required value={formData.policlinic_id}
            onChange={e => setFormData(p => ({ ...p, policlinic_id: e.target.value }))}>
            <option value="">-- Pilih Poli --</option>
            {policlinics.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Status">
          <Select value={formData.is_active ? 'true' : 'false'}
            onChange={e => setFormData(p => ({ ...p, is_active: e.target.value === 'true' }))}>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </Select>
        </FormField>
      </div>
      <FormField label="No. Telepon (Opsional)">
        <Input type="text" value={formData.phone}
          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
          placeholder="08123456789" />
      </FormField>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Data Dokter"
        subtitle={`${doctors.length} dokter terdaftar`}
        action={isAdmin && (
          <button onClick={openAdd} className="btn btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Tambah Dokter
          </button>
        )}
      />

      <div className="mb-4">
        <div className="search-wrapper max-w-sm">
          <Search className="search-icon w-4 h-4" />
          <input type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau spesialisasi..."
            className="search-input" />
        </div>
      </div>

      {loading
        ? <LoadingSpinner />
        : filtered.length === 0
          ? <EmptyState icon={UserCheck} title="Dokter tidak ditemukan" description="Belum ada dokter yang terdaftar." />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(d => (
                <div key={d.id} className={`card hover:-translate-y-0.5 hover:shadow-md transition ${!d.is_active ? 'opacity-60' : ''}`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                        {d.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`badge text-[10px] ${d.is_active ? 'badge-done' : 'badge-cancelled'}`}>
                          {d.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {isAdmin && (
                          <button onClick={() => openEdit(d)} className="btn btn-ghost btn-icon btn-sm">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 font-bold text-slate-900 text-sm leading-tight">{d.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Stethoscope className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs text-emerald-700 font-semibold">{d.specialization}</span>
                    </div>
                    {d.policlinic && (
                      <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                        <span className="text-slate-400">Poli:</span> {d.policlinic.name}
                      </div>
                    )}
                    <div className="divider !my-3" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{d.email}</span>
                      </div>
                      {d.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {d.phone}
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <RoleBadge role="DOCTOR" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {/* Add Modal */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)}
        title="Tambah Dokter" subtitle="Tambah akun dokter dengan akses login"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn btn-secondary">Batal</button>
            <button form="form-doc-add" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan Dokter'}
            </button>
          </>
        }
      >
        <form id="form-doc-add" onSubmit={handleAdd}>{DoctorForm({ isEdit: false })}</form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal === 'edit'} onClose={() => setModal(null)}
        title="Edit Data Dokter" subtitle={selected?.name}
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn btn-secondary">Batal</button>
            <button form="form-doc-edit" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Update Data'}
            </button>
          </>
        }
      >
        <form id="form-doc-edit" onSubmit={handleEdit}>{DoctorForm({ isEdit: true })}</form>
      </Modal>
    </>
  );
};

export default DoctorsPage;
