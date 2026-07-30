'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('policlinics', [
      {
        code: 'POL-UMUM',
        name: 'Poli Umum',
        description: 'Pelayanan kesehatan umum untuk semua jenis penyakit',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        code: 'POL-GIGI',
        name: 'Poli Gigi',
        description: 'Pelayanan kesehatan gigi dan mulut',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Seeder policlinics: 2 policlinics inserted.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('policlinics', {
      code: {
        [Sequelize.Op.in]: ['POL-UMUM', 'POL-GIGI'],
      },
    });
  },
};
