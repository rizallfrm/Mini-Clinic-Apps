'use strict';

/**
 * Seeder data dummy lengkap.
 * Membuat: registrations, queues, medical_records, medical_actions,
 *          prescriptions, prescription_details.
 * Semua dalam satu database transaction.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();

    try {
      const now = new Date();

      // =====================================================
      // AMBIL DATA YANG DIBUTUHKAN
      // =====================================================

      const [patients] = await queryInterface.sequelize.query(
        `SELECT id, name, medical_record_number FROM patients ORDER BY id ASC`,
        { transaction: t }
      );

      const [doctors] = await queryInterface.sequelize.query(
        `SELECT d.id, d.name, d.doctor_code, d.policlinic_id FROM doctors d ORDER BY d.id ASC`,
        { transaction: t }
      );

      const [policlinics] = await queryInterface.sequelize.query(
        `SELECT id, code, name FROM policlinics ORDER BY id ASC`,
        { transaction: t }
      );

      const [staffUsers] = await queryInterface.sequelize.query(
        `SELECT id, email FROM users WHERE role = 'REGISTRATION_OFFICER' LIMIT 1`,
        { transaction: t }
      );

      const [medicines] = await queryInterface.sequelize.query(
        `SELECT id, medicine_code, name FROM medicines ORDER BY id ASC`,
        { transaction: t }
      );

      if (!patients.length || !doctors.length || !policlinics.length || !staffUsers.length) {
        throw new Error('Required seed data not found. Run previous seeders first.');
      }

      // Map referensi data
      const patient1 = patients[0]; // Andi Pratama
      const patient2 = patients[1]; // Siti Nurhaliza
      const patient3 = patients[2]; // Rizky Ramadhan
      const patient4 = patients[3]; // Dewi Kusuma
      const patient5 = patients[4]; // Hendra Gunawan

      const doctorUmum = doctors[0]; // Dr. Ahmad Fauzi (Poli Umum)
      const doctorGigi = doctors[1]; // Dr. Sari Dewi (Poli Gigi)

      const poliUmum = policlinics[0];
      const poliGigi = policlinics[1];

      const staffId = staffUsers[0].id;

      const med001 = medicines.find((m) => m.medicine_code === 'MED-001'); // Paracetamol
      const med002 = medicines.find((m) => m.medicine_code === 'MED-002'); // Amoxicillin
      const med003 = medicines.find((m) => m.medicine_code === 'MED-003'); // Antasida
      const med007 = medicines.find((m) => m.medicine_code === 'MED-007'); // Vitamin C
      const med008 = medicines.find((m) => m.medicine_code === 'MED-008'); // Metronidazole

      // Tanggal kunjungan
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];

      // =====================================================
      // INSERT REGISTRATIONS
      // =====================================================

      const registrationsData = [
        {
          registration_number: 'REG-20240101-001',
          patient_id: patient1.id,
          doctor_id: doctorUmum.id,
          policlinic_id: poliUmum.id,
          created_by: staffId,
          visit_date: twoDaysAgo,
          payment_type: 'BPJS',
          initial_complaint: 'Pasien mengeluhkan demam tinggi, batuk, dan pilek sejak 3 hari lalu.',
          status: 'COMPLETED',
          created_at: new Date(Date.now() - 2 * 86400000),
          updated_at: new Date(Date.now() - 2 * 86400000),
        },
        {
          registration_number: 'REG-20240101-002',
          patient_id: patient2.id,
          doctor_id: doctorGigi.id,
          policlinic_id: poliGigi.id,
          created_by: staffId,
          visit_date: yesterday,
          payment_type: 'CASH',
          initial_complaint: 'Pasien mengeluhkan sakit gigi geraham kiri bawah sejak kemarin.',
          status: 'COMPLETED',
          created_at: new Date(Date.now() - 86400000),
          updated_at: new Date(Date.now() - 86400000),
        },
        {
          registration_number: 'REG-20240101-003',
          patient_id: patient3.id,
          doctor_id: doctorUmum.id,
          policlinic_id: poliUmum.id,
          created_by: staffId,
          visit_date: today,
          payment_type: 'INSURANCE',
          initial_complaint: 'Pasien mengeluhkan mual, muntah, dan sakit perut sejak pagi hari.',
          status: 'EXAMINATION',
          created_at: now,
          updated_at: now,
        },
        {
          registration_number: 'REG-20240101-004',
          patient_id: patient4.id,
          doctor_id: doctorUmum.id,
          policlinic_id: poliUmum.id,
          created_by: staffId,
          visit_date: today,
          payment_type: 'BPJS',
          initial_complaint: 'Pasien mengeluhkan pusing, lemas, dan kurang nafsu makan.',
          status: 'CHECKED_IN',
          created_at: now,
          updated_at: now,
        },
        {
          registration_number: 'REG-20240101-005',
          patient_id: patient5.id,
          doctor_id: doctorUmum.id,
          policlinic_id: poliUmum.id,
          created_by: staffId,
          visit_date: today,
          payment_type: 'CASH',
          initial_complaint: 'Pasien mengeluhkan nyeri sendi lutut kiri dan kanan.',
          status: 'WAITING',
          created_at: now,
          updated_at: now,
        },
      ];

      const insertedRegistrations = await queryInterface.bulkInsert(
        'registrations',
        registrationsData,
        { returning: true, transaction: t }
      );

      console.log(`   → ${insertedRegistrations.length} registrations inserted.`);

      // Ambil ID registrations yang baru dibuat
      const [regRows] = await queryInterface.sequelize.query(
        `SELECT id, registration_number FROM registrations
         WHERE registration_number IN (
           'REG-20240101-001','REG-20240101-002','REG-20240101-003',
           'REG-20240101-004','REG-20240101-005'
         ) ORDER BY id ASC`,
        { transaction: t }
      );

      const regMap = {};
      regRows.forEach((r) => { regMap[r.registration_number] = r.id; });

      // =====================================================
      // INSERT QUEUES
      // =====================================================

      const queuesData = [
        {
          registration_id: regMap['REG-20240101-001'],
          queue_number: 'A001',
          queue_date: twoDaysAgo,
          sequence_number: 1,
          status: 'COMPLETED',
          called_at: new Date(Date.now() - 2 * 86400000 + 3600000),
          completed_at: new Date(Date.now() - 2 * 86400000 + 7200000),
          created_at: new Date(Date.now() - 2 * 86400000),
          updated_at: new Date(Date.now() - 2 * 86400000),
        },
        {
          registration_id: regMap['REG-20240101-002'],
          queue_number: 'B001',
          queue_date: yesterday,
          sequence_number: 1,
          status: 'COMPLETED',
          called_at: new Date(Date.now() - 86400000 + 3600000),
          completed_at: new Date(Date.now() - 86400000 + 7200000),
          created_at: new Date(Date.now() - 86400000),
          updated_at: new Date(Date.now() - 86400000),
        },
        {
          registration_id: regMap['REG-20240101-003'],
          queue_number: 'A001',
          queue_date: today,
          sequence_number: 1,
          status: 'IN_PROGRESS',
          called_at: new Date(Date.now() - 1800000),
          completed_at: null,
          created_at: now,
          updated_at: now,
        },
        {
          registration_id: regMap['REG-20240101-004'],
          queue_number: 'A002',
          queue_date: today,
          sequence_number: 2,
          status: 'CALLED',
          called_at: new Date(Date.now() - 900000),
          completed_at: null,
          created_at: now,
          updated_at: now,
        },
        {
          registration_id: regMap['REG-20240101-005'],
          queue_number: 'A003',
          queue_date: today,
          sequence_number: 3,
          status: 'WAITING',
          called_at: null,
          completed_at: null,
          created_at: now,
          updated_at: now,
        },
      ];

      await queryInterface.bulkInsert('queues', queuesData, { transaction: t });
      console.log(`   → ${queuesData.length} queues inserted.`);

      // =====================================================
      // INSERT MEDICAL RECORDS (untuk yang COMPLETED)
      // =====================================================

      const medRecordsData = [
        {
          registration_id: regMap['REG-20240101-001'],
          patient_id: patient1.id,
          doctor_id: doctorUmum.id,
          // S — Subjective
          subjective: 'Pasien datang dengan keluhan demam tinggi (38.9°C), batuk berdahak, dan pilek sejak 3 hari lalu. Pasien merasa lemas dan kurang nafsu makan.',
          // O — Objective
          blood_pressure: '110/70',
          body_temperature: 38.90,
          weight: 65.00,
          height: 170.00,
          // A — Assessment
          assessment: 'ISPA (Infeksi Saluran Pernafasan Atas) / Influenza',
          // P — Plan
          plan: 'Pemberian antipiretik, antibiotik, dan obat batuk. Istirahat yang cukup. Kontrol kembali jika tidak membaik dalam 3 hari.',
          examination_date: new Date(Date.now() - 2 * 86400000 + 5400000),
          status: 'COMPLETED',
          created_at: new Date(Date.now() - 2 * 86400000 + 5400000),
          updated_at: new Date(Date.now() - 2 * 86400000 + 5400000),
        },
        {
          registration_id: regMap['REG-20240101-002'],
          patient_id: patient2.id,
          doctor_id: doctorGigi.id,
          // S — Subjective
          subjective: 'Pasien mengeluhkan sakit gigi geraham bawah kiri yang berdenyut sejak kemarin. Nyeri bertambah saat mengunyah.',
          // O — Objective
          blood_pressure: '120/80',
          body_temperature: 36.80,
          weight: 55.00,
          height: 160.00,
          // A — Assessment
          assessment: 'Pulpitis Irreversibel Gigi 36',
          // P — Plan
          plan: 'Rencana perawatan saluran akar (PSA). Pemberian antibiotik dan analgesik. Kontrol 3 hari kemudian.',
          examination_date: new Date(Date.now() - 86400000 + 5400000),
          status: 'COMPLETED',
          created_at: new Date(Date.now() - 86400000 + 5400000),
          updated_at: new Date(Date.now() - 86400000 + 5400000),
        },
      ];

      await queryInterface.bulkInsert('medical_records', medRecordsData, { transaction: t });
      console.log(`   → ${medRecordsData.length} medical records inserted.`);

      // Ambil ID medical records
      const [mrRows] = await queryInterface.sequelize.query(
        `SELECT mr.id, r.registration_number
         FROM medical_records mr
         JOIN registrations r ON r.id = mr.registration_id
         WHERE r.registration_number IN ('REG-20240101-001', 'REG-20240101-002')
         ORDER BY mr.id ASC`,
        { transaction: t }
      );

      const mrMap = {};
      mrRows.forEach((mr) => { mrMap[mr.registration_number] = mr.id; });

      // =====================================================
      // INSERT MEDICAL ACTIONS
      // =====================================================

      const medActionsData = [
        // Tindakan untuk REG-001 (Poli Umum - ISPA)
        {
          medical_record_id: mrMap['REG-20240101-001'],
          action_name: 'Pemeriksaan Fisik Umum',
          description: 'Pemeriksaan tanda vital: tekanan darah, suhu tubuh, berat badan, dan tinggi badan.',
          notes: 'Suhu badan 38.9°C, tekanan darah 110/70 mmHg.',
          created_at: new Date(Date.now() - 2 * 86400000 + 5400000),
          updated_at: new Date(Date.now() - 2 * 86400000 + 5400000),
        },
        {
          medical_record_id: mrMap['REG-20240101-001'],
          action_name: 'Pemberian Injeksi Antipiretik',
          description: 'Injeksi metamizole 1 ampul sebagai antipiretik cepat.',
          notes: 'Pasien tidak mengalami reaksi alergi.',
          created_at: new Date(Date.now() - 2 * 86400000 + 5400000),
          updated_at: new Date(Date.now() - 2 * 86400000 + 5400000),
        },
        // Tindakan untuk REG-002 (Poli Gigi - Pulpitis)
        {
          medical_record_id: mrMap['REG-20240101-002'],
          action_name: 'Pemeriksaan Gigi dan Mulut',
          description: 'Pemeriksaan visual dan perkusi pada gigi 36. Rontgen periapikal gigi 36.',
          notes: 'Terdapat karies profunda pada gigi 36 dengan perkusi positif.',
          created_at: new Date(Date.now() - 86400000 + 5400000),
          updated_at: new Date(Date.now() - 86400000 + 5400000),
        },
        {
          medical_record_id: mrMap['REG-20240101-002'],
          action_name: 'Pembersihan Karang Gigi (Scaling)',
          description: 'Scaling supragingiva pada seluruh regio gigi.',
          notes: 'Pasien diedukasi mengenai cara menyikat gigi yang benar.',
          created_at: new Date(Date.now() - 86400000 + 5400000),
          updated_at: new Date(Date.now() - 86400000 + 5400000),
        },
      ];

      await queryInterface.bulkInsert('medical_actions', medActionsData, { transaction: t });
      console.log(`   → ${medActionsData.length} medical actions inserted.`);

      // =====================================================
      // INSERT PRESCRIPTIONS
      // =====================================================

      const prescriptionsData = [
        {
          medical_record_id: mrMap['REG-20240101-001'],
          patient_id: patient1.id,
          doctor_id: doctorUmum.id,
          prescription_number: 'PRE-20240101-001',
          notes: 'Minum obat sesuai aturan. Habiskan antibiotik meskipun sudah merasa sembuh.',
          created_at: new Date(Date.now() - 2 * 86400000 + 5400000),
          updated_at: new Date(Date.now() - 2 * 86400000 + 5400000),
        },
        {
          medical_record_id: mrMap['REG-20240101-002'],
          patient_id: patient2.id,
          doctor_id: doctorGigi.id,
          prescription_number: 'PRE-20240101-002',
          notes: 'Hindari makanan keras dan panas. Kumur air garam hangat 3x sehari.',
          created_at: new Date(Date.now() - 86400000 + 5400000),
          updated_at: new Date(Date.now() - 86400000 + 5400000),
        },
      ];

      await queryInterface.bulkInsert('prescriptions', prescriptionsData, { transaction: t });
      console.log(`   → ${prescriptionsData.length} prescriptions inserted.`);

      // Ambil ID prescriptions
      const [presRows] = await queryInterface.sequelize.query(
        `SELECT id, prescription_number FROM prescriptions
         WHERE prescription_number IN ('PRE-20240101-001', 'PRE-20240101-002')
         ORDER BY id ASC`,
        { transaction: t }
      );

      const presMap = {};
      presRows.forEach((p) => { presMap[p.prescription_number] = p.id; });

      // =====================================================
      // INSERT PRESCRIPTION DETAILS
      // =====================================================

      const presDetailsData = [
        // Detail resep PRE-001 (ISPA)
        {
          prescription_id: presMap['PRE-20240101-001'],
          medicine_id: med001.id, // Paracetamol 500mg
          dosage: '500mg',
          frequency: '3x sehari',
          duration: '3 hari',
          quantity: 9,
          instructions: 'Diminum setelah makan jika demam di atas 38°C',
          created_at: new Date(Date.now() - 2 * 86400000 + 5400000),
          updated_at: new Date(Date.now() - 2 * 86400000 + 5400000),
        },
        {
          prescription_id: presMap['PRE-20240101-001'],
          medicine_id: med002.id, // Amoxicillin 500mg
          dosage: '500mg',
          frequency: '3x sehari',
          duration: '5 hari',
          quantity: 15,
          instructions: 'Diminum setelah makan. Habiskan meskipun sudah merasa sembuh.',
          created_at: new Date(Date.now() - 2 * 86400000 + 5400000),
          updated_at: new Date(Date.now() - 2 * 86400000 + 5400000),
        },
        {
          prescription_id: presMap['PRE-20240101-001'],
          medicine_id: med007.id, // Vitamin C 500mg
          dosage: '500mg',
          frequency: '1x sehari',
          duration: '7 hari',
          quantity: 7,
          instructions: 'Diminum setelah makan pagi',
          created_at: new Date(Date.now() - 2 * 86400000 + 5400000),
          updated_at: new Date(Date.now() - 2 * 86400000 + 5400000),
        },
        // Detail resep PRE-002 (Gigi)
        {
          prescription_id: presMap['PRE-20240101-002'],
          medicine_id: med008.id, // Metronidazole 500mg
          dosage: '500mg',
          frequency: '3x sehari',
          duration: '5 hari',
          quantity: 15,
          instructions: 'Diminum setelah makan. Jangan dikonsumsi bersamaan dengan alkohol.',
          created_at: new Date(Date.now() - 86400000 + 5400000),
          updated_at: new Date(Date.now() - 86400000 + 5400000),
        },
        {
          prescription_id: presMap['PRE-20240101-002'],
          medicine_id: med001.id, // Paracetamol 500mg
          dosage: '500mg',
          frequency: '3x sehari jika nyeri',
          duration: '3 hari',
          quantity: 9,
          instructions: 'Diminum jika nyeri. Jangan melebihi 4 tablet per hari.',
          created_at: new Date(Date.now() - 86400000 + 5400000),
          updated_at: new Date(Date.now() - 86400000 + 5400000),
        },
      ];

      await queryInterface.bulkInsert('prescription_details', presDetailsData, { transaction: t });
      console.log(`   → ${presDetailsData.length} prescription details inserted.`);

      await t.commit();

      console.log('');
      console.log('✅ Seeder demo-data: All dummy data inserted successfully.');
      console.log('');
      console.log('📋 Summary:');
      console.log('   - Registrations : 5');
      console.log('   - Queues        : 5');
      console.log('   - Medical Records: 2 (COMPLETED)');
      console.log('   - Medical Actions: 4');
      console.log('   - Prescriptions  : 2');
      console.log('   - Presc. Details : 5');
    } catch (error) {
      await t.rollback();
      console.error('❌ Seeder demo-data failed, transaction rolled back.');
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      // Hapus dalam urutan terbalik (dari tabel yang paling tergantung)
      await queryInterface.bulkDelete('prescription_details', null, { transaction: t });
      await queryInterface.bulkDelete('prescriptions', {
        prescription_number: {
          [Sequelize.Op.in]: ['PRE-20240101-001', 'PRE-20240101-002'],
        },
      }, { transaction: t });
      await queryInterface.bulkDelete('medical_actions', null, { transaction: t });
      await queryInterface.bulkDelete('medical_records', null, { transaction: t });
      await queryInterface.bulkDelete('queues', null, { transaction: t });
      await queryInterface.bulkDelete('registrations', {
        registration_number: {
          [Sequelize.Op.in]: [
            'REG-20240101-001', 'REG-20240101-002', 'REG-20240101-003',
            'REG-20240101-004', 'REG-20240101-005',
          ],
        },
      }, { transaction: t });

      await t.commit();
      console.log('✅ Demo data removed.');
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
};
