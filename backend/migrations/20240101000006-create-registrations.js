'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Buat ENUM type untuk payment_type
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_registrations_payment_type" AS ENUM ('CASH', 'INSURANCE', 'BPJS', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Buat ENUM type untuk registration_status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_registrations_status" AS ENUM ('WAITING', 'CHECKED_IN', 'EXAMINATION', 'COMPLETED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('registrations', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      registration_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
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
      policlinic_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'policlinics',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      visit_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      payment_type: {
        type: Sequelize.ENUM('CASH', 'INSURANCE', 'BPJS', 'OTHER'),
        allowNull: false,
      },
      initial_complaint: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('WAITING', 'CHECKED_IN', 'EXAMINATION', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'WAITING',
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

    await queryInterface.addIndex('registrations', ['registration_number'], { unique: true, name: 'registrations_number_unique' });
    await queryInterface.addIndex('registrations', ['patient_id'], { name: 'registrations_patient_id_idx' });
    await queryInterface.addIndex('registrations', ['doctor_id'], { name: 'registrations_doctor_id_idx' });
    await queryInterface.addIndex('registrations', ['policlinic_id'], { name: 'registrations_policlinic_id_idx' });
    await queryInterface.addIndex('registrations', ['visit_date'], { name: 'registrations_visit_date_idx' });
    await queryInterface.addIndex('registrations', ['status'], { name: 'registrations_status_idx' });
    await queryInterface.addIndex('registrations', ['created_by'], { name: 'registrations_created_by_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('registrations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_registrations_payment_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_registrations_status";');
  },
};
