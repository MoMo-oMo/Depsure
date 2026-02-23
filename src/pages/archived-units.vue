<template>
  <div class="archived-units-page">
    <v-container fluid>
      <!-- Header with Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn my-7"
            color="black"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/profile')"
          >
            Back to Profile
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->

      <!-- Filters -->
      <v-row class="mb-4" style="margin-top: -33px">
        <!-- Search -->
        <v-col class="pa-4" cols="12" lg="3" md="3">
          <v-text-field
            v-model="searchQuery"
            clearable
            dense
            class="custom-input top-filter"
            density="comfortable"
            :flat="true"
            hide-details
            label="Search archived properties..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @input="filterProperties"
          />
        </v-col>

        <!-- Agency Select -->
        <v-col
          v-if="!isAgencyUser && !hasCurrentAgency"
          class="pa-4"
          cols="12"
          lg="2"
          md="2"
        >
          <v-select
            v-model="selectedAgency"
            density="comfortable"
            class="custom-input top-filter"
            hide-details
            item-title="agencyName"
            item-value="id"
            :items="agencies"
            label="Select Agency"
            :loading="agenciesLoading"
            prepend-inner-icon="mdi-domain"
            variant="outlined"
            @update:model-value="onAgencyChange"
          />
        </v-col>

        <!-- Month filter -->
        <v-col class="pa-4" cols="12" lg="3" md="2">
          <v-menu
            v-model="monthMenu"
            :close-on-content-click="false"
            location="bottom"
            transition="fade-transition"
            @update:model-value="onMonthMenuToggle"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                append-inner-icon="mdi-calendar-month"
                dense
                density="comfortable"
                class="custom-input top-filter month-input flex-grow-1"
                :flat="true"
                hide-details
                label="Filter by month"
                :model-value="monthFilterLabel"
                readonly
                variant="outlined"
              />
            </template>
            <div class="month-menu">
              <div class="month-menu__title">Pick month</div>
              <input
                class="month-menu__input"
                type="month"
                :value="tempMonth"
                @input="
                  (e) => {
                    tempMonth = e.target.value;
                  }
                "
              >
              <div class="month-menu__actions">
                <v-btn
                  color="black"
                  size="small"
                  variant="elevated"
                  @click="applyMonth"
                >Apply</v-btn>
                <v-btn
                  color="grey"
                  size="small"
                  variant="text"
                  @click="clearMonth"
                >All</v-btn>
              </div>
            </div>
          </v-menu>
        </v-col>

        <!-- Property Type filter -->
        <v-col class="pa-4" cols="12" lg="2" md="2">
          <v-select
            v-model="propertyTypeFilter"
            class="custom-input top-filter"
            density="comfortable"
            hide-details
            item-title="title"
            item-value="value"
            :items="propertyTypeFilterOptions"
            label="Property Type"
            prepend-inner-icon="mdi-home"
            variant="outlined"
            @update:model-value="filterProperties"
          />
        </v-col>

        <!-- Restore All Button -->
        <v-col
          v-if="isSuperAdmin"
          class="pa-4 d-flex align-center"
          cols="12"
          lg="2"
          md="2"
        >
          <v-btn
            class="back-btn"
            color="success"
            :disabled="filteredProperties.length === 0"
            prepend-icon="mdi-restore"
            variant="outlined"
            @click="restoreAllUnits"
          >
            Restore All
          </v-btn>
        </v-col>
      </v-row>

      <!-- Agency Info Card (only when selected) -->
      <v-row v-if="selectedAgencyDetails" class="mb-6">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <div class="agency-card-bg" :style="agencyCardBgStyle" />
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12">
                <div class="agency-content-right">
                  <v-card-title class="text-white text-h4 mb-2">
                    {{ selectedAgencyDetails.agencyName }}
                  </v-card-title>
                  <v-card-text class="text-white">
                    <div class="agency-details-black">
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-map-marker" />
                        <span>{{
                          selectedAgencyDetails.address ||
                            "Address not provided"
                        }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon
                          class="mr-2 text-white"
                          icon="mdi-card-account-details"
                        />
                        <span>Reg No:
                          {{ selectedAgencyDetails.regNo || "—" }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-account" />
                        <span>Primary Contact:
                          {{
                            selectedAgencyDetails.primaryContactName || "N/A"
                          }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-phone" />
                        <span>{{
                          selectedAgencyDetails.contactNumber || "N/A"
                        }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-email" />
                        <span>{{ selectedAgencyDetails.email || "N/A" }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-home" />
                        <span>{{ activeUnitsCount }} Properties</span>
                      </div>
                    </div>
                    <!-- Description hidden to reduce visual noise over image -->
                    <!-- <v-divider class="my-4 bg-white" /> -->
                  </v-card-text>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Archived Properties Table -->
      <v-row>
        <v-col class="pa-4" cols="12">
          <v-data-table
            class="custom-header"
            density="comfortable"
            :headers="headers"
            hover
            :items="filteredProperties"
            :loading="propertiesLoading"
            no-data-text="No archived units found"
            :search="searchQuery"
          >
            <template #item.propertyType="{ item }">
              <v-chip
                :color="getColor(item.propertyType)"
                size="small"
                variant="elevated"
              >
                {{ getLabel(item.propertyType) }}
              </v-chip>
            </template>
            <!-- Truncate long property names for alignment -->
            <template #item.propertyName="{ item }">
              <span class="truncate-cell" :title="item.propertyName">{{
                item.propertyName
              }}</span>
            </template>
            <template #item.archivedAt="{ item }">
              <span class="font-weight-medium text-grey">
                {{ formatDate(item.archivedAt) }}
              </span>
            </template>
            <template #item.actions="{ item }">
              <div class="v-data-table_actions-cell">
                <v-btn
                  class="action-btn"
                  color="black"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewProperty(item)"
                />
                <v-btn
                  class="action-btn"
                  color="success"
                  icon="mdi-restore"
                  size="small"
                  variant="text"
                  @click="restoreProperty(item)"
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
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
  } from 'firebase/firestore'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { useNotification } from '@/composables/useNotification'
  import { usePropertyType } from '@/composables/usePropertyType'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'ArchivedUnitsPage',
    setup () {
      const appStore = useAppStore()
      const { showConfirmDialog } = useCustomDialogs()
      const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
      const { getOptions, getLabel, getColor } = usePropertyType()
      const { showSuccess, showError } = useNotification()
      return {
        appStore,
        showConfirmDialog,
        logAuditEvent,
        auditActions,
        resourceTypes,
        getOptions,
        getLabel,
        getColor,
        showSuccess,
        showError,
      }
    },
    data () {
      return {
        searchQuery: '',
        monthFilter: '',
        monthMenu: false,
        tempMonth: '',
        propertyTypeFilter: null,
        filteredProperties: [],
        properties: [],
        propertiesLoading: true,
        agencies: [],
        agenciesLoading: false,
        selectedAgency: null,
        activeUnitsCount: 0,
        propertyTypeFilterOptions: [
          { title: 'All Types', value: null },
          { title: 'Residential', value: 'residential' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Industrial', value: 'industrial' },
        ],
        headers: [
          { title: 'Tenant Ref', key: 'tenantRef', sortable: true },
          { title: 'Property Name', key: 'propertyName', sortable: true },
          { title: 'Property Type', key: 'propertyType', sortable: true },
          { title: 'Archived Date', key: 'archivedAt', sortable: true },
          { title: 'Actions', key: 'actions', sortable: false },
        ],
      }
    },
    computed: {
      agencyCardBgStyle () {
        const url
          = this.selectedAgencyDetails?.profileImageUrl
            || this.selectedAgencyDetails?.profileImage
            || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
        return {
          background: `url(${url}) center/cover no-repeat`,
        }
      },
      monthFilterLabel () {
        if (!this.monthFilter) return 'All Months'
        try {
          const [yy, mm] = String(this.monthFilter).split('-')
          const d = new Date(Number(yy), Number(mm) - 1, 1)
          return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        } catch {
          return this.monthFilter
        }
      },
      hasCurrentAgency () {
        const appStore = useAppStore()
        return !!appStore.currentAgency
      },
      selectedAgencyDetails () {
        return this.agencies.find(a => a.id === this.selectedAgency) || null
      },
      isAgencyUser () {
        const user = this.appStore.currentUser
        return (
          user?.userType === 'Agency'
          || (user?.userType === 'Admin' && user?.adminScope === 'agency')
        )
      },
      isSuperAdmin () {
        return this.appStore.userType === 'Super Admin'
      },
    },
    async mounted () {
      await this.loadAgencies()
      await this.loadArchivedProperties()
      if (this.isAgencyUser) {
        await this.refreshActiveUnitsCount()
      } else if (this.selectedAgency) {
        await this.refreshActiveUnitsCount(this.selectedAgency)
      }
    },
    methods: {
      onMonthMenuToggle (open) {
        if (open) this.tempMonth = this.monthFilter || ''
      },
      applyMonth () {
        this.monthFilter = this.tempMonth || ''
        this.filterProperties()
        this.monthMenu = false
      },
      clearMonth () {
        this.tempMonth = ''
        this.monthFilter = ''
        this.filterProperties()
        this.monthMenu = false
      },
      openMonthPicker () {
        const el = this.$refs.monthInput?.$el?.querySelector('input')
        if (el) {
          if (typeof el.showPicker === 'function') el.showPicker()
          else el.focus()
        }
      },
      async refreshActiveUnitsCount (agencyId = null) {
        try {
          const currentUser = this.appStore.currentUser
          const userType = currentUser?.userType
          let unitsQuery
          if (userType === 'Agency') {
            unitsQuery = query(
              collection(db, 'units'),
              where('agencyId', '==', currentUser.uid),
            )
          } else if (agencyId) {
            unitsQuery = query(
              collection(db, 'units'),
              where('agencyId', '==', agencyId),
            )
          } else {
            this.activeUnitsCount = 0
            return
          }
          const snap = await getDocs(unitsQuery)
          this.activeUnitsCount = snap.size
        } catch (error) {
          console.error('Error counting active units:', error)
          this.activeUnitsCount = 0
        }
      },
      getCurrentMonth () {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          '0',
        )}`
      },

      async loadAgencies () {
        if (this.isAgencyUser) return

        this.agenciesLoading = true
        try {
          const currentUser = this.appStore.currentUser
          const userType = currentUser?.userType

          if (userType === 'Agency') {
            // Agency users can only see their own agency
            const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid))
            if (agencyDoc.exists()) {
              const agencyData = agencyDoc.data()
              this.agencies = [
                {
                  id: agencyDoc.id,
                  ...agencyData,
                },
              ]
              // Pre-select the agency for agency users
              this.selectedAgency = agencyDoc.id
              await this.refreshActiveUnitsCount(this.selectedAgency)
            } else {
              this.agencies = []
            }
          } else {
            // Super Admin and Admin users can see all agencies
            const agenciesQuery = query(
              collection(db, 'users'),
              where('userType', '==', 'Agency'),
            )

            const querySnapshot = await getDocs(agenciesQuery)
            this.agencies = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
          }
        } catch (error) {
          console.error('Error loading agencies:', error)
        } finally {
          this.agenciesLoading = false
        }
      },

      async loadArchivedProperties () {
        this.propertiesLoading = true
        try {
          let propertiesQuery

          if (this.isAgencyUser) {
            // Agency users only see their own archived units
            propertiesQuery = query(
              collection(db, 'archivedUnits'),
              where('agencyId', '==', this.appStore.currentUser.uid),
            )
          } else if (this.selectedAgency) {
            // Super Admin/Admin users query archived units for specific agency
            propertiesQuery = query(
              collection(db, 'archivedUnits'),
              where('agencyId', '==', this.selectedAgency),
            )
          } else {
            // Super Admin/Admin users query all archived units when no agency selected
            propertiesQuery = query(collection(db, 'archivedUnits'))
          }

          const propertiesSnapshot = await getDocs(propertiesQuery)
          this.properties = propertiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))

          this.filteredProperties = [...this.properties]
        } catch (error) {
          console.error('Error loading archived properties:', error)
        } finally {
          this.propertiesLoading = false
        }
      },

      async onAgencyChange () {
        await this.loadArchivedProperties()
        if (this.selectedAgency)
          await this.refreshActiveUnitsCount(this.selectedAgency)
      },

      filterProperties () {
        let filtered = [...this.properties]

        // Search filter
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase()
          filtered = filtered.filter(
            property =>
              property.tenantRef?.toLowerCase().includes(query)
              || property.propertyName?.toLowerCase().includes(query),
          )
        }

        // Month filter - now filtering by archivedAt date
        if (this.monthFilter) {
          filtered = filtered.filter(property => {
            if (!property.archivedAt) return false
            // Handle both Firestore Timestamp and regular Date objects
            let propertyDate
            propertyDate = property.archivedAt.toDate ? new Date(property.archivedAt.toDate()) : new Date(property.archivedAt)
            const filterDate = new Date(this.monthFilter + '-01')
            return (
              propertyDate.getFullYear() === filterDate.getFullYear()
              && propertyDate.getMonth() === filterDate.getMonth()
            )
          })
        }

        // Property type filter
        if (this.propertyTypeFilter) {
          filtered = filtered.filter(
            property => property.propertyType === this.propertyTypeFilter,
          )
        }

        this.filteredProperties = filtered
      },

      formatDate (date) {
        if (!date) return 'N/A'
        // Handle both Firestore Timestamp and regular Date objects
        return date.toDate ? new Date(date.toDate()).toLocaleDateString() : new Date(date).toLocaleDateString()
      },

      viewProperty (property) {
        // Navigate to view archived unit page
        this.$router.push(`/view-archived-unit-${property.id}`)
      },

      async restoreProperty (property) {
        const confirmed = await this.showConfirmDialog({
          title: 'Restore Property',
          message: `Are you sure you want to restore "${property.propertyName}"? This will move it back to active units.`,
          confirmText: 'Restore',
          color: '#28a745',
        })

        if (confirmed) {
          try {
            // Create exact duplicate in units collection
            const restoredUnitData = {
              ...property,
              restoredAt: new Date(),
              restoredBy: this.appStore.currentUser?.uid || 'unknown',
              restoredByUserType:
                this.appStore.currentUser?.userType || 'unknown',
              // Ensure the restored unit is unflagged
              isFlagged: false,
            }

            // Remove fields that shouldn't be in active units
            delete restoredUnitData.id
            delete restoredUnitData.originalId
            delete restoredUnitData.archivedAt
            delete restoredUnitData.archivedBy
            delete restoredUnitData.archivedByUserType

            // Add to units collection
            const unitsRef = collection(db, 'units')
            await addDoc(unitsRef, restoredUnitData)

            // Remove from flaggedUnits collection if it exists there
            // This ensures the restored unit is truly unflagged
            try {
              const flaggedQuery = query(
                collection(db, 'flaggedUnits'),
                where(
                  'unitName',
                  '==',
                  property.propertyName || property.unitName,
                ),
              )
              const flaggedSnapshot = await getDocs(flaggedQuery)
              if (!flaggedSnapshot.empty) {
                const flaggedDoc = flaggedSnapshot.docs[0]
                await deleteDoc(doc(db, 'flaggedUnits', flaggedDoc.id))
                console.log('Removed flagged unit entry for restored unit')
              }
            } catch (error) {
              console.warn('Could not remove flagged unit entry:', error)
            // Don't fail the restore if we can't remove the flagged entry
            }

            // Log audit event
            await this.logAuditEvent(
              this.auditActions.RESTORE,
              {
                propertyName: property.propertyName,
                tenantRef: property.tenantRef,
                originalId: property.originalId,
              },
              this.resourceTypes.PROPERTY,
              property.id,
            )

            // Delete from archivedUnits collection
            const archivedPropertyRef = doc(db, 'archivedUnits', property.id)
            await deleteDoc(archivedPropertyRef)

            // Remove from local list
            this.properties = this.properties.filter(p => p.id !== property.id)
            this.filterProperties()

            this.showSuccess('Property restored successfully')
          } catch (error) {
            console.error('Error restoring property:', error)
            this.showError('Failed to restore property')
          }
        }
      },

      async restoreAllUnits () {
        const confirmed = await this.showConfirmDialog({
          title: 'Restore All Units',
          message: `Are you sure you want to restore all ${this.filteredProperties.length} archived units?`,
          confirmText: 'Restore All',
          color: '#28a745',
        })

        if (confirmed) {
          try {
            const restorePromises = this.filteredProperties.map(
              async property => {
                // Create exact duplicate in units collection
                const restoredUnitData = {
                  ...property,
                  restoredAt: new Date(),
                  restoredBy: this.appStore.currentUser?.uid || 'unknown',
                  restoredByUserType:
                    this.appStore.currentUser?.userType || 'unknown',
                  // Ensure the restored unit is unflagged
                  isFlagged: false,
                }

                // Remove fields that shouldn't be in active units
                delete restoredUnitData.id
                delete restoredUnitData.originalId
                delete restoredUnitData.archivedAt
                delete restoredUnitData.archivedBy
                delete restoredUnitData.archivedByUserType

                // Add to units collection
                const unitsRef = collection(db, 'units')
                await addDoc(unitsRef, restoredUnitData)

                // Remove from flaggedUnits collection if it exists there
                // This ensures the restored unit is truly unflagged
                try {
                  const flaggedQuery = query(
                    collection(db, 'flaggedUnits'),
                    where(
                      'unitName',
                      '==',
                      property.propertyName || property.unitName,
                    ),
                  )
                  const flaggedSnapshot = await getDocs(flaggedQuery)
                  if (!flaggedSnapshot.empty) {
                    const flaggedDoc = flaggedSnapshot.docs[0]
                    await deleteDoc(doc(db, 'flaggedUnits', flaggedDoc.id))
                    console.log('Removed flagged unit entry for restored unit')
                  }
                } catch (error) {
                  console.warn('Could not remove flagged unit entry:', error)
                // Don't fail the restore if we can't remove the flagged entry
                }

                // Log audit event
                await this.logAuditEvent(
                  this.auditActions.RESTORE,
                  {
                    propertyName: property.propertyName,
                    tenantRef: property.tenantRef,
                    originalId: property.originalId,
                  },
                  this.resourceTypes.PROPERTY,
                  property.id,
                )

                // Delete from archivedUnits collection
                const archivedPropertyRef = doc(db, 'archivedUnits', property.id)
                await deleteDoc(archivedPropertyRef)
              },
            )

            await Promise.all(restorePromises)

            // Clear local list
            this.properties = []
            this.filteredProperties = []

            this.showSuccess('All units restored successfully')
          } catch (error) {
            console.error('Error restoring all units:', error)
            this.showError('Failed to restore all units')
          }
        }
      },
    },
  }
</script>

<style scoped>
.archived-units-page {
  min-height: 100vh;
}

.title-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.back-btn {
  margin-bottom: 1rem;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0;
  position: relative;
}
/* Background image layer */
.agency-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Remove row/column gutters so the image sits flush with the top/edges */
.no-gutters {
  --v-gutter-x: 0;
  --v-gutter-y: 0;
  margin: 0 !important;
}

/* Make the image fill its column completely with no top padding */
.agency-logo-black {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Right-side details */
.agency-details-black {
  margin-bottom: 16px;
}

/* Dark right-to-left gradient overlay */
.agency-info-card-black::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.85) 45%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none;
}
.agency-info-card-black .no-gutters,
.agency-info-card-black .v-row {
  position: relative;
  z-index: 1;
}

/* Content aligned to the right dark area */
.agency-content-right {
  margin-left: auto;
  width: min(720px, 55%);
  padding: 16px 16px 24px;
  text-align: left;
}

.detail-item-black {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #ffffff;
}

.agency-description-black {
  font-size: 1rem;
  line-height: 1.6;
  color: #e0e0e0;
  margin: 0;
}

/* Truncate long table cell values without breaking layout */
.truncate-cell {
  display: inline-block;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  .agency-content-right {
    width: 100%;
  }

  .agency-name {
    font-size: 1.25rem;
  }
}
.month-input {
  min-width: 220px;
}
:deep(.month-input .v-field-label) {
  white-space: nowrap;
}

/* Custom month menu styling */
.month-menu {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 12px;
  min-width: 260px;
}
.month-menu__title {
  font-weight: 600;
  margin-bottom: 8px;
}
.month-menu__input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
}
.month-menu__input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}
.month-menu__actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
</style>
