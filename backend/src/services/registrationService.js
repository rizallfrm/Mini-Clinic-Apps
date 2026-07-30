'use strict';

const { Op } = require('sequelize');
const { sequelize } = require('../models');
const {
  Registration,
  Queue,
  Patient,
  Doctor,
  Policlinic,
  User,
  MedicalRecord,
} = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// =====================================================
// HELPER: GENERATE REGISTRATION NUMBER
// =====================================================

/**
 * Generate nomor pendaftaran otomatis.
 * Format: REG-YYYYMMDD-NNN (sequential per hari)
 * Contoh: REG-20240730-001
 *
 * @param {string} visitDate - Format YYYY-MM-DD
 * @returns {Promise<string>}
 */
const generateRegistrationNumber = async (visitDate, transaction) => {
  const dateStr = visitDate.replace(/-/g, '');
  const prefix = `REG-${dateStr}-`;

  const count = await Registration.count({
    where: { registration_number: { [Op.like]: `${prefix}%` } },
    transaction,
  });

  return `${prefix}${String(count + 1).padStart(3, '0')}`;
};

// =====================================================
// HELPER: GENERATE QUEUE NUMBER
// =====================================================

/**
 * Generate nomor antrean otomatis per poli per hari.
 * Format: <PrefixHuruf><NomorUrut>
 * Prefix ditentukan dari policlinic_id: ID 1 → A, ID 2 → B, dst.
 * Contoh: A001 (Poli 1, antrean ke-1), B003 (Poli 2, antrean ke-3)
 *
 * @param {number} policlinicId
 * @param {string} queueDate - Format YYYY-MM-DD
 * @param {object} transaction
 * @returns {Promise<{ queue_number: string, sequence_number: number }>}
 */
const generateQueueData = async (policlinicId, queueDate, transaction) => {
  // Hitung antrean yang sudah ada untuk poli ini di tanggal ini
  const count = await Queue.count({
    where: { queue_date: queueDate },
    include: [
      {
        model: Registration,
        as: 'registration',
        where: { policlinic_id: policlinicId },
        required: true,
      },
    ],
    transaction,
  });

  const sequence = count + 1;
  // Prefix: A untuk poli ID 1, B untuk ID 2, dst. (max 26 poli)
  const prefix = String.fromCharCode(64 + parseInt(policlinicId));
  const queue_number = `${prefix}${String(sequence).padStart(3, '0')}`;

  return { queue_number, sequence_number: sequence };
};

// =====================================================
// HELPER: FORMAT RESPONSE
// =====================================================

const formatRegistration = (reg) => ({
  id: reg.id,
  registration_number: reg.registration_number,
  visit_date: reg.visit_date,
  payment_type: reg.payment_type,
  initial_complaint: reg.initial_complaint,
  status: reg.status,
  patient: reg.patient
    ? {
        id: reg.patient.id,
        medical_record_number: reg.patient.medical_record_number,
        name: reg.patient.name,
        gender: reg.patient.gender,
        birth_date: reg.patient.birth_date,
        phone: reg.patient.phone,
      }
    : null,
  doctor: reg.doctor
    ? {
        id: reg.doctor.id,
        doctor_code: reg.doctor.doctor_code,
        name: reg.doctor.name,
        specialization: reg.doctor.specialization,
      }
    : null,
  policlinic: reg.policlinic
    ? { id: reg.policlinic.id, code: reg.policlinic.code, name: reg.policlinic.name }
    : null,
  created_by_user: reg.createdByUser
    ? { id: reg.createdByUser.id, name: reg.createdByUser.name }
    : null,
  queue: reg.queue
    ? {
        id: reg.queue.id,
        queue_number: reg.queue.queue_number,
        queue_date: reg.queue.queue_date,
        sequence_number: reg.queue.sequence_number,
        status: reg.queue.status,
        called_at: reg.queue.called_at,
        completed_at: reg.queue.completed_at,
      }
    : null,
  medical_record: reg.medicalRecord
    ? { id: reg.medicalRecord.id, status: reg.medicalRecord.status }
    : null,
  created_at: reg.created_at,
  updated_at: reg.updated_at,
});

// =====================================================
// INCLUDE OPTIONS (reusable)
// =====================================================

const getIncludeOptions = () => [
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
    model: Policlinic,
    as: 'policlinic',
    attributes: ['id', 'code', 'name'],
  },
  {
    model: User,
    as: 'createdByUser',
    attributes: ['id', 'name'],
  },
  {
    model: Queue,
    as: 'queue',
    attributes: ['id', 'queue_number', 'queue_date', 'sequence_number', 'status', 'called_at', 'completed_at'],
    required: false,
  },
  {
    model: MedicalRecord,
    as: 'medicalRecord',
    attributes: ['id', 'status'],
    required: false,
  },
];

