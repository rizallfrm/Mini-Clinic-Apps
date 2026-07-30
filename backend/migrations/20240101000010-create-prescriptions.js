'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prescriptions', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      medical_record_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          model: 'medical_records',
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
      prescription_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('prescriptions', ['medical_record_id'], { unique: true, name: 'prescriptions_medical_record_id_unique' });
    await queryInterface.addIndex('prescriptions', ['prescription_number'], { unique: true, name: 'prescriptions_number_unique' });
    await queryInterface.addIndex('prescriptions', ['patient_id'], { name: 'prescriptions_patient_id_idx' });
    await queryInterface.addIndex('prescriptions', ['doctor_id'], { name: 'prescriptions_doctor_id_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('prescriptions');
  },
};
