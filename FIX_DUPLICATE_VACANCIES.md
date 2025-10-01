# Fix Duplicate Vacancies in Database

## The Problem
You currently have **duplicate vacancy entries** in your database. This happened because:
1. When a notice was created, it auto-created a vacancy
2. Then the "Move to Vacancies" button was clicked, creating ANOTHER vacancy for the same unit

## ✅ **Prevention** (Already Fixed in Code!)
The code now prevents future duplicates by checking if a vacancy already exists before creating a new one.

## 🧹 **Cleanup Existing Duplicates**

### Option 1: Manual Cleanup (Firebase Console)
1. Go to **Firebase Console** → **Firestore Database**
2. Open the **`vacancies`** collection
3. Look for duplicate entries (same `unitName`)
4. Delete the older duplicate (keep the most recent one)

### Option 2: Quick Identification
To find duplicates:
1. Go to your Vacancies page
2. Note which units appear twice
3. In Firebase Console, search for those `unitName` values
4. Delete the duplicate entry

### Example:
If "Unit 101" appears twice:
- Keep: The entry with the most complete data (has `propertyType`, `unitId`, etc.)
- Delete: The older entry that's missing fields

## 🎉 After Cleanup
Once duplicates are removed and you refresh the page:
- ✅ No more errors in console
- ✅ Each unit appears only once
- ✅ No future duplicates will be created

