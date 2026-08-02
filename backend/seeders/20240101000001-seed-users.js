'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 12;
    const now = new Date();

    const adminEmail = process.env.SEED_ADMIN_EMAIL ;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ;

    const doctorEmail = process.env.SEED_DOCTOR_EMAIL ;
    const doctorPassword = process.env.SEED_DOCTOR_PASSWORD ;

    const staffEmail = process.env.SEED_STAFF_EMAIL;
    const staffPassword = process.env.SEED_STAFF_PASSWORD ;

    await queryInterface.bulkInsert('users', [
      {
        name: 'Administrator',
        email: adminEmail,
        password: bcrypt.hashSync(adminPassword, saltRounds),
        role: 'ADMIN',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Dr. Ahmad Fauzi, Sp.U',
        email: doctorEmail,
        password: bcrypt.hashSync(doctorPassword, saltRounds),
        role: 'DOCTOR',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Dr. Sari Dewi, drg',
        email: 'doctor2@gmail.com',
        password: bcrypt.hashSync(doctorPassword, saltRounds),
        role: 'DOCTOR',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Budi Santoso',
        email: staffEmail,
        password: bcrypt.hashSync(staffPassword, saltRounds),
        role: 'REGISTRATION_OFFICER',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Seeder users: 4 users inserted using env configuration.');
  },

  async down(queryInterface, Sequelize) {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com';
    const doctorEmail = process.env.SEED_DOCTOR_EMAIL || 'doctor@gmail.com';
    const staffEmail = process.env.SEED_STAFF_EMAIL || 'staff@gmail.com';

    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [adminEmail, doctorEmail, 'doctor2@gmail.com', staffEmail],
      },
    });
  },
};