// =====================================================
// TRANSITION MATRIX STATUS
// =====================================================

/**
 * Transisi status yang diizinkan.
 * Key: status saat ini → Value: array status yang bisa dituju
 */
const ALLOWED_TRANSITIONS = {
  WAITING: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['EXAMINATION', 'CANCELLED'],
  EXAMINATION: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],    // status final, tidak bisa diubah
  CANCELLED: [],    // status final, tidak bisa diubah
};

/**
 * Validasi apakah transisi status valid.
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot change status from "${currentStatus}" to "${newStatus}". ` +
      `Allowed transitions: [${allowed.join(', ') || 'none'}]`,
      400
    );
  }
};

// =====================================================
// REGISTRATION SERVICES
// =====================================================

/**
 * Ambil daftar registrasi dengan filter dan pagination.
 */
const getAllRegistrations = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { search, status, doctor_id, policlinic_id, visit_date, patient_id } = query;

  const whereClause = {};

  if (search && search.trim()) {
    whereClause[Op.or] = [
      { registration_number: { [Op.iLike]: `%${search.trim()}%` } },
    ];
  }
  if (status) whereClause.status = status;
  if (doctor_id) whereClause.doctor_id = doctor_id;
  if (policlinic_id) whereClause.policlinic_id = policlinic_id;
  if (visit_date) whereClause.visit_date = visit_date;
  if (patient_id) whereClause.patient_id = patient_id;

  const { count, rows } = await Registration.findAndCountAll({
    where: whereClause,
    include: getIncludeOptions(),
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);
  return { items: rows.map(formatRegistration), pagination };
};

/**
 * Ambil daftar pendaftaran hari ini.
 * Diurutkan berdasarkan nomor urut antrean.
 */
const getTodayRegistrations = async (query) => {
  const today = new Date().toISOString().split('T')[0];
  const { status, policlinic_id, doctor_id } = query;

  const whereClause = { visit_date: today };
  if (status) whereClause.status = status;
  if (policlinic_id) whereClause.policlinic_id = policlinic_id;
  if (doctor_id) whereClause.doctor_id = doctor_id;

  const rows = await Registration.findAll({
    where: whereClause,
    include: getIncludeOptions(),
    order: [
      [{ model: Queue, as: 'queue' }, 'sequence_number', 'ASC'],
    ],
  });

  return rows.map(formatRegistration);
};

/**
 * Ambil detail satu registrasi.
 */
const getRegistrationById = async (id) => {
  const registration = await Registration.findByPk(id, {
    include: getIncludeOptions(),
  });

  if (!registration) throw new AppError('Registration not found.', 404);
  return formatRegistration(registration);
};

/**
 * Buat pendaftaran baru.
 * Otomatis membuat antrean setelah pendaftaran berhasil.
 *
 * @param {object} data - Data dari request body
 * @param {number} createdBy - User ID dari req.user.id
 * @returns {{ registration: object, queue: object }}
 */
