'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Buat ENUM type untuk medical_record_status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_medical_records_status" AS ENUM ('DRAFT', 'COMPLETED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('medical_records', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      registration_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          model: 'registrations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      patient_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'patients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      doctor_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      // SOAP — Subjective
      subjective: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'S - Keluhan subjektif dari pasien',
      },
      // SOAP — Objective (vital signs)
      blood_pressure: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Tekanan darah, contoh: 120/80',
      },
      body_temperature: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Suhu tubuh dalam Celsius',
      },
      weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Berat badan dalam kg',
      },
      height: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Tinggi badan dalam cm',
      },
      // SOAP — Assessment
      assessment: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'A - Diagnosa dokter',
      },
      // SOAP — Plan
      plan: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'P - Rencana pengobatan',
      },
      examination_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'DRAFT',
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

    await queryInterface.addIndex('medical_records', ['registration_id'], { unique: true, name: 'medical_records_registration_id_unique' });
    await queryInterface.addIndex('medical_records', ['patient_id'], { name: 'medical_records_patient_id_idx' });
    await queryInterface.addIndex('medical_records', ['doctor_id'], { name: 'medical_records_doctor_id_idx' });
    await queryInterface.addIndex('medical_records', ['examination_date'], { name: 'medical_records_examination_date_idx' });
    await queryInterface.addIndex('medical_records', ['status'], { name: 'medical_records_status_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('medical_records');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_medical_records_status";');
  },
};
