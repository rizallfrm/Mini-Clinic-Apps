'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class PrescriptionDetail extends Model {
    static associate(models) {
      // Detail resep terhubung ke satu resep
      PrescriptionDetail.belongsTo(models.Prescription, {
        foreignKey: 'prescription_id',
        as: 'prescription',
      });

      // Detail resep terhubung ke satu obat
      PrescriptionDetail.belongsTo(models.Medicine, {
        foreignKey: 'medicine_id',
        as: 'medicine',
      });
    }
  }

  PrescriptionDetail.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      prescription_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Prescription ID is required' },
        },
      },
      medicine_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Medicine ID is required' },
        },
      },
      dosage: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Dosage is required' },
        },
      },
      frequency: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Frequency is required' },
        },
      },
      duration: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Quantity must be at least 1' },
          isInt: { msg: 'Quantity must be an integer' },
        },
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PrescriptionDetail',
      tableName: 'prescription_details',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return PrescriptionDetail;
};
