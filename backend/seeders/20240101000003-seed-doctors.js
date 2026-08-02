'use strict';

require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const doctorEmail = process.env.SEED_DOCTOR_EMAIL || 'doctor@gmail.com';

    // Ambil user_id dokter berdasarkan email
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('${doctorEmail}', 'doctor2@gmail.com') ORDER BY id ASC`
    );

    // Ambil policlinic_id berdasarkan code
    const [policlinics] = await queryInterface.sequelize.query(
      `SELECT id, code FROM policlinics WHERE code IN ('POL-UMUM', 'POL-GIGI') ORDER BY id ASC`
    );

    if (users.length < 2) {
      throw new Error('Doctor users not found. Run seed-users first.');
    }

    if (policlinics.length < 2) {
      throw new Error('Policlinics not found. Run seed-policlinics first.');
    }

    // Map email → user id
    const userMap = {};
    users.forEach((u) => { userMap[u.email] = u.id; });

    // Map code → policlinic id
    const policlinicMap = {};
    policlinics.forEach((p) => { policlinicMap[p.code] = p.id; });

    await queryInterface.bulkInsert('doctors', [
      {
        user_id: userMap[doctorEmail],
        policlinic_id: policlinicMap['POL-UMUM'],
        doctor_code: 'DR-001',
        name: 'Dr. Ahmad Fauzi, Sp.U',
        specialization: 'Dokter Umum',
        phone: '08111234567',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userMap['doctor2@gmail.com'],
        policlinic_id: policlinicMap['POL-GIGI'],
        doctor_code: 'DR-002',
        name: 'Dr. Sari Dewi, drg',
        specialization: 'Dokter Gigi',
        phone: '08222345678',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Seeder doctors: 2 doctors inserted.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('doctors', {
      doctor_code: {
        [Sequelize.Op.in]: ['DR-001', 'DR-002'],
      },
    });
  },
};
