'use strict';

module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');

  class MedicalAction extends Model {
    static associate(models) {
      // Tindakan medis terhubung ke satu rekam medis
      MedicalAction.belongsTo(models.MedicalRecord, {
        foreignKey: 'medical_record_id',
        as: 'medicalRecord',
      });
    }
  }

  MedicalAction.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      medical_record_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Medical record ID is required' },
        },
      },
      action_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Action name is required' },
          len: { args: [2, 150], msg: 'Action name must be between 2 and 150 characters' },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'MedicalAction',
      tableName: 'medical_actions',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MedicalAction;
};
