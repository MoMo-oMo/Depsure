<template>
  <div class="archived-units-page">
    <v-container fluid>
      <!-- Header with Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="black"
            @click="$router.push('/profile')"
            class="back-btn my-7"
          >
            Back to Profile
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
    
      <!-- Filters -->
      <v-row class="mb-4" style="margin-top: -33px;">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search archived properties..."
            prepend-inner-icon="mdi-magnify"
            flat="true"
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input"
            @input="filterProperties"
          />
        </v-col>

        <!-- Agency Select -->
        <v-col v-if="!isAgencyUser" cols="12" md="2" lg="2" class="pa-4">
          <v-select
            v-model="selectedAgency"
            :items="agencies"
            item-title="agencyName"
            item-value="id"
            label="Select Agency"
            prepend-inner-icon="mdi-domain"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            :loading="agenciesLoading"
            class="custom-input"
            @update:model-value="onAgencyChange"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="2" lg="2" class="pa-4">
          <v-text-field
            v-model="monthFilter"
            label="Filter by month"
            prepend-inner-icon="mdi-calendar"
            flat="true"
            density="comfortable"
            variant="outlined"
            type="month"
            hide-details
            dense
            class="custom-input"
            @input="filterProperties"
          />
        </v-col>

        <!-- Property Type filter -->
        <v-col cols="12" md="2" lg="2" class="pa-4">
          <v-select
            v-model="propertyTypeFilter"
            :items="propertyTypeFilterOptions"
            item-title="title"
            item-value="value"
            label="Property Type"
            prepend-inner-icon="mdi-home"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            class="custom-input"
            @update:model-value="filterProperties"
          />
        </v-col>

        <!-- Restore All Button -->
        <v-col cols="12" md="2" lg="2" class="pa-4 d-flex align-center" v-if="isSuperAdmin">
          <v-btn
            prepend-icon="mdi-restore"
            variant="outlined"
            color="success"
            @click="restoreAllUnits"
            :disabled="filteredProperties.length === 0"
            class="back-btn"
          >
            Restore All
          </v-btn>
        </v-col>
      </v-row>

      <!-- Agency Info Card (only when selected) -->
      <v-row class="mb-6" v-if="selectedAgencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12" md="3" class="pa-0 ma-0">
                <v-img
                  :src="selectedAgencyDetails.profileImageUrl || selectedAgencyDetails.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'"
                  :alt="selectedAgencyDetails.agencyName"
                  height="100%"
                  cover
                  class="agency-logo-black"
                />
              </v-col>
              <v-col cols="12" md="9">
                <v-card-title class="text-white text-h4 mb-2">
                  {{ selectedAgencyDetails.agencyName }}
                </v-card-title>
                <v-card-text class="text-white">
                  <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.location || 'Location not specified' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-calendar" class="mr-2 text-white" />
                      <span>Established: {{ selectedAgencyDetails.establishedYear || 'Year not specified' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-home" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.numberOfProperties || 0 }} Properties</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-star" class="mr-2 text-white" />
                      <span>Rating: {{ selectedAgencyDetails.rating || 'Not rated' }}</span>
                    </div>
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <p class="agency-description-black">
                    {{ selectedAgencyDetails.agencyDescription || selectedAgencyDetails.agencyTagline || 'No description available' }}
                  </p>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Archived Properties Table -->
      <v-row>
        <v-col cols="12" class="pa-4">
          <v-data-table
            :headers="headers"
            :items="filteredProperties"
            :search="searchQuery"
            class="custom-header"
            density="comfortable"
            hover
            :loading="propertiesLoading"
            no-data-text="No archived units found"
          >
            <template v-slot:item.propertyType="{ item }">
              <v-chip 
                :color="getColor(item.propertyType)" 
                size="small"
                variant="elevated"
              >
                {{ getLabel(item.propertyType) }}
              </v-chip>
            </template>
            <template v-slot:item.paidOut="{ item }">
              <v-chip :color="item.paidOut === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.paidOut }}
              </v-chip>
            </template>
            <template v-slot:item.maintenanceAmount="{ item }">
              <span class="font-weight-medium">
                R{{ item.maintenanceAmount.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.paidTowardsFund="{ item }">
              <span class="font-weight-medium">
                R{{ item.paidTowardsFund.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.amountToBePaidOut="{ item }">
              <span class="font-weight-medium">
                R{{ item.amountToBePaidOut.toLocaleString() }}
              </span>
            </template>
                         <template v-slot:item.archivedAt="{ item }">
               <span class="font-weight-medium text-grey">
                 {{ formatDate(item.archivedAt) }}
               </span>
             </template>
                         <template v-slot:item.actions="{ item }">
               <div class="v-data-table_actions-cell">
                 <v-btn
                   icon="mdi-eye"
                   size="small"
                   variant="text"
                   color="black"
                   @click="viewProperty(item)"
                   class="action-btn"
                 />
                 <v-btn
                   icon="mdi-restore"
                   size="small"
                   variant="text"
                   color="success"
                   @click="restoreProperty(item)"
                   class="action-btn"
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
import { db } from '@/firebaseConfig'
import { collection, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'
import { useNotification } from '@/composables/useNotification'

export default {
  name: "ArchivedUnitsPage",
  setup() {
    const appStore = useAppStore()
    const { showConfirmDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getOptions, getLabel, getColor } = usePropertyType()
    const { showSuccess, showError } = useNotification()
    return { appStore, showConfirmDialog, logAuditEvent, auditActions, resourceTypes, getOptions, getLabel, getColor, showSuccess, showError }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      propertyTypeFilter: null,
      filteredProperties: [],
      properties: [],
      propertiesLoading: true,
      agencies: [],
      agenciesLoading: false,
      selectedAgency: null,
      selectedAgencyDetails: null,
      propertyTypeFilterOptions: [
        { title: 'All Types', value: null },
        { title: 'Apartment', value: 'apartment' },
        { title: 'House', value: 'house' },
        { title: 'Townhouse', value: 'townhouse' },
        { title: 'Condo', value: 'condo' },
        { title: 'Studio', value: 'studio' }
      ],
      headers: [
        { title: 'Tenant Ref', key: 'tenantRef', sortable: true },
        { title: 'Property Name', key: 'propertyName', sortable: true },
        { title: 'Property Type', key: 'propertyType', sortable: true },
        { title: 'Paid Out', key: 'paidOut', sortable: true },
        { title: 'Maintenance Amount', key: 'maintenanceAmount', sortable: true },
        { title: 'Paid Towards Fund', key: 'paidTowardsFund', sortable: true },
        { title: 'Amount to be Paid Out', key: 'amountToBePaidOut', sortable: true },
                 { title: 'Archived Date', key: 'archivedAt', sortable: true },
        { title: 'Actions', key: 'actions', sortable: false }
      ]
    }
  },
  computed: {
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.id === this.selectedAgency) || null;
    },
    isAgencyUser() {
      return this.appStore.userType === 'Agency'
    },
    isSuperAdmin() {
      return this.appStore.userType === 'Super Admin'
    }
  },
  async mounted() {
    await this.loadAgencies()
    await this.loadArchivedProperties()
  },
  methods: {
    getCurrentMonth() {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },
    
    async loadAgencies() {
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
            this.agencies = [{
              id: agencyDoc.id,
              ...agencyData
            }]
            // Pre-select the agency for agency users
            this.selectedAgency = agencyDoc.id
          } else {
            this.agencies = []
          }
        } else {
          // Super Admin and Admin users can see all agencies
          const agenciesQuery = query(
            collection(db, 'users'),
            where('userType', '==', 'Agency')
          )
          
          const querySnapshot = await getDocs(agenciesQuery)
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        }
      } catch (error) {
        console.error('Error loading agencies:', error)
      } finally {
        this.agenciesLoading = false
      }
    },

    async loadArchivedProperties() {
      this.propertiesLoading = true
      try {
        let propertiesQuery
        
        if (this.isAgencyUser) {
          // Agency users only see their own archived units
          propertiesQuery = query(
            collection(db, 'archivedUnits'),
            where('agencyId', '==', this.appStore.currentUser.uid)
          )
        } else if (this.selectedAgency) {
          // Super Admin/Admin users query archived units for specific agency
          propertiesQuery = query(
            collection(db, 'archivedUnits'),
            where('agencyId', '==', this.selectedAgency)
          )
        } else {
          // Super Admin/Admin users query all archived units when no agency selected
          propertiesQuery = query(
            collection(db, 'archivedUnits')
          )
        }

        const propertiesSnapshot = await getDocs(propertiesQuery)
        this.properties = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        this.filteredProperties = [...this.properties]
      } catch (error) {
        console.error('Error loading archived properties:', error)
      } finally {
        this.propertiesLoading = false
      }
    },

    async onAgencyChange() {
      await this.loadArchivedProperties()
    },

    filterProperties() {
      let filtered = [...this.properties]

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(property => 
          property.tenantRef?.toLowerCase().includes(query) ||
          property.propertyName?.toLowerCase().includes(query)
        )
      }

             // Month filter - now filtering by archivedAt date
       if (this.monthFilter) {
         filtered = filtered.filter(property => {
           if (!property.archivedAt) return false
           // Handle both Firestore Timestamp and regular Date objects
           let propertyDate;
           if (property.archivedAt.toDate) {
             propertyDate = new Date(property.archivedAt.toDate())
           } else {
             propertyDate = new Date(property.archivedAt)
           }
           const filterDate = new Date(this.monthFilter + "-01")
           return propertyDate.getFullYear() === filterDate.getFullYear() &&
                  propertyDate.getMonth() === filterDate.getMonth()
         })
       }

      // Property type filter
      if (this.propertyTypeFilter) {
        filtered = filtered.filter(property => 
          property.propertyType === this.propertyTypeFilter
        )
      }

      this.filteredProperties = filtered
    },

    formatDate(date) {
      if (!date) return 'N/A'
      // Handle both Firestore Timestamp and regular Date objects
      if (date.toDate) {
        return new Date(date.toDate()).toLocaleDateString()
      } else {
        return new Date(date).toLocaleDateString()
      }
    },

    viewProperty(property) {
      // Navigate to view archived unit page
      this.$router.push(`/view-archived-unit-${property.id}`)
    },

    async restoreProperty(property) {
      const confirmed = await this.showConfirmDialog({
        title: 'Restore Property',
        message: `Are you sure you want to restore "${property.propertyName}"? This will move it back to active units.`,
        confirmText: 'Restore',
        color: '#28a745'
      })

      if (confirmed) {
        try {
          // Create exact duplicate in units collection
          const restoredUnitData = {
            ...property,
            restoredAt: new Date(),
            restoredBy: this.appStore.currentUser?.uid || 'unknown',
            restoredByUserType: this.appStore.currentUser?.userType || 'unknown'
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
          
          // Log audit event
          await this.logAuditEvent(
            this.auditActions.RESTORE,
            {
              propertyName: property.propertyName,
              tenantRef: property.tenantRef,
              originalId: property.originalId
            },
            this.resourceTypes.PROPERTY,
            property.id
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

    async restoreAllUnits() {
      const confirmed = await this.showConfirmDialog({
        title: 'Restore All Units',
        message: `Are you sure you want to restore all ${this.filteredProperties.length} archived units?`,
        confirmText: 'Restore All',
        color: '#28a745'
      })

      if (confirmed) {
        try {
          const restorePromises = this.filteredProperties.map(async (property) => {
            // Create exact duplicate in units collection
            const restoredUnitData = {
              ...property,
              restoredAt: new Date(),
              restoredBy: this.appStore.currentUser?.uid || 'unknown',
              restoredByUserType: this.appStore.currentUser?.userType || 'unknown'
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
            
            // Log audit event
            await this.logAuditEvent(
              this.auditActions.RESTORE,
              {
                propertyName: property.propertyName,
                tenantRef: property.tenantRef,
                originalId: property.originalId
              },
              this.resourceTypes.PROPERTY,
              property.id
            )
            
            // Delete from archivedUnits collection
            const archivedPropertyRef = doc(db, 'archivedUnits', property.id)
            await deleteDoc(archivedPropertyRef)
          })

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


  }
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

/* Responsive design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .agency-name {
    font-size: 1.25rem;
  }
}
</style>
