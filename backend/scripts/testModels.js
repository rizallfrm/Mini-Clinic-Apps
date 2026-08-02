/**
 * Script untuk memverifikasi semua Sequelize model dan asosiasi berhasil dimuat.
 * Jalankan dengan: node scripts/testModels.js
 */

require('dotenv').config();

const testModels = async () => {
  console.log('');
  console.log('================================================');
  console.log('   Sequelize Models & Associations Test         ');
  console.log('================================================');
  console.log('');

  try {
    const db = require('../src/models');

    // Tes koneksi database
    console.log('🔌 Testing database connection...');
    await db.sequelize.authenticate();
    console.log('✅ Database connected.');
    console.log('');

    // Tampilkan semua model yang dimuat
    const modelNames = Object.keys(db).filter(
      (key) => key !== 'sequelize' && key !== 'Sequelize'
    );

    console.log(`📦 Models loaded (${modelNames.length} total):`);
    modelNames.forEach((name, i) => {
      const model = db[name];
      const tableName = model.tableName || model.getTableName?.() || 'unknown';
      console.log(`   ${i + 1}. ${name} → table: "${tableName}"`);
    });

    console.log('');

    // Verifikasi asosiasi setiap model
    console.log('🔗 Verifying associations:');

    const expectedAssociations = {
      User: ['doctorProfile', 'createdRegistrations'],
      Policlinic: ['doctors', 'registrations'],
      Patient: ['registrations', 'medicalRecords', 'prescriptions'],
      Doctor: ['user', 'policlinic', 'registrations', 'medicalRecords', 'prescriptions'],
      Medicine: ['prescriptionDetails'],
      Registration: ['patient', 'doctor', 'policlinic', 'createdByUser', 'queue', 'medicalRecord'],
      Queue: ['registration'],
      MedicalRecord: ['registration', 'patient', 'doctor', 'medicalActions', 'prescription'],
      MedicalAction: ['medicalRecord'],
      Prescription: ['medicalRecord', 'patient', 'doctor', 'details'],
      PrescriptionDetail: ['prescription', 'medicine'],
    };

    let allPassed = true;

    for (const [modelName, expectedAliases] of Object.entries(expectedAssociations)) {
      const model = db[modelName];
      if (!model) {
        console.log(`   ❌ Model "${modelName}" NOT FOUND`);
        allPassed = false;
        continue;
      }

      const associations = model.associations || {};
      const associationAliases = Object.keys(associations);

      const missingAliases = expectedAliases.filter(
        (alias) => !associationAliases.includes(alias)
      );

      if (missingAliases.length === 0) {
        console.log(`   ✅ ${modelName}: ${expectedAliases.join(', ')}`);
      } else {
        console.log(`   ❌ ${modelName}: missing [${missingAliases.join(', ')}]`);
        allPassed = false;
      }
    }

    console.log('');

    // Tes query sederhana pada setiap tabel
    console.log('🔍 Testing table queries:');
    for (const modelName of modelNames) {
      try {
        const count = await db[modelName].count();
        console.log(`   ✅ ${modelName} (${db[modelName].tableName}): ${count} records`);
      } catch (err) {
        console.log(`   ❌ ${modelName}: ${err.message}`);
        allPassed = false;
      }
    }

    console.log('');

    if (allPassed) {
      console.log('================================================');
      console.log('✅ All models and associations verified!        ');
      console.log('================================================');
    } else {
      console.log('================================================');
      console.log('❌ Some checks failed. Review the errors above. ');
      console.log('================================================');
    }

    console.log('');
    await db.sequelize.close();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

testModels();
