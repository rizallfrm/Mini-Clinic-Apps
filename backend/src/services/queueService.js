'use strict';

const { Queue, Registration, Patient, Doctor, Policlinic } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

const getTodayQueues = async (policlinicId = null) => {
  const today = new Date().toISOString().split('T')[0];
  const where = { queue_date: today };

  const includeRegistration = {
    model: Registration,
    as: 'registration',
    include: [
      { model: Patient, as: 'patient', attributes: ['id', 'name', 'medical_record_number', 'phone'] },
      { model: Doctor, as: 'doctor', attributes: ['id', 'name'] },
      { model: Policlinic, as: 'policlinic', attributes: ['id', 'name', 'code'] },
    ],
  };

  if (policlinicId) {
    includeRegistration.where = { policlinic_id: policlinicId };
  }

  return Queue.findAll({
    where,
    include: [includeRegistration],
    order: [['sequence_number', 'ASC']],
  });
};

const callQueue = async (queueId) => {
  const queue = await Queue.findByPk(queueId, {
    include: [{ model: Registration, as: 'registration' }],
  });
  if (!queue) throw new AppError('Antrean tidak ditemukan.', 404);

  await queue.update({ status: 'CALLED', called_at: new Date() });
  if (queue.registration) {
    await queue.registration.update({ status: 'CHECKED_IN' });
  }

  return getQueueById(queueId);
};

const startQueue = async (queueId) => {
  const queue = await Queue.findByPk(queueId, {
    include: [{ model: Registration, as: 'registration' }],
  });
  if (!queue) throw new AppError('Antrean tidak ditemukan.', 404);

  await queue.update({ status: 'IN_PROGRESS' });
  if (queue.registration) {
    await queue.registration.update({ status: 'EXAMINATION' });
  }

  return getQueueById(queueId);
};

const completeQueue = async (queueId) => {
  const queue = await Queue.findByPk(queueId, {
    include: [{ model: Registration, as: 'registration' }],
  });
  if (!queue) throw new AppError('Antrean tidak ditemukan.', 404);

  await queue.update({ status: 'COMPLETED', completed_at: new Date() });
  if (queue.registration) {
    await queue.registration.update({ status: 'COMPLETED' });
  }

  return getQueueById(queueId);
};

const skipQueue = async (queueId) => {
  const queue = await Queue.findByPk(queueId, {
    include: [{ model: Registration, as: 'registration' }],
  });
  if (!queue) throw new AppError('Antrean tidak ditemukan.', 404);

  await queue.update({ status: 'SKIPPED' });
  return getQueueById(queueId);
};

const getQueueById = async (id) => {
  return Queue.findByPk(id, {
    include: [
      {
        model: Registration,
        as: 'registration',
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' },
          { model: Policlinic, as: 'policlinic' },
        ],
      },
    ],
  });
};

module.exports = {
  getTodayQueues,
  callQueue,
  startQueue,
  completeQueue,
  skipQueue,
  getQueueById,
};
