'use strict';

const { Payment, PaymentDetail, Registration, Patient, Doctor, Policlinic, MedicalRecord, Prescription, PrescriptionDetail, Medicine, sequelize } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

const generatePaymentNumber = async (t) => {
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const count = await Payment.count({ transaction: t });
  const seq = String(count + 1).padStart(3, '0');
  return `INV-${dateStr}-${seq}`;
};

const getInvoiceByRegistration = async (registrationId) => {
  const reg = await Registration.findByPk(registrationId, {
    include: [
      { model: Patient, as: 'patient' },
      { model: Doctor, as: 'doctor' },
      { model: Policlinic, as: 'policlinic' },
      {
        model: MedicalRecord,
        as: 'medicalRecord',
        include: [
          {
            model: Prescription,
            as: 'prescription',
            include: [{ model: PrescriptionDetail, as: 'details', include: [{ model: Medicine, as: 'medicine' }] }],
          },
        ],
      },
    ],
  });

  if (!reg) throw new AppError('Pendaftaran tidak ditemukan.', 404);

  const consultation_fee = 50000;
  let medicine_fee = 0;
  const items = [
    {
      item_type: 'CONSULTATION',
      item_name: `Biaya Konsultasi Dokter (${reg.doctor?.name || 'Dokter'})`,
      quantity: 1,
      unit_price: consultation_fee,
      subtotal: consultation_fee,
    },
  ];

  const prescription = reg.medicalRecord?.prescription;
  if (prescription?.details?.length > 0) {
    for (const d of prescription.details) {
      const price = parseFloat(d.medicine?.price) || 0;
      const subtotal = price * d.quantity;
      medicine_fee += subtotal;
      items.push({
        item_type: 'MEDICINE',
        item_name: `${d.medicine?.name} (${d.dosage})`,
        quantity: d.quantity,
        unit_price: price,
        subtotal: subtotal,
      });
    }
  }

  const total_amount = consultation_fee + medicine_fee;

  const existingPayment = await Payment.findOne({
    where: { registration_id: registrationId },
    include: [{ model: PaymentDetail, as: 'details' }],
  });

  return {
    registration: reg,
    consultation_fee,
    medicine_fee,
    total_amount,
    items,
    payment: existingPayment,
  };
};

const processPayment = async (registrationId, data) => {
  const invoice = await getInvoiceByRegistration(registrationId);
  const reg = invoice.registration;

  const t = await sequelize.transaction();
  try {
    let payment = await Payment.findOne({ where: { registration_id: registrationId }, transaction: t });

    if (!payment) {
      const payment_number = await generatePaymentNumber(t);
      payment = await Payment.create(
        {
          registration_id: registrationId,
          patient_id: reg.patient_id,
          payment_number,
          consultation_fee: invoice.consultation_fee,
          medicine_fee: invoice.medicine_fee,
          total_amount: invoice.total_amount,
          payment_method: data.payment_method || 'CASH',
          payment_status: 'PAID',
          paid_at: new Date(),
          notes: data.notes || null,
        },
        { transaction: t }
      );

      for (const item of invoice.items) {
        await PaymentDetail.create(
          {
            payment_id: payment.id,
            item_type: item.item_type,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          },
          { transaction: t }
        );
      }
    } else {
      await payment.update(
        {
          payment_method: data.payment_method || payment.payment_method,
          payment_status: 'PAID',
          paid_at: new Date(),
          notes: data.notes || payment.notes,
        },
        { transaction: t }
      );
    }

    await t.commit();

    return Payment.findByPk(payment.id, {
      include: [
        { model: Registration, as: 'registration', include: [{ model: Patient, as: 'patient' }, { model: Doctor, as: 'doctor' }, { model: Policlinic, as: 'policlinic' }] },
        { model: PaymentDetail, as: 'details' },
      ],
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getTodayPayments = async () => {
  return Payment.findAll({
    include: [
      { model: Registration, as: 'registration', include: [{ model: Patient, as: 'patient' }, { model: Doctor, as: 'doctor' }, { model: Policlinic, as: 'policlinic' }] },
      { model: PaymentDetail, as: 'details' },
    ],
    order: [['created_at', 'DESC']],
  });
};

module.exports = {
  getInvoiceByRegistration,
  processPayment,
  getTodayPayments,
};
