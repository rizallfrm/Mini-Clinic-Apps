'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctors', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
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
      doctor_code: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      specialization: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('doctors', ['user_id'], { unique: true, name: 'doctors_user_id_unique' });
    await queryInterface.addIndex('doctors', ['doctor_code'], { unique: true, name: 'doctors_code_unique' });
    await queryInterface.addIndex('doctors', ['policlinic_id'], { name: 'doctors_policlinic_id_idx' });
    await queryInterface.addIndex('doctors', ['is_active'], { name: 'doctors_is_active_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('doctors');
  },
};
