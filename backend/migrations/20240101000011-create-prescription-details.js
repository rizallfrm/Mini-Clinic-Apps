'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prescription_details', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      prescription_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'prescriptions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      medicine_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'medicines',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      dosage: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Contoh: 500mg, 1 tablet',
      },
      frequency: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Contoh: 3x sehari, 2x sehari',
      },
      duration: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Contoh: 5 hari, 1 minggu',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Jumlah obat yang diberikan',
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Contoh: Diminum setelah makan',
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

    await queryInterface.addIndex('prescription_details', ['prescription_id'], { name: 'prescription_details_prescription_id_idx' });
    await queryInterface.addIndex('prescription_details', ['medicine_id'], { name: 'prescription_details_medicine_id_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('prescription_details');
  },
};
