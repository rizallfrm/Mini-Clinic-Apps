'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 12;

    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        name: 'Administrator',
        email: 'admin@clinic.com',
        password: bcrypt.hashSync('Admin123!', saltRounds),
        role: 'ADMIN',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Dr. Ahmad Fauzi, Sp.U',
        email: 'doctor@clinic.com',
        password: bcrypt.hashSync('Doctor123!', saltRounds),
        role: 'DOCTOR',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Dr. Sari Dewi, drg',
        email: 'doctor2@clinic.com',
        password: bcrypt.hashSync('Doctor123!', saltRounds),
        role: 'DOCTOR',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Budi Santoso',
        email: 'staff@clinic.com',
        password: bcrypt.hashSync('Staff123!', saltRounds),
        role: 'REGISTRATION_OFFICER',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Seeder users: 4 users inserted.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'admin@clinic.com',
          'doctor@clinic.com',
          'doctor2@clinic.com',
          'staff@clinic.com',
        ],
      },
    });
  },
};
