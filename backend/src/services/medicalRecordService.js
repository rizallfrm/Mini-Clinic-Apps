'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {
  MedicalRecord,
  MedicalAction,
  Prescription,
  PrescriptionDetail,
  Registration,
  Patient,
  Doctor,
  Policlinic,
  Medicine,
  Queue,
} = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// =====================================================
// GENERATE PRESCRIPTION NUMBER
// =====================================================

const generatePrescriptionNumber = async (transaction) => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const prefix = `PRE-${dateStr}-`;

  const count = await Prescription.count({
    where: { prescription_number: { [Op.like]: `${prefix}%` } },
    transaction,
  });

  return `${prefix}${String(count + 1).padStart(3, '0')}`;
};

// =====================================================
// INCLUDE OPTIONS (reusable)
// =====================================================

const getFullInclude = () => [
  {
    model: Registration,
    as: 'registration',
    attributes: ['id', 'registration_number', 'visit_date', 'payment_type', 'initial_complaint', 'status'],
    include: [
      { model: Policlinic, as: 'policlinic', attributes: ['id', 'code', 'name'] },
      { model: Queue, as: 'queue', attributes: ['id', 'queue_number', 'status'], required: false },
    ],
  },
  {
    model: Patient,
    as: 'patient',
    attributes: ['id', 'medical_record_number', 'name', 'gender', 'birth_date', 'phone'],
  },
  {
    model: Doctor,
    as: 'doctor',
    attributes: ['id', 'doctor_code', 'name', 'specialization'],
  },
  {
    model: MedicalAction,
    as: 'medicalActions',
    attributes: ['id', 'action_name', 'description', 'notes', 'created_at'],
    required: false,
  },
  {
    model: Prescription,
    as: 'prescription',
    required: false,
    attributes: ['id', 'prescription_number', 'notes', 'created_at'],
    include: [
      {
        model: PrescriptionDetail,
        as: 'details',
        required: false,
        attributes: ['id', 'dosage', 'frequency', 'duration', 'quantity', 'instructions'],
        include: [
          {
            model: Medicine,
            as: 'medicine',
            attributes: ['id', 'medicine_code', 'name', 'unit', 'stock'],
          },
        ],
      },
    ],
  },
];

// =====================================================
// MEDICAL RECORD SERVICES
// =====================================================

/**
 * Ambil daftar rekam medis dengan filter & pagination.
 */
