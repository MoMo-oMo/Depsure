import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { ref } from 'vue'
import { db } from '@/firebaseConfig'
import { useAppStore } from '@/stores/app'

export function useAuditTrail () {
  const appStore = useAppStore()
  const loading = ref(false)

  // Log an audit event
  const logAuditEvent = async (
    action,
    details = {},
    resourceType = null,
    resourceId = null,
  ) => {
    try {
      const currentUser = appStore.currentUser

      if (!currentUser) {
        console.warn('No user found for audit logging')
        return
      }

      const auditData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: appStore.userName,
        userType: currentUser.userType,
        adminScope: currentUser.adminScope || null, // Include admin scope for Admin users
        managedAgencyId: currentUser.managedAgencyId || null, // Include managed agency for Agency Admin users
        action,
        details,
        resourceType,
        resourceId,
        timestamp: serverTimestamp(),
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
      }

      await addDoc(collection(db, 'auditTrail'), auditData)
      console.log('Audit event logged:', action, details)
    } catch (error) {
      console.error('Error logging audit event:', error)
    }
  }

  // Get client IP address (simplified - in production you'd get this from your backend)
  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.warn('Could not get IP address:', error)
      return 'Unknown'
    }
  }

  // Fetch audit trail entries
  const fetchAuditTrail = async (filters = {}) => {
    loading.value = true
    try {
      let q = collection(db, 'auditTrail')

      // Apply filters
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId))
      }
      if (filters.action) {
        q = query(q, where('action', '==', filters.action))
      }
      if (filters.resourceType) {
        q = query(q, where('resourceType', '==', filters.resourceType))
      }
      if (filters.userType) {
        q = query(q, where('userType', '==', filters.userType))
      }
      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', filters.startDate))
      }
      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', filters.endDate))
      }

      // Order by timestamp descending
      q = query(q, orderBy('timestamp', 'desc'))

      // Apply limit if specified
      if (filters.limit) {
        q = query(q, limit(filters.limit))
      }

      const querySnapshot = await getDocs(q)
      const auditEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }))

      return auditEntries
    } catch (error) {
      console.error('Error fetching audit trail:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Predefined audit actions
  const auditActions = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    ARCHIVE: 'ARCHIVE',
    RESTORE: 'RESTORE',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    ASSIGN: 'ASSIGN',
    UPLOAD: 'UPLOAD',
    DOWNLOAD: 'DOWNLOAD',
  }

  // Resource types
  const resourceTypes = {
    USER: 'USER',
    AGENCY: 'AGENCY',
    UNIT: 'UNIT',
    PROPERTY: 'PROPERTY',
    NOTICE: 'NOTICE',
    MAINTENANCE: 'MAINTENANCE',
    INSPECTION: 'INSPECTION',
    VACANCY: 'VACANCY',
    DOCUMENT: 'DOCUMENT',
    PROFILE: 'PROFILE',
  }

  return {
    logAuditEvent,
    fetchAuditTrail,
    auditActions,
    resourceTypes,
    loading,
  }
}
