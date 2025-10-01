# Fix Existing Vacancies - Property Type Issue

## The Problem
Existing vacancy records don't have the `propertyType` field, causing "Unit not found" errors.

## Quick Fix (Firebase Console)

1. Go to **Firebase Console** → **Firestore Database**
2. Open the **`vacancies`** collection
3. For each vacancy document that's showing the error:
   - Click on the document
   - Click "Add field"
   - Field name: `propertyType`
   - Field value: `residential` (or the appropriate type)
   - Click "Add"

## Bulk Fix (If you have many vacancies)

If you have many vacancies, you can use the Firebase Console's "Run query" feature or the script I created:

### Using Firebase Console Query:
1. Go to Firestore → Vacancies
2. Click "Start collection"
3. For each document showing errors, add the `propertyType` field manually

### Using the Migration Script:
If you want to run the migration script (`scripts/update-vacancies-property-types.js`), you'll need:
1. Firebase Admin SDK installed: `npm install firebase-admin`
2. A service account key from Firebase Console
3. Run: `node scripts/update-vacancies-property-types.js`

## Prevention
All NEW vacancies will now automatically include the `propertyType` field, so this issue won't happen again!

