// Script to update existing vacancies with propertyType field
const admin = require('firebase-admin');
const serviceAccount = require('../firebaseConfig.json'); // You'll need your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateVacanciesPropertyTypes() {
  try {
    console.log('Starting to update vacancies with property types...');
    
    const vacanciesSnapshot = await db.collection('vacancies').get();
    console.log(`Found ${vacanciesSnapshot.size} vacancies to check`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const vacancyDoc of vacanciesSnapshot.docs) {
      const vacancyData = vacancyDoc.data();
      
      // Skip if already has propertyType
      if (vacancyData.propertyType) {
        skipped++;
        continue;
      }
      
      let propertyType = 'residential'; // default
      
      // Try to get from unitId first
      if (vacancyData.unitId) {
        try {
          const unitDoc = await db.collection('units').doc(vacancyData.unitId).get();
          if (unitDoc.exists) {
            propertyType = unitDoc.data().propertyType || 'residential';
          }
        } catch (error) {
          console.log(`Could not find unit ${vacancyData.unitId}, using default`);
        }
      }
      // Try to get from unitName
      else if (vacancyData.unitName) {
        try {
          const unitSnapshot = await db.collection('units')
            .where('unitName', '==', vacancyData.unitName)
            .limit(1)
            .get();
          
          if (!unitSnapshot.empty) {
            propertyType = unitSnapshot.docs[0].data().propertyType || 'residential';
          }
        } catch (error) {
          console.log(`Could not find unit ${vacancyData.unitName}, using default`);
        }
      }
      
      // Update the vacancy with propertyType
      await vacancyDoc.ref.update({ propertyType });
      updated++;
      console.log(`Updated vacancy ${vacancyDoc.id} with propertyType: ${propertyType}`);
    }
    
    console.log('\n=== Update Complete ===');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped (already had propertyType): ${skipped}`);
    console.log(`Total: ${vacanciesSnapshot.size}`);
    
  } catch (error) {
    console.error('Error updating vacancies:', error);
  } finally {
    admin.app().delete();
  }
}

updateVacanciesPropertyTypes();

