// Utility script to backfill existing properties with default property type
// Run this script once to set propertyType = 'residential' for all existing properties

import { initializeApp } from 'firebase/app'
import { collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD9mzyGX0GMeS_ASyVawUf6lpV1h97gt_0',
  authDomain: 'depsure-a9b61.firebaseapp.com',
  projectId: 'depsure-a9b61',
  storageBucket: 'depsure-a9b61.firebasestorage.app',
  messagingSenderId: '656713548553',
  appId: '1:656713548553:web:8ce67c5c807bcab02709d8',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function backfillPropertyTypes () {
  try {
    console.log('Starting property type backfill...')

    // Get all units from the units collection
    const unitsSnapshot = await getDocs(collection(db, 'units'))

    let updatedCount = 0
    let skippedCount = 0

    for (const unitDoc of unitsSnapshot.docs) {
      const unitData = unitDoc.data()

      // Check if propertyType already exists
      if (unitData.propertyType) {
        console.log(`Skipping unit ${unitDoc.id} - already has propertyType: ${unitData.propertyType}`)
        skippedCount++
        continue
      }

      // Update the unit with default property type
      await updateDoc(doc(db, 'units', unitDoc.id), {
        propertyType: 'residential',
      })

      console.log(`Updated unit ${unitDoc.id} with propertyType: residential`)
      updatedCount++
    }

    console.log(`\nBackfill completed!`)
    console.log(`Updated: ${updatedCount} units`)
    console.log(`Skipped: ${skippedCount} units (already had propertyType)`)
    console.log(`Total: ${unitsSnapshot.docs.length} units processed`)
  } catch (error) {
    console.error('Error during backfill:', error)
  }
}

// Run the backfill
backfillPropertyTypes()
