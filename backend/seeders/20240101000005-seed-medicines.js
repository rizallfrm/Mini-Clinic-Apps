'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('medicines', [
      {
        medicine_code: 'MED-001',
        name: 'Paracetamol 500mg',
        unit: 'Tablet',
        stock: 500,
        description: 'Obat penurun panas dan pereda nyeri',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        medicine_code: 'MED-002',
        name: 'Amoxicillin 500mg',
        unit: 'Kapsul',
        stock: 300,
        description: 'Antibiotik untuk infeksi bakteri',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        medicine_code: 'MED-003',
        name: 'Antasida Doen',
        unit: 'Tablet',
        stock: 200,
        description: 'Obat maag dan gangguan lambung',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        medicine_code: 'MED-004',
        name: 'Cetirizine 10mg',
        unit: 'Tablet',
        stock: 150,
        description: 'Antihistamin untuk alergi',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        medicine_code: 'MED-005',
        name: 'Ibuprofen 400mg',
        unit: 'Tablet',
        stock: 250,
        description: 'Pereda nyeri dan antiinflamasi',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        medicine_code: 'MED-006',
        name: 'OBH Combi Batuk Berdahak',
        unit: 'Botol',
        stock: 100,
        description: 'Obat batuk berdahak',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        medicine_code: 'MED-007',
        name: 'Vitamin C 500mg',
        unit: 'Tablet',
        stock: 400,
        description: 'Suplemen vitamin C untuk daya tahan tubuh',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        medicine_code: 'MED-008',
        name: 'Metronidazole 500mg',
        unit: 'Tablet',
        stock: 120,
        description: 'Antibiotik untuk infeksi gigi dan mulut',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log('✅ Seeder medicines: 8 medicines inserted.');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('medicines', {
      medicine_code: {
        [Sequelize.Op.in]: [
          'MED-001', 'MED-002', 'MED-003', 'MED-004',
          'MED-005', 'MED-006', 'MED-007', 'MED-008',
        ],
      },
    });
  },
};
