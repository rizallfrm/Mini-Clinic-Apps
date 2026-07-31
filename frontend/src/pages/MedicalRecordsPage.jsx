import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LoadingSpinner, StatusBadge, EmptyState, Modal,
  Alert, FormField, Input, Select, Textarea, PageHeader,
} from '../components/common/UIComponents';
import { Stethoscope, Plus, Trash2, ClipboardList, Pill, Printer, CheckCircle2 } from 'lucide-react';

const emptySOAP = () => ({
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
  blood_pressure: '',
  body_temperature: '',
  weight: '',
  height: '',
  pulse: '',
  notes: '',
});

const emptyRx = () => ({ medicine_id: '', dosage: '', frequency: '', quantity: '', notes: '' });

const MedicalRecordsPage = () => {
  const { isAdmin, isDoctor } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const [showSOAPModal, setShowSOAPModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);

  const [soapData, setSoapData] = useState(emptySOAP());
  const [rxDetails, setRxDetails] = useState([emptyRx()]);
  const [medicines, setMedicines] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const canExamine = isAdmin || isDoctor;

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/registrations/today');
      if (res.data.success) {
        const active = res.data.data.filter(r =>
          ['CHECKED_IN', 'EXAMINATION'].includes(r.status)
        );
        setRegistrations(res.data.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const selectPatient = async (reg) => {
    setSelected(reg);
    setExistingRecord(null);
    setLoadingRecord(true);
    try {
      const res = await api.get(`/medical-records/by-registration/${reg.id}`);
      if (res.data.success && res.data.data) {
        setExistingRecord(res.data.data);
      }
    } catch { /* not found */ }
    finally { setLoadingRecord(false); }
  };

  const openSOAP = async () => {
    setSoapData(emptySOAP());
    setFormError('');
    if (existingRecord) {
      setSoapData({
        subjective:       existingRecord.subjective || '',
        objective:        existingRecord.objective  || '',
        assessment:       existingRecord.assessment || '',
        plan:             existingRecord.plan       || '',
        blood_pressure:   existingRecord.blood_pressure || '',
        body_temperature: existingRecord.body_temperature || '',
        weight:           existingRecord.weight || '',
        height:           existingRecord.height || '',
        pulse:            existingRecord.pulse  || '',
        notes:            existingRecord.notes  || '',
      });
    }
    setShowSOAPModal(true);
  };

  const handleSOAP = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      const payload = {
        subjective: soapData.subjective ? soapData.subjective.trim() : '',
        objective: soapData.objective ? soapData.objective.trim() : undefined,
        assessment: soapData.assessment ? soapData.assessment.trim() : '',
        plan: soapData.plan ? soapData.plan.trim() : '',
        blood_pressure: soapData.blood_pressure ? soapData.blood_pressure.trim() : undefined,
        body_temperature: soapData.body_temperature ? parseFloat(soapData.body_temperature) : undefined,
        weight: soapData.weight ? parseFloat(soapData.weight) : undefined,
        height: soapData.height ? parseFloat(soapData.height) : undefined,
        pulse: soapData.pulse ? parseInt(soapData.pulse) : undefined,
        notes: soapData.notes ? soapData.notes.trim() : undefined,
      };

      if (existingRecord) {
        await api.put(`/medical-records/${existingRecord.id}`, payload);
      } else {
        await api.post('/medical-records', {
          ...payload,
          registration_id: Number(selected.id),
        });
      }
      setShowSOAPModal(false);
      await fetchRegistrations();
      await selectPatient(selected);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
        setFormError(Object.values(data.errors).join(' · '));
      } else {
        setFormError(data?.message || 'Gagal menyimpan SOAP.');
      }
    } finally { setSubmitting(false); }
  };

  const openRx = async () => {
    setRxDetails([emptyRx()]);
    setFormError('');
    try {
      const res = await api.get('/medicines?limit=200');
      if (res.data.success) setMedicines(res.data.data.items);
    } catch { /* silent */ }
    setShowRxModal(true);
  };

  const handleRx = async (e) => {
    e.preventDefault();
    setFormError(''); setSubmitting(true);
    try {
      await api.post('/prescriptions', {
        registration_id: selected.id,
        details: rxDetails.map(d => ({
          medicine_id: Number(d.medicine_id),
          dosage: d.dosage,
          frequency: d.frequency,
          quantity: Number(d.quantity),
          notes: d.notes,
        })),
      });
      setShowRxModal(false);
      await selectPatient(selected);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan resep.');
    } finally { setSubmitting(false); }
  };

  const handleCompleteRecord = async () => {
    if (!existingRecord?.id) return;
    if (!window.confirm('Yakin ingin menyelesaikan pemeriksaan untuk pasien ini? Status antrean dan registrasi akan diubah menjadi COMPLETED.')) return;
    setSubmitting(true);
    try {
      await api.put(`/medical-records/${existingRecord.id}/complete`);
      await fetchRegistrations();
      if (selected) await selectPatient(selected);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyelesaikan pemeriksaan.');
    } finally { setSubmitting(false); }
  };

  const handlePrintPrescription = () => {
    if (!existingRecord?.prescription) return;
    const rx = existingRecord.prescription;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Resep Obat - ${selected.patient?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .clinic-title { font-size: 20px; font-weight: bold; }
            .clinic-sub { font-size: 12px; color: #666; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 20px; font-size: 13px; }
            .rx-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #0f766e; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f8fafc; }
            .footer { margin-top: 40px; text-align: right; font-size: 13px; }
            .sig-space { height: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-title">KLINIK MINI INFORMATION SYSTEM</div>
            <div class="clinic-sub">Jl. Kesehatan No. 123, Jakarta · Telp: (021) 555-0199</div>
          </div>
          <div class="rx-title">RESEP OBAT (R/) — ${rx.prescription_number}</div>
          <div class="info-grid">
            <div>
              <strong>Nama Pasien:</strong> ${selected.patient?.name}<br>
              <strong>No. Rekam Medis:</strong> ${selected.patient?.medical_record_number}<br>
              <strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}
            </div>
            <div>
              <strong>Dokter Pemeriksa:</strong> ${selected.doctor?.name}<br>
              <strong>Poliklinik:</strong> ${selected.policlinic?.name}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Obat</th>
                <th>Dosis</th>
                <th>Frekuensi</th>
                <th>Jumlah</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${rx.details?.map((d, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${d.medicine?.name}</strong></td>
                  <td>${d.dosage}</td>
                  <td>${d.frequency}</td>
                  <td>${d.quantity} ${d.medicine?.unit || ''}</td>
                  <td>${d.notes || '-'}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          <div class="footer">
            <div>Dokter Yang Memeriksa,</div>
            <div class="sig-space"></div>
            <div><strong>(${selected.doctor?.name})</strong></div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const addRxLine  = () => setRxDetails(p => [...p, emptyRx()]);
  const rmRxLine   = (i) => setRxDetails(p => p.filter((_, idx) => idx !== i));
  const setRxField = (i, field, val) =>
    setRxDetails(p => p.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  // All registrations for list panel
  const listRegs = registrations;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
        {/* --- Left: Patient Queue List --- */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          <div className="card-header">
            <div>
              <div className="text-sm font-bold text-slate-800">Antrean Hari Ini</div>
              <div className="text-xs text-slate-500">{listRegs.length} pendaftaran</div>
            </div>
          </div>

          {loading
            ? <LoadingSpinner />
            : listRegs.length === 0
              ? <EmptyState icon={ClipboardList} title="Tidak ada antrean" description="Belum ada pendaftaran hari ini." />
              : (
                <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                  {listRegs.map(reg => (
                    <button
                      key={reg.id}
                      onClick={() => selectPatient(reg)}
                      className={`w-full text-left px-4 py-3.5 transition cursor-pointer block ${
                        selected?.id === reg.id
                          ? 'bg-emerald-50 border-l-2 border-emerald-500'
                          : 'hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            selected?.id === reg.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {reg.queue?.queue_number || '?'}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-sm truncate">{reg.patient?.name}</div>
                            <div className="text-xs text-slate-500 truncate">{reg.doctor?.name}</div>
                          </div>
                        </div>
                        <StatusBadge status={reg.status} paymentStatus={reg.payment?.payment_status} />
                      </div>
                    </button>
                  ))}
                </div>
              )
          }
        </div>

        {/* --- Right: Examination Panel --- */}
        <div className="lg:col-span-3 space-y-4">
          {!selected ? (
            <div className="card">
              <EmptyState
                icon={Stethoscope}
                title="Pilih pasien dari daftar"
                description="Klik nama pasien di sebelah kiri untuk memulai pemeriksaan."
              />
            </div>
          ) : (
            <>
              {/* Patient info card */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{selected.patient?.name}</div>
                    <div className="text-xs text-slate-500">{selected.patient?.medical_record_number} · {selected.registration_number}</div>
                  </div>
                  <StatusBadge status={selected.status} paymentStatus={selected.payment?.payment_status} />
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ['Dokter', selected.doctor?.name],
                      ['Poli', selected.policlinic?.name],
                      ['Pembayaran', selected.payment_type],
                      ['Keluhan', selected.initial_complaint],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
                        <div className="text-xs font-medium text-slate-800">{val || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SOAP Record */}
              {loadingRecord
                ? <LoadingSpinner label="Memuat rekam medis..." />
                : existingRecord
                  ? (
                    <div className="card">
                      <div className="card-header">
                        <div>
                          <div className="text-sm font-bold text-slate-800">Catatan SOAP</div>
                          <div className="text-xs text-slate-500">Diagnosis & pemeriksaan</div>
                        </div>
                        {canExamine && (
                          <button onClick={openSOAP} className="btn btn-secondary btn-sm">Edit SOAP</button>
                        )}
                      </div>
                      <div className="card-body space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            ['S — Subjective (Keluhan)', existingRecord.subjective],
                            ['A — Assessment (Diagnosis)', existingRecord.assessment],
                            ['O — Objective (Temuan)', existingRecord.objective],
                            ['P — Plan (Tindakan)', existingRecord.plan],
                          ].map(([label, val]) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-3">
                              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</div>
                              <div className="text-xs text-slate-800 whitespace-pre-wrap">{val || '-'}</div>
                            </div>
                          ))}
                        </div>

                        {/* Vital Signs */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                          <div className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Tanda Vital</div>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {[
                              ['TD', existingRecord.blood_pressure],
                              ['Suhu', existingRecord.body_temperature ? `${existingRecord.body_temperature}°C` : null],
                              ['Nadi', existingRecord.pulse ? `${existingRecord.pulse}/m` : null],
                              ['BB', existingRecord.weight ? `${existingRecord.weight}kg` : null],
                              ['TB', existingRecord.height ? `${existingRecord.height}cm` : null],
                            ].map(([k, v]) => (
                              <div key={k} className="text-center bg-white rounded-lg p-2">
                                <div className="text-[9px] font-bold text-indigo-400 uppercase">{k}</div>
                                <div className="text-xs font-bold text-indigo-800 mt-0.5">{v || '-'}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prescription */}
                        {existingRecord.prescription?.details?.length > 0 && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-[10px] font-bold text-emerald-700 uppercase">Resep Obat ({existingRecord.prescription.prescription_number})</div>
                              <button onClick={handlePrintPrescription} className="btn btn-secondary text-xs py-1 px-2 gap-1 bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                <Printer className="w-3.5 h-3.5" />
                                Cetak Resep
                              </button>
                            </div>
                            <ul className="space-y-1.5">
                              {existingRecord.prescription.details.map(d => (
                                <li key={d.id} className="flex items-start gap-2 text-xs text-emerald-900">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                                  <span>
                                    <span className="font-bold">{d.medicine?.name}</span>
                                    {' '}&mdash; {d.dosage}, {d.frequency}, {d.quantity}×{d.medicine?.unit}
                                    {d.notes && <span className="text-emerald-700"> ({d.notes})</span>}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Complete Examination Action */}
                        {canExamine && existingRecord.status !== 'COMPLETED' && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                            <button onClick={handleCompleteRecord} disabled={submitting} className="btn text-white bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              {submitting ? 'Memproses...' : 'Selesaikan Pemeriksaan'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                  : canExamine && (
                    <div className="card border-dashed border-slate-300">
                      <EmptyState
                        icon={ClipboardList}
                        title="Belum ada catatan SOAP"
                        description="Mulai pemeriksaan dengan mengisi SOAP pasien ini."
                        action={
                          <button onClick={openSOAP} className="btn btn-primary btn-sm">
                            <Plus className="w-4 h-4" />
                            Mulai Pemeriksaan (SOAP)
                          </button>
                        }
                      />
                    </div>
                  )
              }

              {/* Prescription button */}
              {canExamine && existingRecord && existingRecord.status !== 'COMPLETED' && !existingRecord.prescription && (
                <button onClick={openRx} className="btn btn-primary w-full gap-2">
                  <Pill className="w-4 h-4" />
                  Tambah Resep Obat
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* SOAP Modal */}
      <Modal
        open={showSOAPModal}
        onClose={() => setShowSOAPModal(false)}
        title={existingRecord ? 'Edit Catatan SOAP' : 'Pemeriksaan Pasien (SOAP)'}
        subtitle={`${selected?.patient?.name} · ${selected?.registration_number}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowSOAPModal(false)} className="btn btn-secondary">Batal</button>
            <button form="form-soap" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : existingRecord ? 'Update SOAP' : 'Simpan SOAP'}
            </button>
          </>
        }
      >
        <form id="form-soap" onSubmit={handleSOAP} className="space-y-3">
          {formError && <Alert type="error">{formError}</Alert>}
          <FormField label="S — Subjective (Keluhan Pasien)" required>
            <Textarea required rows={2} value={soapData.subjective}
              onChange={e => setSoapData(p => ({ ...p, subjective: e.target.value }))}
              placeholder="Deskripsikan keluhan subjektif pasien..." />
          </FormField>
          <FormField label="O — Objective (Hasil Pemeriksaan Fisik)">
            <Textarea rows={2} value={soapData.objective}
              onChange={e => setSoapData(p => ({ ...p, objective: e.target.value }))}
              placeholder="Hasil pemeriksaan fisik..." />
          </FormField>
          <FormField label="A — Assessment (Diagnosis)" required>
            <Textarea required rows={2} value={soapData.assessment}
              onChange={e => setSoapData(p => ({ ...p, assessment: e.target.value }))}
              placeholder="Diagnosis / kesimpulan dokter..." />
          </FormField>
          <FormField label="P — Plan (Rencana Tindakan)" required>
            <Textarea required rows={2} value={soapData.plan}
              onChange={e => setSoapData(p => ({ ...p, plan: e.target.value }))}
              placeholder="Tindakan, terapi, atau rujukan..." />
          </FormField>

          <div className="divider" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tanda Vital (Opsional)</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormField label="Tekanan Darah">
              <Input type="text" value={soapData.blood_pressure}
                onChange={e => setSoapData(p => ({ ...p, blood_pressure: e.target.value }))}
                placeholder="120/80 mmHg" />
            </FormField>
            <FormField label="Suhu (°C)">
              <Input type="number" step="0.1" value={soapData.body_temperature}
                onChange={e => setSoapData(p => ({ ...p, body_temperature: e.target.value }))}
                placeholder="36.5" />
            </FormField>
            <FormField label="Nadi (/mnt)">
              <Input type="number" value={soapData.pulse}
                onChange={e => setSoapData(p => ({ ...p, pulse: e.target.value }))}
                placeholder="72" />
            </FormField>
            <FormField label="Berat (kg)">
              <Input type="number" step="0.1" value={soapData.weight}
                onChange={e => setSoapData(p => ({ ...p, weight: e.target.value }))}
                placeholder="60" />
            </FormField>
            <FormField label="Tinggi (cm)">
              <Input type="number" value={soapData.height}
                onChange={e => setSoapData(p => ({ ...p, height: e.target.value }))}
                placeholder="165" />
            </FormField>
          </div>
          <FormField label="Catatan Tambahan">
            <Textarea rows={2} value={soapData.notes}
              onChange={e => setSoapData(p => ({ ...p, notes: e.target.value }))}
              placeholder="Instruksi khusus, alergi, dll." />
          </FormField>
        </form>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        open={showRxModal}
        onClose={() => setShowRxModal(false)}
        title="Buat Resep Obat"
        subtitle={`Pasien: ${selected?.patient?.name}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowRxModal(false)} className="btn btn-secondary">Batal</button>
            <button form="form-rx" type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : 'Simpan Resep'}
            </button>
          </>
        }
      >
        <form id="form-rx" onSubmit={handleRx} className="space-y-3">
          {formError && <Alert type="error">{formError}</Alert>}

          {rxDetails.map((line, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2.5 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Obat #{i + 1}</span>
                {rxDetails.length > 1 && (
                  <button type="button" onClick={() => rmRxLine(i)} className="btn btn-danger btn-sm btn-icon">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <FormField label="Pilih Obat" required>
                <Select required value={line.medicine_id}
                  onChange={e => setRxField(i, 'medicine_id', e.target.value)}>
                  <option value="">-- Pilih Obat --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.stock} {m.unit})</option>
                  ))}
                </Select>
              </FormField>
              <div className="grid grid-cols-3 gap-2">
                <FormField label="Dosis" required>
                  <Input required value={line.dosage}
                    onChange={e => setRxField(i, 'dosage', e.target.value)}
                    placeholder="3×1 tab" />
                </FormField>
                <FormField label="Frekuensi" required>
                  <Input required value={line.frequency}
                    onChange={e => setRxField(i, 'frequency', e.target.value)}
                    placeholder="Setelah makan" />
                </FormField>
                <FormField label="Jumlah" required>
                  <Input required type="number" min="1" value={line.quantity}
                    onChange={e => setRxField(i, 'quantity', e.target.value)}
                    placeholder="10" />
                </FormField>
              </div>
              <FormField label="Catatan Obat (Opsional)">
                <Input value={line.notes}
                  onChange={e => setRxField(i, 'notes', e.target.value)}
                  placeholder="Hindari makanan pedas, dst." />
              </FormField>
            </div>
          ))}

          <button type="button" onClick={addRxLine} className="btn btn-secondary btn-sm w-full gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Tambah Obat Lain
          </button>
        </form>
      </Modal>
    </>
  );
};

export default MedicalRecordsPage;