const getAllMedicalRecords = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { patient_id, doctor_id, status, date_from, date_to } = query;

  const whereClause = {};
  if (patient_id) whereClause.patient_id = patient_id;
  if (doctor_id) whereClause.doctor_id = doctor_id;
  if (status) whereClause.status = status;
  if (date_from || date_to) {
    whereClause.examination_date = {};
    if (date_from) whereClause.examination_date[Op.gte] = new Date(date_from);
    if (date_to) whereClause.examination_date[Op.lte] = new Date(`${date_to}T23:59:59`);
  }

  const { count, rows } = await MedicalRecord.findAndCountAll({
    where: whereClause,
    include: getFullInclude(),
    order: [['examination_date', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  return { items: rows, pagination: getPaginationMeta(count, page, limit) };
};

/**
 * Ambil detail satu rekam medis.
 */
const getMedicalRecordById = async (id) => {
  const record = await MedicalRecord.findByPk(id, { include: getFullInclude() });
  if (!record) throw new AppError('Medical record not found.', 404);
  return record;
};

/**
 * Ambil rekam medis berdasarkan ID registrasi.
 */
const getMedicalRecordByRegistrationId = async (registrationId) => {
  const record = await MedicalRecord.findOne({
    where: { registration_id: registrationId },
    include: getFullInclude(),
  });
  return record;
};

/**
 * Buat rekam medis baru (SOAP).
 * Otomatis update status registrasi → EXAMINATION.
 *
 * @param {object} data - SOAP data + registration_id
 * @param {object} requestUser - req.user (harus DOCTOR)
 */
const createMedicalRecord = async (data, requestUser) => {
  const {
    registration_id,
    subjective,
    objective,
    blood_pressure,
    body_temperature,
    weight,
    height,
    pulse,
    notes,
    assessment,
    plan,
  } = data;

  // Validasi registrasi ada dan statusnya tepat
  const registration = await Registration.findByPk(registration_id, {
    include: [{ model: Doctor, as: 'doctor' }],
  });
  if (!registration) throw new AppError('Registration not found.', 404);

  if (!['WAITING', 'CHECKED_IN', 'EXAMINATION'].includes(registration.status)) {
    throw new AppError(
      `Cannot create medical record. Registration status is "${registration.status}". ` +
        'Status must be WAITING, CHECKED_IN, or EXAMINATION.',
      400
    );
  }

  // Pastikan dokter yang login sesuai dengan dokter di registrasi
  if (requestUser.role === 'DOCTOR') {
    let doctorId = requestUser.doctorProfile?.id;
    if (!doctorId) {
      const doc = await Doctor.findOne({ where: { user_id: requestUser.id } });
      if (doc) doctorId = doc.id;
    }
    if (!doctorId || String(doctorId) !== String(registration.doctor_id)) {
      throw new AppError(
        'Access denied. You can only create medical records for your own patients.',
        403
      );
    }
  }

  // Cek apakah rekam medis sudah ada untuk registrasi ini
  const existing = await MedicalRecord.findOne({ where: { registration_id } });
  if (existing) {
    throw new AppError(
      'Medical record for this registration already exists. Please edit the existing one.',
      409
    );
  }

  const t = await sequelize.transaction();
  try {
    // Buat rekam medis
    const record = await MedicalRecord.create(
      {
        registration_id,
        patient_id: registration.patient_id,
        doctor_id: registration.doctor_id,
        subjective,
        objective: objective || null,
        blood_pressure: blood_pressure || null,
        body_temperature: body_temperature || null,
        weight: weight || null,
        height: height || null,
        pulse: pulse || null,
        notes: notes || null,
        assessment,
        plan,
        examination_date: new Date(),
        status: 'DRAFT',
      },
      { transaction: t }
    );

    // Update status registrasi → EXAMINATION (jika masih WAITING atau CHECKED_IN)
    if (['WAITING', 'CHECKED_IN'].includes(registration.status)) {
      await registration.update({ status: 'EXAMINATION' }, { transaction: t });
      // Update queue juga
      const queue = await Queue.findOne({ where: { registration_id }, transaction: t });
      if (queue) await queue.update({ status: 'IN_PROGRESS' }, { transaction: t });
    }

    await t.commit();

    return MedicalRecord.findByPk(record.id, { include: getFullInclude() });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Update rekam medis (SOAP) — hanya jika status DRAFT.
 */
const updateMedicalRecord = async (id, data, requestUser) => {
  const record = await MedicalRecord.findByPk(id, {
    include: [{ model: Registration, as: 'registration' }],
  });
  if (!record) throw new AppError('Medical record not found.', 404);

  if (record.status === 'COMPLETED') {
    throw new AppError('Medical record has been completed and cannot be edited.', 400);
  }

  // Dokter hanya bisa update rekam medisnya sendiri
  if (requestUser.role === 'DOCTOR') {
    let doctorId = requestUser.doctorProfile?.id;
    if (!doctorId) {
      const doc = await Doctor.findOne({ where: { user_id: requestUser.id } });
      if (doc) doctorId = doc.id;
    }
    if (!doctorId || String(doctorId) !== String(record.doctor_id)) {
      throw new AppError('Access denied. You can only edit your own medical records.', 403);
    }
  }

  const { subjective, objective, blood_pressure, body_temperature, weight, height, pulse, notes, assessment, plan } = data;

  await record.update({
    ...(subjective !== undefined && { subjective }),
    ...(objective !== undefined && { objective }),
    ...(blood_pressure !== undefined && { blood_pressure }),
    ...(body_temperature !== undefined && { body_temperature }),
    ...(weight !== undefined && { weight }),
    ...(height !== undefined && { height }),
    ...(pulse !== undefined && { pulse }),
    ...(notes !== undefined && { notes }),
    ...(assessment !== undefined && { assessment }),
    ...(plan !== undefined && { plan }),
  });

  return MedicalRecord.findByPk(id, { include: getFullInclude() });
};

/**
 * Selesaikan rekam medis (DRAFT → COMPLETED).
 * Otomatis update status registrasi → COMPLETED.
 */
const completeMedicalRecord = async (id, requestUser) => {
  const record = await MedicalRecord.findByPk(id, {
    include: [
      { model: Registration, as: 'registration' },
    ],
  });
  if (!record) throw new AppError('Medical record not found.', 404);

  if (record.status === 'COMPLETED') {
    throw new AppError('Medical record is already completed.', 400);
  }

  if (requestUser.role === 'DOCTOR') {
    const doctorProfile = requestUser.doctorProfile;
    if (!doctorProfile || String(doctorProfile.id) !== String(record.doctor_id)) {
      throw new AppError('Access denied. You can only complete your own medical records.', 403);
    }
  }

  const t = await sequelize.transaction();
  try {
    await record.update({ status: 'COMPLETED' }, { transaction: t });

    // Update registrasi → COMPLETED
    if (record.registration) {
      await record.registration.update({ status: 'COMPLETED' }, { transaction: t });

      // Update queue → COMPLETED
      const queue = await Queue.findOne({
        where: { registration_id: record.registration_id },
        transaction: t,
      });
      if (queue) {
        await queue.update(
          { status: 'COMPLETED', completed_at: new Date() },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return MedicalRecord.findByPk(id, { include: getFullInclude() });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// =====================================================
// MEDICAL ACTIONS
// =====================================================

/**
 * Tambah tindakan medis ke rekam medis.
 */
const addMedicalAction = async (medicalRecordId, data, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot add action to a completed medical record.', 400);
  }

  if (requestUser.role === 'DOCTOR' && String(requestUser.doctorProfile?.id) !== String(record.doctor_id)) {
    throw new AppError('Access denied. You can only add actions to your own medical records.', 403);
  }

  return MedicalAction.create({
    medical_record_id: medicalRecordId,
    action_name: data.action_name,
    description: data.description || null,
    notes: data.notes || null,
  });
};

/**
 * Update tindakan medis.
 */
const updateMedicalAction = async (medicalRecordId, actionId, data, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot edit action in a completed medical record.', 400);
  }

  const action = await MedicalAction.findOne({
    where: { id: actionId, medical_record_id: medicalRecordId },
  });
  if (!action) throw new AppError('Medical action not found.', 404);

  await action.update({
    ...(data.action_name !== undefined && { action_name: data.action_name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.notes !== undefined && { notes: data.notes }),
  });

  return action;
};

/**
 * Hapus tindakan medis.
 */
const deleteMedicalAction = async (medicalRecordId, actionId, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot delete action from a completed medical record.', 400);
  }

  const action = await MedicalAction.findOne({
    where: { id: actionId, medical_record_id: medicalRecordId },
  });
  if (!action) throw new AppError('Medical action not found.', 404);

  await action.destroy();
};

// =====================================================
// PRESCRIPTIONS
// =====================================================

/**
 * Ambil resep dari rekam medis.
 */
const getPrescription = async (medicalRecordId) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);

  const prescription = await Prescription.findOne({
    where: { medical_record_id: medicalRecordId },
    include: [
      {
        model: PrescriptionDetail,
        as: 'details',
        include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'medicine_code', 'name', 'unit', 'stock'] }],
      },
    ],
  });

  return prescription;
};

/**
 * Buat resep untuk rekam medis (1 rekam medis = 1 resep).
 */
const createPrescription = async (medicalRecordId, data, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot add prescription to a completed medical record.', 400);
  }

  if (requestUser.role === 'DOCTOR' && String(requestUser.doctorProfile?.id) !== String(record.doctor_id)) {
    throw new AppError('Access denied. You can only add prescriptions to your own medical records.', 403);
  }

  const existing = await Prescription.findOne({ where: { medical_record_id: medicalRecordId } });
  if (existing) {
    throw new AppError(
      'Prescription already exists for this medical record. Add medicines to the existing prescription.',
      409
    );
  }

  const t = await sequelize.transaction();
  try {
    const prescription_number = await generatePrescriptionNumber(t);

    const prescription = await Prescription.create(
      {
        medical_record_id: medicalRecordId,
        patient_id: record.patient_id,
        doctor_id: record.doctor_id,
        prescription_number,
        notes: data.notes || null,
      },
      { transaction: t }
    );

    await t.commit();

    return Prescription.findByPk(prescription.id, {
      include: [{ model: PrescriptionDetail, as: 'details', include: [{ model: Medicine, as: 'medicine' }] }],
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Buat resep lengkap (Prescription + Details + Potong Stok Obat)
 */
const createPrescriptionWithDetails = async (data, requestUser) => {
  const { registration_id, medical_record_id, details, notes } = data;

  let record = null;
  if (medical_record_id) {
    record = await MedicalRecord.findByPk(medical_record_id);
  } else if (registration_id) {
    record = await MedicalRecord.findOne({ where: { registration_id } });
  }

  if (!record) {
    throw new AppError('Catatan rekam medis (SOAP) belum dibuat untuk pendaftaran ini.', 404);
  }

  if (record.status === 'COMPLETED') {
    throw new AppError('Tidak dapat menambahkan resep pada rekam medis yang sudah selesai.', 400);
  }

  const existing = await Prescription.findOne({ where: { medical_record_id: record.id } });
  if (existing) {
    throw new AppError('Resep obat sudah ada untuk rekam medis ini.', 409);
  }

  const t = await sequelize.transaction();
  try {
    const prescription_number = await generatePrescriptionNumber(t);

    const prescription = await Prescription.create(
      {
        medical_record_id: record.id,
        patient_id: record.patient_id,
        doctor_id: record.doctor_id,
        prescription_number,
        notes: notes || null,
      },
      { transaction: t }
    );

    if (Array.isArray(details) && details.length > 0) {
      for (const item of details) {
        const medicine = await Medicine.findByPk(item.medicine_id, { transaction: t });
        if (!medicine) {
          throw new AppError(`Obat dengan ID ${item.medicine_id} tidak ditemukan.`, 404);
        }

        const qty = parseInt(item.quantity) || 1;
        if (medicine.stock < qty) {
          throw new AppError(
            `Stok obat "${medicine.name}" tidak mencukupi. Tersedia: ${medicine.stock}, dibutuhkan: ${qty}`,
            422
          );
        }

        await PrescriptionDetail.create(
          {
            prescription_id: prescription.id,
            medicine_id: item.medicine_id,
            dosage: item.dosage,
            frequency: item.frequency || '',
            quantity: qty,
            notes: item.notes || null,
          },
          { transaction: t }
        );

        // Potong stok obat secara otomatis
        await medicine.decrement('stock', { by: qty, transaction: t });
      }
    }

    await t.commit();

    return Prescription.findByPk(prescription.id, {
      include: [
        {
          model: PrescriptionDetail,
          as: 'details',
          include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'medicine_code', 'name', 'unit', 'stock'] }],
        },
      ],
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Update catatan resep.
 */
const updatePrescription = async (medicalRecordId, data, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot edit prescription in a completed medical record.', 400);
  }

  const prescription = await Prescription.findOne({ where: { medical_record_id: medicalRecordId } });
  if (!prescription) throw new AppError('Prescription not found for this medical record.', 404);

  await prescription.update({ notes: data.notes });
  return prescription;
};

// =====================================================
// PRESCRIPTION DETAILS (Detail Obat)
// =====================================================

/**
 * Tambah obat ke resep.
 */
const addPrescriptionDetail = async (medicalRecordId, data, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot add medicine to a completed medical record.', 400);
  }

  const prescription = await Prescription.findOne({ where: { medical_record_id: medicalRecordId } });
  if (!prescription) {
    throw new AppError(
      'Prescription not found. Please create a prescription first before adding medicines.',
      404
    );
  }

  const medicine = await Medicine.findByPk(data.medicine_id);
  if (!medicine) throw new AppError('Medicine not found.', 404);
  if (!medicine.is_active) throw new AppError('Selected medicine is not active.', 400);

  return PrescriptionDetail.create({
    prescription_id: prescription.id,
    medicine_id: data.medicine_id,
    dosage: data.dosage,
    frequency: data.frequency,
    duration: data.duration || null,
    quantity: data.quantity,
    instructions: data.instructions || null,
  });
};

/**
 * Update detail obat di resep.
 */
const updatePrescriptionDetail = async (medicalRecordId, detailId, data, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot edit medicine in a completed medical record.', 400);
  }

  const prescription = await Prescription.findOne({ where: { medical_record_id: medicalRecordId } });
  if (!prescription) throw new AppError('Prescription not found.', 404);

  const detail = await PrescriptionDetail.findOne({
    where: { id: detailId, prescription_id: prescription.id },
    include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'medicine_code', 'name', 'unit'] }],
  });
  if (!detail) throw new AppError('Prescription detail not found.', 404);

  // Validasi obat baru jika medicine_id diubah
  if (data.medicine_id && data.medicine_id !== detail.medicine_id) {
    const medicine = await Medicine.findByPk(data.medicine_id);
    if (!medicine) throw new AppError('Medicine not found.', 404);
    if (!medicine.is_active) throw new AppError('Selected medicine is not active.', 400);
  }

  await detail.update({
    ...(data.medicine_id !== undefined && { medicine_id: data.medicine_id }),
    ...(data.dosage !== undefined && { dosage: data.dosage }),
    ...(data.frequency !== undefined && { frequency: data.frequency }),
    ...(data.duration !== undefined && { duration: data.duration }),
    ...(data.quantity !== undefined && { quantity: data.quantity }),
    ...(data.instructions !== undefined && { instructions: data.instructions }),
  });

  return PrescriptionDetail.findByPk(detailId, {
    include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'medicine_code', 'name', 'unit'] }],
  });
};

/**
 * Hapus detail obat dari resep.
 */
const deletePrescriptionDetail = async (medicalRecordId, detailId, requestUser) => {
  const record = await MedicalRecord.findByPk(medicalRecordId);
  if (!record) throw new AppError('Medical record not found.', 404);
  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot delete medicine from a completed medical record.', 400);
  }

  const prescription = await Prescription.findOne({ where: { medical_record_id: medicalRecordId } });
  if (!prescription) throw new AppError('Prescription not found.', 404);

  const detail = await PrescriptionDetail.findOne({
    where: { id: detailId, prescription_id: prescription.id },
  });
  if (!detail) throw new AppError('Prescription detail not found.', 404);

  await detail.destroy();
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  getMedicalRecordByRegistrationId,
  createMedicalRecord,
  updateMedicalRecord,
  completeMedicalRecord,
  addMedicalAction,
  updateMedicalAction,
  deleteMedicalAction,
  getPrescription,
  createPrescription,
  createPrescriptionWithDetails,
  updatePrescription,
  addPrescriptionDetail,
  updatePrescriptionDetail,
  deletePrescriptionDetail,
};
