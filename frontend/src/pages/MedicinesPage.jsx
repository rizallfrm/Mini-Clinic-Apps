import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LoadingSpinner, Pagination, EmptyState, Modal, Alert,
  FormField, Input, Select, Textarea, PageHeader,
} from '../components/common/UIComponents';
import { Plus, Edit2, PackagePlus, AlertTriangle, Search, Pill } from 'lucide-react';

const CATEGORIES = ['Analgesik', 'Antibiotik', 'Antihipertensi', 'Antidiabetik', 'Vitamin', 'Antiseptik', 'Antiinflamasi', 'Lainnya'];
const UNITS      = ['Tablet', 'Kapsul', 'Botol', 'Strip', 'Ampul', 'Sachet', 'Tube', 'Vial', 'Pcs'];

const emptyForm     = () => ({ name: '', category: 'Lainnya', unit: 'Tablet', price: '', stock: '', min_stock: 20, description: '' });
const emptyAdjForm  = () => ({ type: 'IN', quantity: '', notes: '' });

const MedicinesPage = () => {
  const { isAdmin, isDoctor } = useAuth();
  const canWrite = isAdmin;

  const [medicines, setMedicines]   = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);

  const [modal, setModal]           = useState(null); // 'add' | 'edit' | 'adj'
  const [selected, setSelected]     = useState(null);
  const [formData, setFormData]     = useState(emptyForm());
  const [adjForm, setAdjForm]       = useState(emptyAdjForm());
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMedicines = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/medicines', { params: { page, limit: 12, search: search || undefined } });
      if (res.data.success) {
        setMedicines(res.data.data.items);
        setPagination(res.data.data.pagination);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchMedicines(1), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setFormData(emptyForm()); setFormError(''); setModal('add'); };
  const openEdit = (m) => {
    setSelected(m);
    setFormData({ name: m.name, category: m.category, unit: m.unit, price: m.price, stock: m.stock, min_stock: m.min_stock, description: m.description || '' });
    setFormError('');
    setModal('edit');
  };
  const openAdj = (m) => { setSelected(m); setAdjForm(emptyAdjForm()); setFormError(''); setModal('adj'); };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post('/medicines', { ...formData, price: Number(formData.price), stock: Number(formData.stock), min_stock: Number(formData.min_stock) });
      setModal(null); fetchMedicines(1);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan obat.');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.put(`/medicines/${selected.id}`, { ...formData, price: Number(formData.price), stock: Number(formData.stock), min_stock: Number(formData.min_stock) });
      setModal(null); fetchMedicines(pagination.page);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal memperbarui obat.');
    } finally { setSubmitting(false); }
  };

  const handleAdj = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post(`/medicines/${selected.id}/stock`, { ...adjForm, quantity: Number(adjForm.quantity) });
      setModal(null); fetchMedicines(pagination.page);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyesuaikan stok.');
    } finally { setSubmitting(false); }
  };

  const isLowStock = (m) => m.stock <= m.min_stock;

  const MedForm = () => (
    <div className="space-y-3">
      {formError && <Alert type="error">{formError}</Alert>}
      <FormField label="Nama Obat" required>
        <Input required value={formData.name}
          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
          placeholder="Paracetamol 500mg" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Kategori" required>
          <Select value={formData.category}
            onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </FormField>
        <FormField label="Satuan" required>
          <Select value={formData.unit}
            onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Harga (Rp)" required>
          <Input type="number" required min="0" value={formData.price}
            onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
            placeholder="5000" />
        </FormField>
        <FormField label="Stok Awal" required>
          <Input type="number" required min="0" value={formData.stock}
            onChange={e => setFormData(p => ({ ...p, stock: e.target.value }))}
            placeholder="100" />
        </FormField>
        <FormField label="Stok Minimum">
          <Input type="number" min="0" value={formData.min_stock}
            onChange={e => setFormData(p => ({ ...p, min_stock: e.target.value }))}
            placeholder="20" />
        </FormField>
      </div>
      <FormField label="Deskripsi (Opsional)">
        <Textarea rows={2} value={formData.description}
          onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
          placeholder="Indikasi, kontraindikasi, dll." />
      </FormField>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Stok Obat"
        subtitle={`${pagination.totalItems} jenis obat tersedia`}
        action={canWrite && (
          <button onClick={openAdd} className="btn btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Tambah Obat
          </button>
        )}
      />

      {/* Search */}
      <div className="mb-4">
        <div className="search-wrapper max-w-sm">
          <Search className="search-icon w-4 h-4" />
          <input type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama obat atau kategori..."
            className="search-input" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading
          ? <LoadingSpinner />
          : medicines.length === 0
            ? <EmptyState icon={Pill} title="Obat tidak ditemukan" description={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada data obat.'} />
            : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nama & Kategori</th>
                      <th className="hidden md:table-cell">Satuan</th>
                      <th className="hidden sm:table-cell">Harga</th>
                      <th>Stok</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map(m => (
                      <tr key={m.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isLowStock(m) ? 'bg-amber-100' : 'bg-indigo-50'}`}>
                              <Pill className={`w-4 h-4 ${isLowStock(m) ? 'text-amber-600' : 'text-indigo-600'}`} />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                              <div className="text-xs text-slate-400">{m.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell text-slate-600 text-xs">{m.unit}</td>
                        <td className="hidden sm:table-cell">
                          <span className="text-sm font-semibold text-slate-800">
                            Rp {(parseFloat(m.price) || 0).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {isLowStock(m) && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            )}
                            <span className={`font-bold text-sm ${isLowStock(m) ? 'text-amber-700' : 'text-slate-800'}`}>
                              {m.stock}
                            </span>
                            <span className="text-xs text-slate-400">{m.unit}</span>
                          </div>
                          {isLowStock(m) && (
                            <div className="text-[10px] text-amber-600 font-medium">Stok menipis!</div>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {canWrite && (
                              <>
                                <button
                                  onClick={() => openAdj(m)}
                                  className="btn btn-ghost btn-icon btn-sm"
                                  title="Penyesuaian Stok"
                                >
                                  <PackagePlus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEdit(m)}
                                  className="btn btn-ghost btn-icon btn-sm"
                                  title="Edit Obat"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </>
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
          onPageChange={p => fetchMedicines(p)}
        />
      </div>

      {/* Add Modal */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)}
        title="Tambah Obat" subtitle="Daftarkan obat baru ke inventaris"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn btn-secondary">Batal</button>
            <button form="form-med-add" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan Obat'}
            </button>
          </>
        }
      >
        <form id="form-med-add" onSubmit={handleAdd}><MedForm /></form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal === 'edit'} onClose={() => setModal(null)}
        title="Edit Data Obat" subtitle={selected?.name}
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn btn-secondary">Batal</button>
            <button form="form-med-edit" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Update Data'}
            </button>
          </>
        }
      >
        <form id="form-med-edit" onSubmit={handleEdit}><MedForm /></form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal open={modal === 'adj'} onClose={() => setModal(null)}
        title="Penyesuaian Stok"
        subtitle={`${selected?.name} — Stok saat ini: ${selected?.stock} ${selected?.unit}`}
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn btn-secondary">Batal</button>
            <button form="form-adj" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
            </button>
          </>
        }
      >
        <form id="form-adj" onSubmit={handleAdj} className="space-y-3">
          {formError && <Alert type="error">{formError}</Alert>}
          <FormField label="Tipe Penyesuaian" required>
            <Select value={adjForm.type}
              onChange={e => setAdjForm(p => ({ ...p, type: e.target.value }))}>
              <option value="IN">Stok Masuk (Tambah)</option>
              <option value="OUT">Stok Keluar (Kurangi)</option>
              <option value="CORRECTION">Koreksi / Opname</option>
            </Select>
          </FormField>
          <FormField label="Jumlah" required>
            <Input type="number" required min="1" value={adjForm.quantity}
              onChange={e => setAdjForm(p => ({ ...p, quantity: e.target.value }))}
              placeholder="Masukkan jumlah unit" />
          </FormField>
          <FormField label="Catatan / Keterangan">
            <Textarea rows={2} value={adjForm.notes}
              onChange={e => setAdjForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Alasan penyesuaian stok..." />
          </FormField>
        </form>
      </Modal>
    </>
  );
};

export default MedicinesPage;