const createRegistration = async (data, createdBy) => {
  const { patient_id, doctor_id, policlinic_id, visit_date, payment_type, initial_complaint } = data;

  // --- Validasi data ---
  const patient = await Patient.findByPk(patient_id);
  if (!patient) throw new AppError('Patient not found.', 404);

  const doctor = await Doctor.findByPk(doctor_id, {
    include: [{ model: Policlinic, as: 'policlinic' }],
  });
  if (!doctor) throw new AppError('Doctor not found.', 404);
  if (!doctor.is_active) throw new AppError('Selected doctor is not active.', 400);

  const policlinic = await Policlinic.findByPk(policlinic_id);
  if (!policlinic) throw new AppError('Policlinic not found.', 404);
  if (!policlinic.is_active) throw new AppError('Selected policlinic is not active.', 400);

  // Validasi: dokter harus berada di poli yang sama
  if (doctor.policlinic_id !== parseInt(policlinic_id)) {
    throw new AppError(
      `Doctor "${doctor.name}" is assigned to "${doctor.policlinic?.name}", not to the selected policlinic.`,
      400
    );
  }

  const t = await sequelize.transaction();
  try {
    // Generate nomor registrasi
    const registration_number = await generateRegistrationNumber(visit_date, t);

    // Buat registrasi
    const registration = await Registration.create(
      {
        registration_number,
        patient_id,
        doctor_id,
        policlinic_id,
        created_by: createdBy,
        visit_date,
        payment_type,
        initial_complaint,
        status: 'WAITING',
      },
      { transaction: t }
    );

    // Generate nomor antrean
    const { queue_number, sequence_number } = await generateQueueData(policlinic_id, visit_date, t);

    // Buat antrean otomatis
    const queue = await Queue.create(
      {
        registration_id: registration.id,
        queue_number,
        queue_date: visit_date,
        sequence_number,
        status: 'WAITING',
      },
      { transaction: t }
    );

    await t.commit();

    // Reload dengan relasi lengkap
    const result = await Registration.findByPk(registration.id, {
      include: getIncludeOptions(),
    });

    return formatRegistration(result);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Update data pendaftaran.
 * Hanya bisa diubah jika status masih WAITING.
 */
const updateRegistration = async (id, data) => {
  const registration = await Registration.findByPk(id, {
    include: [{ model: Queue, as: 'queue' }],
  });
  if (!registration) throw new AppError('Registration not found.', 404);

  if (registration.status !== 'WAITING') {
    throw new AppError(
      `Registration cannot be edited. Current status: "${registration.status}". Only WAITING registrations can be edited.`,
      400
    );
  }

  const { doctor_id, policlinic_id, visit_date, payment_type, initial_complaint } = data;

  // Validasi dokter dan poli jika diubah
  if (doctor_id || policlinic_id) {
    const newDoctorId = doctor_id || registration.doctor_id;
    const newPoliclinicId = policlinic_id || registration.policlinic_id;

    const doctor = await Doctor.findByPk(newDoctorId);
    if (!doctor) throw new AppError('Doctor not found.', 404);
    if (!doctor.is_active) throw new AppError('Selected doctor is not active.', 400);

    if (doctor.policlinic_id !== parseInt(newPoliclinicId)) {
      const policlinic = await Policlinic.findByPk(newPoliclinicId);
      throw new AppError(
        `Doctor "${doctor.name}" is not assigned to "${policlinic?.name}".`,
        400
      );
    }
  }

  const t = await sequelize.transaction();
  try {
    await registration.update(
      {
        ...(doctor_id !== undefined && { doctor_id }),
        ...(policlinic_id !== undefined && { policlinic_id }),
        ...(visit_date !== undefined && { visit_date }),
        ...(payment_type !== undefined && { payment_type }),
        ...(initial_complaint !== undefined && { initial_complaint }),
      },
      { transaction: t }
    );

    // Jika tanggal kunjungan berubah, update juga queue_date
    if (visit_date && registration.queue) {
      await registration.queue.update({ queue_date: visit_date }, { transaction: t });
    }

    await t.commit();

    const result = await Registration.findByPk(id, { include: getIncludeOptions() });
    return formatRegistration(result);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Update status pendaftaran sesuai state machine.
 * Juga update status antrean yang berkaitan.
 */
const updateRegistrationStatus = async (id, newStatus) => {
  const registration = await Registration.findByPk(id, {
    include: [{ model: Queue, as: 'queue' }],
  });
  if (!registration) throw new AppError('Registration not found.', 404);

  // Validasi state machine
  validateStatusTransition(registration.status, newStatus);

  const t = await sequelize.transaction();
  try {
    // Update status registrasi
    await registration.update({ status: newStatus }, { transaction: t });

    // Sinkronisasi status antrean
    if (registration.queue) {
      const queueStatusMap = {
        WAITING: 'WAITING',
        CHECKED_IN: 'CALLED',
        EXAMINATION: 'IN_PROGRESS',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'SKIPPED',
      };

      const updateData = { status: queueStatusMap[newStatus] };

      if (newStatus === 'CHECKED_IN') {
        updateData.called_at = new Date();
      } else if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
        updateData.completed_at = new Date();
      }

      await registration.queue.update(updateData, { transaction: t });
    }

    await t.commit();

    const result = await Registration.findByPk(id, { include: getIncludeOptions() });
    return formatRegistration(result);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Batalkan / hapus pendaftaran.
 * Hanya bisa jika status WAITING.
 */
const deleteRegistration = async (id) => {
  const registration = await Registration.findByPk(id, {
    include: [{ model: Queue, as: 'queue' }],
  });
  if (!registration) throw new AppError('Registration not found.', 404);

  if (!['WAITING', 'CANCELLED'].includes(registration.status)) {
    throw new AppError(
      `Cannot delete registration with status "${registration.status}". Only WAITING or CANCELLED registrations can be deleted.`,
      409
    );
  }

  const t = await sequelize.transaction();
  try {
    if (registration.queue) await registration.queue.destroy({ transaction: t });
    await registration.destroy({ transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  getAllRegistrations,
  getTodayRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  updateRegistrationStatus,
  deleteRegistration,
};
