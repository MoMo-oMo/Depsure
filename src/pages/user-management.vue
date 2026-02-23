<template>
  <div class="user-management-page">
    <v-container fluid>
      <!-- Filters and Add User Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            clearable
            dense
            class="custom-input"
            density="comfortable"
            flat
            hide-details
            label="Search users..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @input="filterUsers"
          />
        </v-col>

        <!-- Date filter -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model="dateFilter"
            dense
            class="custom-input"
            density="comfortable"
            flat
            hide-details
            label="Filter by date added"
            prepend-inner-icon="mdi-calendar"
            type="date"
            variant="outlined"
            @input="filterUsers"
          />
        </v-col>

        <!-- User Type Filter -->
        <v-col cols="12" md="3">
          <v-select
            v-model="userTypeFilter"
            dense
            density="comfortable"
            class="custom-input"
            flat
            hide-details
            :items="['All', 'Agency', 'Admin', 'Super Admin']"
            label="Filter by user type"
            prepend-inner-icon="mdi-account-group"
            variant="outlined"
            @update:model-value="filterUsers"
          />
        </v-col>

        <!-- Add User Button -->
        <v-col class="d-flex align-center" cols="12" md="2">
          <v-btn class="back-btn" @click="addUser">
            Add User
          </v-btn>
        </v-col>
      </v-row>

      <!-- User Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            class="custom-header"
            density="comfortable"
            :headers="headers"
            hover
            :items="filteredUsers"
            :loading="loading"
            no-data-text="No data available"
          >
            <!-- User Type -->
            <template #item.userType="{ item }">
              <v-chip
                :color="getUserTypeColor(item.userType)"
                size="small"
                variant="tonal"
              >
                {{ item.userType }}
              </v-chip>
            </template>

            <!-- Status -->
            <template #item.status="{ item }">
              <v-chip
                :color="item.status === 'Active' ? 'success' : 'error'"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Date Added -->
            <template #item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <!-- Action Buttons -->
            <template #item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  class="action-btn"
                  color="black"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewUser(item)"
                />
                <v-btn
                  class="action-btn"
                  color="black"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="editUser(item)"
                />
                <v-btn
                  class="action-btn"
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="deleteUser(item)"
                />
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
  import { deleteObject, listAll, ref as storageRef } from 'firebase/storage'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { db, storage } from '@/firebaseConfig'

  export default {
    name: 'UserManagement',
    setup () {
      const { showErrorDialog, showConfirmDialog } = useCustomDialogs()
      const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
      return { showErrorDialog, showConfirmDialog, logAuditEvent, auditActions, resourceTypes }
    },
    data () {
      return {
        searchQuery: '',
        dateFilter: '',
        userTypeFilter: 'All',
        filteredUsers: [],
        users: [],
        loading: false,
        headers: [
          { title: 'NAME', key: 'displayName', sortable: true, width: '15%' },
          { title: 'EMAIL', key: 'email', sortable: true, width: '25%' },
          { title: 'USER TYPE', key: 'userType', sortable: true, align: 'center', width: '12%' },
          { title: 'STATUS', key: 'status', sortable: true, align: 'center', width: '10%' },
          { title: 'DATE ADDED', key: 'createdAt', sortable: true, align: 'center', width: '15%' },
          { title: 'ACTIONS', key: 'actions', sortable: false, align: 'center', width: '15%' },
        ],
      }
    },

    async mounted () {
      await this.fetchUsers()
    },
    methods: {
      formatDate (dateString) {
        if (!dateString) return 'N/A'
        const date = dateString instanceof Date ? dateString : dateString.toDate()
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },

      getUserTypeColor (userType) {
        const colors = {
          'Agency': 'primary',
          'Admin': 'warning',
          'Super Admin': 'error',
        }
        return colors[userType] || 'default'
      },

      filterUsers () {
        this.filteredUsers = this.users.filter(user => {
          const textMatch = user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
            || (user.displayName && user.displayName.toLowerCase().includes(this.searchQuery.toLowerCase()))

          let dateMatch = true
          if (this.dateFilter && user.createdAt) {
            const userDate = user.createdAt instanceof Date ? user.createdAt : user.createdAt.toDate()
            const filterDate = new Date(this.dateFilter)
            dateMatch = userDate.toDateString() === filterDate.toDateString()
          }

          let typeMatch = true
          if (this.userTypeFilter !== 'All') {
            typeMatch = user.userType === this.userTypeFilter
          }

          return textMatch && dateMatch && typeMatch
        })
      },

      viewUser (user) {
        this.$router.push(`/view-user-${user.id}`)
      },

      editUser (user) {
        this.$router.push(`/edit-user-${user.id}`)
      },

      async deleteUser (user) {
        try {
          await this.showConfirmDialog({
            title: 'Delete user?',
            message: `Are you sure you want to delete ${user.email}?${user.userType === 'Agency' ? ' This will permanently delete ALL associated data including: units, flagged units, notices, maintenance, inspections, vacancies, chat messages, archived units, audit logs, and uploaded files. This action cannot be undone.' : ''}`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            color: '#dc3545',
          })
        } catch {
          return
        }
        try {
          // If deleting an Agency, cascade delete all associated records
          if (user.userType === 'Agency') {
            const agencyId = user.id

            // Delete all units for this agency
            const unitsQuery = query(collection(db, 'units'), where('agencyId', '==', agencyId))
            const unitsSnapshot = await getDocs(unitsQuery)
            const unitDeletePromises = unitsSnapshot.docs.map(unitDoc => deleteDoc(unitDoc.ref))
            await Promise.all(unitDeletePromises)

            // Delete all flagged units for this agency
            const flaggedQuery = query(collection(db, 'flaggedUnits'), where('agencyId', '==', agencyId))
            const flaggedSnapshot = await getDocs(flaggedQuery)
            const flaggedDeletePromises = flaggedSnapshot.docs.map(flaggedDoc => deleteDoc(flaggedDoc.ref))
            await Promise.all(flaggedDeletePromises)

            // Delete all notices for this agency
            const noticesQuery = query(collection(db, 'notices'), where('agencyId', '==', agencyId))
            const noticesSnapshot = await getDocs(noticesQuery)
            const noticesDeletePromises = noticesSnapshot.docs.map(noticeDoc => deleteDoc(noticeDoc.ref))
            await Promise.all(noticesDeletePromises)

            // Delete all maintenance for this agency
            const maintenanceQuery = query(collection(db, 'maintenance'), where('agencyId', '==', agencyId))
            const maintenanceSnapshot = await getDocs(maintenanceQuery)
            const maintenanceDeletePromises = maintenanceSnapshot.docs.map(mainDoc => deleteDoc(mainDoc.ref))
            await Promise.all(maintenanceDeletePromises)

            // Delete all inspections for this agency
            const inspectionsQuery = query(collection(db, 'inspections'), where('agencyId', '==', agencyId))
            const inspectionsSnapshot = await getDocs(inspectionsQuery)
            const inspectionsDeletePromises = inspectionsSnapshot.docs.map(inspDoc => deleteDoc(inspDoc.ref))
            await Promise.all(inspectionsDeletePromises)

            // Delete all vacancies for this agency
            const vacanciesQuery = query(collection(db, 'vacancies'), where('agencyId', '==', agencyId))
            const vacanciesSnapshot = await getDocs(vacanciesQuery)
            const vacanciesDeletePromises = vacanciesSnapshot.docs.map(vacDoc => deleteDoc(vacDoc.ref))
            await Promise.all(vacanciesDeletePromises)

            // Delete all chats for this agency
            const chatsQuery = query(collection(db, 'chats'), where('agencyId', '==', agencyId))
            const chatsSnapshot = await getDocs(chatsQuery)
            const chatsDeletePromises = chatsSnapshot.docs.map(chatDoc => deleteDoc(chatDoc.ref))
            await Promise.all(chatsDeletePromises)

            // Delete all archived units for this agency
            const archivedQuery = query(collection(db, 'archivedUnits'), where('agencyId', '==', agencyId))
            const archivedSnapshot = await getDocs(archivedQuery)
            const archivedDeletePromises = archivedSnapshot.docs.map(archivedDoc => deleteDoc(archivedDoc.ref))
            await Promise.all(archivedDeletePromises)

            // Delete audit trail entries for this agency
            const auditQuery = query(collection(db, 'auditTrail'), where('resourceId', '==', agencyId))
            const auditSnapshot = await getDocs(auditQuery)
            const auditDeletePromises = auditSnapshot.docs.map(auditDoc => deleteDoc(auditDoc.ref))
            await Promise.all(auditDeletePromises)

            // Clean up Firebase Storage files associated with this agency
            await this.cleanupAgencyStorageFiles(agencyId)
          } else {
            // For non-agency users (Admin, Super Admin), clean up their audit trail entries
            const auditQuery = query(collection(db, 'auditTrail'), where('userId', '==', user.id))
            const auditSnapshot = await getDocs(auditQuery)
            const auditDeletePromises = auditSnapshot.docs.map(auditDoc => deleteDoc(auditDoc.ref))
            await Promise.all(auditDeletePromises)
          }

          // Delete the user/agency document
          await deleteDoc(doc(db, 'users', user.id))
          const index = this.users.findIndex(u => u.id === user.id)
          if (index !== -1) this.users.splice(index, 1)
          this.filterUsers()

          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.DELETE,
            {
              email: user.email,
              userType: user.userType,
              displayName: user.displayName,
              cascadingDelete: user.userType === 'Agency',
            },
            this.resourceTypes.USER,
            user.id,
          )
        } catch (error) {
          console.error('Error deleting user:', error)
          this.showErrorDialog('Failed to delete user. Please try again.', 'Error', 'OK')
        }
      },

      async cleanupAgencyStorageFiles (agencyId) {
        try {
          // Clean up chat uploads
          const chatUploadsRef = storageRef(storage, `chat_uploads/${agencyId}/`)
          const chatUploadsList = await listAll(chatUploadsRef)
          const chatDeletePromises = chatUploadsList.items.map(item => deleteObject(item))
          await Promise.all(chatDeletePromises)

          // Clean up maintenance quote files
          const maintenanceQuotesRef = storageRef(storage, 'maintenance-quotes/')
          const maintenanceQuotesList = await listAll(maintenanceQuotesRef)
          const maintenanceDeletePromises = maintenanceQuotesList.items
            .filter(item => item.name.includes(agencyId))
            .map(item => deleteObject(item))
          await Promise.all(maintenanceDeletePromises)

        // Clean up any other agency-specific files
        // Add more cleanup paths as needed based on your storage structure
        } catch (error) {
          console.error('Error cleaning up storage files:', error)
        // Don't throw error - storage cleanup is not critical for deletion
        }
      },

      addUser () {
        this.$router.push('/add-user')
      },

      async fetchUsers () {
        this.loading = true
        try {
          const querySnapshot = await getDocs(collection(db, 'users'))
          this.users = querySnapshot.docs.map(doc => {
            const userData = doc.data()
            return {
              id: doc.id,
              ...userData,
              displayName: this.getDisplayName(userData),
            }
          })
          this.filteredUsers = this.users
        } catch (error) {
          console.error('Error fetching users:', error)
        } finally {
          this.loading = false
        }
      },

      getDisplayName (user) {
        // If user is an Agency type, show agency name
        if (user.userType === 'Agency') {
          return user.agencyName || 'Unknown Agency'
        }

        // For Super Admin, Admin, and normal users, show firstName lastName
        if (user.firstName && user.lastName) {
          return `${user.firstName} ${user.lastName}`
        } else if (user.firstName) {
          return user.firstName
        } else if (user.lastName) {
          return user.lastName
        }

        // Fallback for users without name fields
        return user.email || 'Unknown User'
      },
    },
  }
</script>

<style scoped>
.user-management-page {
  padding: 20px;
  min-height: 100vh;
}

.back-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black !important;
  color: white !important;
  border: 2px solid black !important;
  width: 160px;
  height: 44px;
}

.back-btn:hover {
  background-color: #333 !important;
  border-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.custom-input .v-field {
  border-radius: 8px;
}

.action-btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.action-btn {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

:deep(.custom-header .v-data-table-header) {
  background: #000;
  color: white;
}

:deep(.custom-header .v-data-table__wrapper) {
  table-layout: fixed;
}

:deep(.custom-header .v-data-table th) {
  padding: 8px 12px !important;
  font-size: 0.85rem !important;
}

:deep(.custom-header .v-data-table td) {
  padding: 8px 12px !important;
  font-size: 0.85rem !important;
}

@media(max-width: 768px) {
  .back-btn {
    width: 140px;
    height: 40px;
  }

  .action-btn {
    font-size: 0.7rem;
  }
}
</style>
