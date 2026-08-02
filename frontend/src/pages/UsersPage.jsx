import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  LoadingSpinner, StatusBadge, EmptyState, Modal,
  Alert, FormField, Input, Select, PageHeader, Pagination,
} from '../components/common/UIComponents';
import { UserCheck, Plus, Search, Shield, Edit, UserX } from 'lucide-react';

const emptyUser = () => ({
  username: '',
  full_name: '',
  password: '',
  role: 'ADMIN',
  is_active: true,
});

const UsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyUser());
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setUsers(res.data.data.items);
        setTotalPages(res.data.data.totalPages);
        setTotalItems(res.data.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd = () => {
    setEditingUser(null);
    setFormData(emptyUser());
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      full_name: u.full_name,
      password: '', // leave empty to keep unchanged
      role: u.role,
      is_active: u.is_active,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        toast.success(`Data akun ${formData.full_name} berhasil diperbarui!`);
      } else {
        await api.post('/users', formData);
        toast.success(`Akun pengguna ${formData.full_name} berhasil dibuat!`);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.errors && Object.keys(data.errors).length > 0
        ? Object.values(data.errors).join(', ')
        : data?.message || 'Gagal menyimpan data akun.';
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally { setSubmitting(false); }
  };

  const toggleDeactivate = (u) => {
    const actionText = u.is_active ? 'nonaktifkan' : 'aktifkan';
    toast.confirm({
      title: `${u.is_active ? 'Nonaktifkan' : 'Aktifkan'} Akun`,
      message: `Yakin ingin ${actionText} akun pengguna "${u.full_name}"?`,
      confirmText: `Ya, ${actionText}`,
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          await api.put(`/users/${u.id}`, { is_active: !u.is_active });
          toast.success(`Status akun ${u.full_name} berhasil diubah!`);
          fetchUsers();
        } catch (err) {
          const msg = err.response?.data?.message || 'Gagal mengubah status user.';
          toast.error(msg);
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manajemen User Pengguna"
        subtitle="Kelola akun admin, dokter, apoteker, dan kasir klinik"
        action={
          <button onClick={openAdd} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Tambah User
          </button>
        }
      />

      {/* Search Filter */}
      <div className="card p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari username atau nama penguna..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Tidak ada data pengguna"
            description="Belum ada user yang terdaftar dalam sistem."
          />
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Nama Lengkap</th>
                    <th>Role (Peran)</th>
                    <th>Status Akun</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="font-bold text-slate-900">{u.username}</td>
                      <td>{u.full_name}</td>
                      <td>
                        <span className="badge badge-poly uppercase text-[10px] font-extrabold tracking-wider">
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-done' : 'badge-cancel'}`}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(u)}
                            className="btn btn-secondary btn-sm btn-icon"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleDeactivate(u)}
                            className={`btn btn-sm btn-icon ${u.is_active ? 'btn-danger' : 'btn-secondary text-emerald-600'}`}
                            title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User Pengguna' : 'Tambah User Baru'}
        subtitle="Kelola kredensial dan hak akses pengguna"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn btn-secondary">Batal</button>
            <button form="form-user" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </>
        }
      >
        <form id="form-user" onSubmit={handleSubmit} className="space-y-3">
          {formError && <Alert type="error">{formError}</Alert>}
          <FormField label="Username" required>
            <Input
              required
              value={formData.username}
              onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
              placeholder="Contoh: admin01"
            />
          </FormField>
          <FormField label="Nama Lengkap" required>
            <Input
              required
              value={formData.full_name}
              onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Contoh: Ahmad Subagyo"
            />
          </FormField>
          <FormField label={editingUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'} required={!editingUser}>
            <Input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Minimal 8 karakter, wajib mengandung huruf besar, huruf kecil, dan angka."
            />
          </FormField>
          <FormField label="Role / Hak Akses" required>
            <Select
              value={formData.role}
              onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="PHARMACIST">PHARMACIST</option>
              <option value="CASHIER">CASHIER</option>
            </Select>
          </FormField>
          {editingUser && (
            <FormField label="Status Akun">
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.value === 'true' }))}
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </Select>
            </FormField>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
