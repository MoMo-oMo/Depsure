import { db } from '@/firebaseConfig'
import { collection, addDoc, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'

export function useNoticeToVacancyTransition() {
  /**
   * Check if a notice is complete (has all required fields filled)
   */
  function isNoticeComplete(notice) {
    if (!notice) return false
    
    // Required fields for a notice to be considered complete
    const hasUnitName = !!notice.unitName
    const hasLeaseStartDate = !!notice.leaseStartDate
    const hasLeaseEndDate = !!notice.leaseEndDate
    // monthsMissedRent is optional (can be 0)
    
    return hasUnitName && hasLeaseStartDate && hasLeaseEndDate
  }

  /**
   * Automatically transition a completed notice to a vacancy
   * Returns true if transition was successful, false otherwise
   */
  async function autoTransitionToVacancy(noticeId) {
    try {
      // Get the notice data
      const noticeDoc = await getDoc(doc(db, 'notices', noticeId))
      if (!noticeDoc.exists()) {
        console.log('Notice not found:', noticeId)
        return false
      }

      const notice = { id: noticeDoc.id, ...noticeDoc.data() }

      // Check if notice is complete
      if (!isNoticeComplete(notice)) {
        console.log('Notice is not complete yet, skipping auto-transition')
        return false
      }

      console.log('Notice is complete, auto-transitioning to vacancy...', notice)

      // Get the associated unit if it exists
      let unitData = null
      let unitId = notice.unitId
      if (unitId) {
        const unitDoc = await getDoc(doc(db, 'units', unitId))
        if (unitDoc.exists()) {
          unitData = unitDoc.data()
        }
      }

      // Create vacancy entry
      const vacancyData = {
        agencyId: notice.agencyId || '',
        unitId: unitId,
        unitName: notice.unitName,
        dateVacated: notice.leaseEndDate || notice.vacateDate,
        leaseStartDate: notice.leaseStartDate || '',
        leaseEndDate: notice.leaseEndDate || '',
        moveInDate: null,
        propertyManager: unitData?.propertyManager || '',
        contactNumber: unitData?.contactNumber || '',
        paidTowardsFund: 0,
        paidOut: '',
        notes: `Transitioned from notice. Month's Missed Rent: ${notice.monthsMissedRent || 0}`,
        propertyType: notice.propertyType || unitData?.propertyType || 'residential',
        monthsMissedRent: notice.monthsMissedRent || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'vacancies'), vacancyData)
      console.log('Vacancy created successfully')

      // Archive the unit from Active Units if it still exists
      if (unitId && unitData) {
        const appStore = useAppStore()
        const archivedUnitData = {
          ...unitData,
          originalId: unitId,
          archivedAt: new Date(),
          archivedBy: appStore.currentUser?.uid || 'system',
          archivedByUserType: appStore.currentUser?.userType || 'system',
          archivedReason: 'Notice completed - moved to vacancies'
        }

        await addDoc(collection(db, 'archivedUnits'), archivedUnitData)
        await deleteDoc(doc(db, 'units', unitId))
        console.log('Unit archived from Active Units')
      }

      // Delete the notice
      await deleteDoc(doc(db, 'notices', noticeId))
      console.log('Notice deleted after transition')

      return true
    } catch (error) {
      console.error('Error auto-transitioning notice to vacancy:', error)
      return false
    }
  }

  return {
    isNoticeComplete,
    autoTransitionToVacancy
  }
}

