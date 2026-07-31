import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LoadingSpinner, EmptyState, Modal, Alert,
  FormField, Input, Select, Textarea, PageHeader,
} from '../components/common/UIComponents';
import { Plus, Edit2, Building2, Hash, ToggleLeft, ToggleRight, Search } from 'lucide-react';

const emptyForm = () => ({ code: '', name: '', description: '', is_active: true });

const PoliclinicsPage = () => {
  const { isAdmin } = useAuth();

  const [polis, setPolis] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPoliclinics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/policlinics');
      if (res.data.success) {
        // Safety: handle both plain array and paginated { items } shape
        const raw = res.data.data;
        const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
        setPolis(items);
        setFiltered(items);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPoliclinics(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(polis); return; }
    const q = search.toLowerCase();
    setFiltered(polis.filter(p =>
      p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    ));
  }, [search, polis]);

  const openAdd = () => { setFormData(emptyForm()); setFormError(''); setModal('add'); };
  const openEdit = (p) => {
    setSelected(p);
    setFormData({ code: p.code, name: p.name, description: p.description || '', is_active: p.is_active });
    setFormError('');
    setModal('edit');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post('/policlinics', formData);
      setModal(null); fetchPoliclinics();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menambah poliklinik.');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.put(`/policlinics/${selected.id}`, formData);
      setModal(null); fetchPoliclinics();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal memperbarui poliklinik.');
    } finally { setSubmitting(false); }
  };

  const PoliForm = () => (
    <div className="space-y-3">
      {formError && <Alert type="error">{formError}</Alert>}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Kode Poli" required>
          <Input required value={formData.code}
            onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
            placeholder="UMUM" />
        </FormField>
        <FormField label="Status">
          <Select value={formData.is_active ? 'true' : 'false'}
            onChange={e => setFormData(p => ({ ...p, is_active: e.target.value === 'true' }))}>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Nama Poliklinik" required>
        <Input required value={formData.name}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          placeholder="Poli Umum" />
      </FormField>
      <FormField label="Deskripsi (Opsional)">
        <Textarea rows={2} value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
          placeholder="Layanan umum untuk semua penyakit ringan..." />
      </FormField>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Data Poliklinik"
        subtitle={`${polis.length} poliklinik terdaftar`}
        action={isAdmin && (
          <button onClick={openAdd} className="btn btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Tambah Poli
          </button>
        )}
      />

      {/* Search */}
      <div className="mb-4">
        <div className="search-wrapper max-w-sm">
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari kode atau nama poli..."
            className="search-input"
          />
        </div>
      </div>

      {/* Grid */}
      {loading
        ? <LoadingSpinner />
        : filtered.length === 0
          ? <EmptyState icon={Building2} title="Tidak ada poliklinik" description="Belum ada data poliklinik yang tersedia." />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(p => (
                <div key={p.id} className={`card transition hover:-translate-y-0.5 hover:shadow-md ${!p.is_active ? 'opacity-60' : ''}`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge text-[10px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'badge-done' : 'badge-cancelled'}`}>
                          {p.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        {isAdmin && (
                          <button onClick={() => openEdit(p)} className="btn btn-ghost btn-icon btn-sm">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        <Hash className="w-3 h-3" />
                        {p.code}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {/* Add Modal */}
      <Modal
        open={modal === 'add'}
        onClose={() => setModal(null)}
        title="Tambah Poliklinik"
        subtitle="Tambah unit layanan poliklinik baru"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn btn-secondary">Batal</button>
            <button form="form-poli-add" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan Poli'}
            </button>
          </>
        }
      >
        <form id="form-poli-add" onSubmit={handleAdd}><PoliForm /></form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={modal === 'edit'}
        onClose={() => setModal(null)}
        title="Edit Poliklinik"
        subtitle={`Kode: ${selected?.code}`}
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn btn-secondary">Batal</button>
            <button form="form-poli-edit" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Update Data'}
            </button>
          </>
        }
      >
        <form id="form-poli-edit" onSubmit={handleEdit}><PoliForm /></form>
      </Modal>
    </>
  );
};

export default PoliclinicsPage;
