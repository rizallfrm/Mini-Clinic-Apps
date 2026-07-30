'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('patients', [
      {
        medical_record_number: 'RM-20240101-001',
        nik: '3273010101900001',
        name: 'Andi Pratama',
        gender: 'MALE',
        birth_date: '1990-01-01',
        phone: '08123456781',
        address: 'Jl. Merdeka No. 10, Bandung',
        created_at: now,
        updated_at: now,
      },
      {
        medical_record_number: 'RM-20240101-002',
        nik: '3273010202920002',
        name: 'Siti Nurhaliza',
        gender: 'FEMALE',
        birth_date: '1992-02-02',
        phone: '08123456782',
        address: 'Jl. Pahlawan No. 5, Bandung',
        created_at: now,
        updated_at: now,
      },
      {
        medical_record_number: 'RM-20240101-003',
        nik: '3273010303880003',
        name: 'Rizky Ramadhan',
        gender: 'MALE',
        birth_date: '1988-03-03',
        phone: '08123456783',
        address: 'Jl. Sudirman No. 20, Bandung',
        created_at: now,
        updated_at: now,
      },
      {
        medical_record_number: 'RM-20240101-004',
        nik: '3273010404950004',
        name: 'Dewi Kusuma',
        gender: 'FEMALE',
        birth_date: '1995-04-04',
        phone: '08123456784',
        address: 'Jl. Diponegoro No. 15, Bandung',
        created_at: now,
        updated_at: now,
      },
      {
        medical_record_number: 'RM-20240101-005',
        nik: '3273010505850005',
        name: 'Hendra Gunawan',
        gender: 'MALE',
        birth_date: '1985-05-05',
        phone: '08123456785',
        address: 'Jl. Gatot Subroto No. 8, Bandung',
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Seeder patients: 5 patients inserted.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('patients', {
      medical_record_number: {
        [Sequelize.Op.in]: [
          'RM-20240101-001',
          'RM-20240101-002',
          'RM-20240101-003',
          'RM-20240101-004',
          'RM-20240101-005',
        ],
      },
    });
  },
};
