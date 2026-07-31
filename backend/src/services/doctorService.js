const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { User, Doctor, Policlinic, Registration } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

// =====================================================
// GENERATE DOCTOR CODE
// =====================================================

/**
 * Generate kode dokter otomatis.
 * Format: DR-NNN (sequential global)
 * Contoh: DR-003
 */
const generateDoctorCode = async () => {
  const count = await Doctor.count();
  const sequence = String(count + 1).padStart(3, '0');
  return `DR-${sequence}`;
};

// =====================================================
// FORMAT RESPONSE
// =====================================================

const formatDoctorResponse = (doctor) => ({
  id: doctor.id,
  doctor_code: doctor.doctor_code,
  name: doctor.name,
  specialization: doctor.specialization,
  phone: doctor.phone,
  is_active: doctor.is_active,
  policlinic: doctor.policlinic
    ? { id: doctor.policlinic.id, code: doctor.policlinic.code, name: doctor.policlinic.name }
    : null,
  user: doctor.user
    ? { id: doctor.user.id, email: doctor.user.email, is_active: doctor.user.is_active }
    : null,
  created_at: doctor.created_at,
  updated_at: doctor.updated_at,
});

// =====================================================
// DOCTOR SERVICES
// =====================================================

/**
 * Ambil daftar dokter dengan pagination & pencarian.
 */
const getAllDoctors = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { search, policlinic_id, is_active } = query;

  const whereClause = {};
  if (search && search.trim()) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search.trim()}%` } },
      { doctor_code: { [Op.iLike]: `%${search.trim()}%` } },
      { specialization: { [Op.iLike]: `%${search.trim()}%` } },
    ];
  }
  if (policlinic_id) whereClause.policlinic_id = policlinic_id;
  if (is_active !== undefined) whereClause.is_active = is_active === 'true';

  const { count, rows } = await Doctor.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Policlinic,
        as: 'policlinic',
        attributes: ['id', 'code', 'name'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'is_active'],
      },
    ],
    order: [['name', 'ASC']],
    limit,
    offset,
    distinct: true,
  });

  const pagination = getPaginationMeta(count, page, limit);
  return { items: rows.map(formatDoctorResponse), pagination };
};

/**
 * Ambil daftar dokter aktif untuk dropdown.
 * Bisa difilter by policlinic_id.
 */
const getActiveDoctors = async (policlinic_id) => {
  const whereClause = { is_active: true };
  if (policlinic_id) whereClause.policlinic_id = policlinic_id;

  return Doctor.findAll({
    where: whereClause,
    attributes: ['id', 'doctor_code', 'name', 'specialization', 'policlinic_id'],
    include: [
      { model: Policlinic, as: 'policlinic', attributes: ['id', 'code', 'name'] },
    ],
    order: [['name', 'ASC']],
  });
};

/**
 * Ambil detail satu dokter.
 */
const getDoctorById = async (id) => {
  const doctor = await Doctor.findByPk(id, {
    include: [
      { model: Policlinic, as: 'policlinic', attributes: ['id', 'code', 'name'] },
      { model: User, as: 'user', attributes: ['id', 'email', 'is_active'] },
    ],
  });

  if (!doctor) throw new AppError('Doctor not found.', 404);
  return formatDoctorResponse(doctor);
};

/**
 * Buat dokter baru beserta akun user-nya dalam satu transaksi.
 * @param {object} data - { email, password, name, policlinic_id, specialization, phone }
 */
const createDoctor = async (data) => {
  const { email, password, name, policlinic_id, specialization, phone } = data;

  // Cek email sudah dipakai
  const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existingUser) throw new AppError(`Email "${email}" is already registered.`, 409);

  // Cek policlinic ada
  const policlinic = await Policlinic.findByPk(policlinic_id);
  if (!policlinic) throw new AppError('Policlinic not found.', 404);
  if (!policlinic.is_active) throw new AppError('Selected policlinic is not active.', 400);

  const t = await sequelize.transaction();
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat akun user dengan role DOCTOR
    const user = await User.create(
      {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'DOCTOR',
        is_active: true,
      },
      { transaction: t }
    );

    // Generate kode dokter otomatis
    const doctor_code = await generateDoctorCode();

    // Buat profil dokter
    const doctor = await Doctor.create(
      {
        user_id: user.id,
        policlinic_id,
        doctor_code,
        name,
        specialization: specialization || null,
        phone: phone || null,
        is_active: true,
      },
      { transaction: t }
    );

    await t.commit();

    // Reload dengan asosiasi untuk response
    const result = await Doctor.findByPk(doctor.id, {
      include: [
        { model: Policlinic, as: 'policlinic', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'is_active'] },
      ],
    });

    return formatDoctorResponse(result);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Update profil dokter dan status akun user.
 */
const updateDoctor = async (id, data) => {
  const doctor = await Doctor.findByPk(id, {
    include: [{ model: User, as: 'user' }],
  });
  if (!doctor) throw new AppError('Doctor not found.', 404);

  const { name, policlinic_id, specialization, phone, is_active } = data;

  // Validasi policlinic jika diubah
  if (policlinic_id && String(policlinic_id) !== String(doctor.policlinic_id)) {
    const policlinic = await Policlinic.findByPk(policlinic_id);
    if (!policlinic) throw new AppError('Policlinic not found.', 404);
    if (!policlinic.is_active) throw new AppError('Selected policlinic is not active.', 400);
  }

  const t = await sequelize.transaction();
  try {
    // Update profil dokter
    await doctor.update(
      {
        ...(name !== undefined && { name }),
        ...(policlinic_id !== undefined && { policlinic_id }),
        ...(specialization !== undefined && { specialization }),
        ...(phone !== undefined && { phone }),
        ...(is_active !== undefined && { is_active }),
      },
      { transaction: t }
    );

    // Sinkronisasi nama dan is_active ke user account
    if (doctor.user) {
      await doctor.user.update(
        {
          ...(name !== undefined && { name }),
          ...(is_active !== undefined && { is_active }),
        },
        { transaction: t }
      );
    }

    await t.commit();

    const result = await Doctor.findByPk(id, {
      include: [
        { model: Policlinic, as: 'policlinic', attributes: ['id', 'code', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'is_active'] },
      ],
    });

    return formatDoctorResponse(result);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Hapus dokter (tidak bisa jika punya riwayat registrasi).
 */
const deleteDoctor = async (id) => {
  const doctor = await Doctor.findByPk(id, {
    include: [{ model: User, as: 'user' }],
  });
  if (!doctor) throw new AppError('Doctor not found.', 404);

  const regCount = await Registration.count({ where: { doctor_id: id } });
  if (regCount > 0) {
    throw new AppError(
      `Cannot delete doctor. Has ${regCount} registration record(s). Deactivate instead.`,
      409
    );
  }

  const t = await sequelize.transaction();
  try {
    await doctor.destroy({ transaction: t });
    if (doctor.user) await doctor.user.destroy({ transaction: t });
    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  getAllDoctors,
  getActiveDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
