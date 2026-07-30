'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Buat ENUM type untuk queue_status
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_queues_status" AS ENUM ('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('queues', {
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
      queue_number: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      queue_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      sequence_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'),
        allowNull: false,
        defaultValue: 'WAITING',
      },
      called_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
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

    // Unique constraint: kombinasi queue_date + queue_number
    await queryInterface.addIndex('queues', ['queue_date', 'queue_number'], {
      unique: true,
      name: 'queues_date_number_unique',
    });

    // Unique constraint: kombinasi queue_date + sequence_number
    await queryInterface.addIndex('queues', ['queue_date', 'sequence_number'], {
      unique: true,
      name: 'queues_date_sequence_unique',
    });

    await queryInterface.addIndex('queues', ['registration_id'], { unique: true, name: 'queues_registration_id_unique' });
    await queryInterface.addIndex('queues', ['status'], { name: 'queues_status_idx' });
    await queryInterface.addIndex('queues', ['queue_date'], { name: 'queues_date_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('queues');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_queues_status";');
  },
};
