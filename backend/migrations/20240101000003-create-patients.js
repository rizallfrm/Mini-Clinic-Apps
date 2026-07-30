'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Buat ENUM type untuk gender_type
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_patients_gender" AS ENUM ('MALE', 'FEMALE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('patients', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      medical_record_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      nik: {
        type: Sequelize.STRING(16),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE'),
        allowNull: false,
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('patients', ['medical_record_number'], { unique: true, name: 'patients_mrn_unique' });
    await queryInterface.addIndex('patients', ['nik'], { unique: true, name: 'patients_nik_unique' });
    await queryInterface.addIndex('patients', ['name'], { name: 'patients_name_idx' });
    await queryInterface.addIndex('patients', ['phone'], { name: 'patients_phone_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('patients');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_patients_gender";');
  },
};
