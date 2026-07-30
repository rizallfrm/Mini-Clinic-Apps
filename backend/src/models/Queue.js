'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class Queue extends Model {
    static associate(models) {
      // Antrean terhubung ke satu pendaftaran
      Queue.belongsTo(models.Registration, {
        foreignKey: 'registration_id',
        as: 'registration',
      });
    }
  }

  Queue.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      registration_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: { msg: 'This registration already has a queue' },
        validate: {
          notNull: { msg: 'Registration ID is required' },
        },
      },
      queue_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Queue number is required' },
        },
      },
      queue_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Queue date is required' },
          isDate: { msg: 'Queue date must be a valid date' },
        },
      },
      sequence_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Sequence number must be at least 1' },
          isInt: { msg: 'Sequence number must be an integer' },
        },
      },
      status: {
        type: DataTypes.ENUM('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'),
        allowNull: false,
        defaultValue: 'WAITING',
        validate: {
          isIn: {
            args: [['WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']],
            msg: 'Status must be WAITING, CALLED, IN_PROGRESS, COMPLETED, or SKIPPED',
          },
        },
      },
      called_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Queue',
      tableName: 'queues',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Queue;
};
