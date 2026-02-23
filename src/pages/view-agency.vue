<template>
  <div class="view-agency-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/agencies')"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        />
        <p class="mt-4">Loading agency details...</p>
      </div>

      <!-- Agency Information Card - Black Rectangle -->
      <v-row v-else class="mb-6">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <!-- Background image layer -->
            <div class="agency-card-bg" />
            <!-- Remove all grid gutters and stretch columns so the image fills its whole section -->
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12">
                <div class="agency-content-right">
                  <v-card-title class="agency-title text-white text-h4 mb-2">{{ agency.agencyName }}</v-card-title>
                  <v-card-text class="text-white">
                    <div class="agency-details-black">
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-map-marker" />
                        <span>{{ agency.address || 'Address not provided' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-card-account-details" />
                        <span>Reg No: {{ agency.regNo || '—' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-account" />
                        <span>Primary Contact: {{ agency.primaryContactName || 'N/A' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-phone" />
                        <span>{{ agency.contactNumber || 'N/A' }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-email" />
                        <span>{{ agency.email || 'N/A' }}</span>
                      </div>
                    </div>
                    <v-divider class="my-4 bg-white" />
                    <p v-if="agency.notes" class="agency-description-black">{{ agency.notes }}</p>
                  </v-card-text>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Info-only: no table or actions below -->
    </v-container>
  </div>
</template>

<script>
  import { doc, getDoc } from 'firebase/firestore'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'ViewAgencyPage',
    setup () {
      const { showConfirmDialog } = useCustomDialogs()
      return { showConfirmDialog }
    },
    data () {
      return {
        searchQuery: '',
        monthFilter: this.getCurrentMonth(),
        filteredProperties: [],
        agency: {},
        loading: false,
        properties: [
          {
            id: 1,
            tenantRef: 'T001',
            propertyName: '123 Main Street, Cape Town',
            newOccupation: 'Yes',
            leaseStartDate: '2024-01-15',
            leaseEndDate: '2025-01-15',
            monthsMissed: 2,
            maintenanceAmount: 15_000,
            contractorRequested: 'Yes',
            paidTowardsFund: 5000,
            amountToBePaidOut: 25_000,
            paidOut: 'No',
          },
          {
            id: 2,
            tenantRef: 'T002',
            propertyName: '456 Ocean Drive, Camps Bay',
            newOccupation: 'No',
            leaseStartDate: '2023-06-01',
            leaseEndDate: '2024-06-01',
            monthsMissed: 0,
            maintenanceAmount: 8000,
            contractorRequested: 'No',
            paidTowardsFund: 12_000,
            amountToBePaidOut: 0,
            paidOut: 'Yes',
          },
          {
            id: 3,
            tenantRef: 'T003',
            propertyName: '789 Mountain View, Constantia',
            newOccupation: 'Yes',
            leaseStartDate: '2024-02-01',
            leaseEndDate: '2025-02-01',
            monthsMissed: 1,
            maintenanceAmount: 22_000,
            contractorRequested: 'Yes',
            paidTowardsFund: 8000,
            amountToBePaidOut: 18_000,
            paidOut: 'No',
          },
          {
            id: 4,
            tenantRef: 'T004',
            propertyName: '321 Beach Road, Clifton',
            newOccupation: 'No',
            leaseStartDate: '2023-09-15',
            leaseEndDate: '2024-09-15',
            monthsMissed: 3,
            maintenanceAmount: 30_000,
            contractorRequested: 'Yes',
            paidTowardsFund: 15_000,
            amountToBePaidOut: 35_000,
            paidOut: 'No',
          },
          {
            id: 5,
            tenantRef: 'T005',
            propertyName: '654 Garden Street, Newlands',
            newOccupation: 'Yes',
            leaseStartDate: '2024-03-01',
            leaseEndDate: '2025-03-01',
            monthsMissed: 0,
            maintenanceAmount: 12_000,
            contractorRequested: 'No',
            paidTowardsFund: 10_000,
            amountToBePaidOut: 0,
            paidOut: 'Yes',
          },
        ],
        headers: [
          { title: 'TENANT REF', key: 'tenantRef', sortable: true },
          { title: 'PROPERTY NAME', key: 'propertyName', sortable: true },
          { title: 'LEASE STARTING DATE', key: 'leaseStartDate', sortable: true, align: 'center' },
          { title: 'MONTHS MISSED', key: 'monthsMissed', sortable: true, align: 'center' },
          { title: 'MAINTENANCE AMOUNT', key: 'maintenanceAmount', sortable: true, align: 'end' },
          { title: 'PAID OUT', key: 'paidOut', sortable: true, align: 'center' },
          { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
        ],
      }
    },
    computed: {
      filteredProperties () {
        return this.properties
      },
      activeProperties () {
        return this.properties.filter(p => p.status === 'Active').length
      },
      soldProperties () {
        return this.properties.filter(p => p.status === 'Sold').length
      },
      isSuperAdmin () {
        const appStore = useAppStore()
        return appStore.currentUser?.userType === 'Super Admin'
      },
    },
    async mounted () {
      // Set the page title for the app bar
      document.title = 'Agency Details - Depsure'

      // Initialize filteredProperties with all properties
      this.filteredProperties = this.properties

      // Get agency ID from route params or path
      let agencyId = this.$route.params.id

      // If no ID in params, try to extract from the path
      if (!agencyId) {
        const pathParts = this.$route.path.split('/')
        const lastPart = pathParts.at(-1)
        if (lastPart && lastPart.startsWith('view-agency-')) {
          agencyId = lastPart.replace('view-agency-', '')
        }
      }

      if (agencyId) {
        console.log('Loading agency with ID:', agencyId)
        await this.fetchAgencyData(agencyId)
      } else {
        console.error('No agency ID provided in route')
      }
    },
    methods: {
      openMonthPicker () {
        const el = this.$refs.monthInput?.$el?.querySelector('input')
        if (el) {
          if (typeof el.showPicker === 'function') el.showPicker()
          else el.focus()
        }
      },
      getCurrentMonth () {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}`
      },
      filterProperties () {
        this.filteredProperties = this.properties.filter(property => {
          // Text search filter
          const textMatch = property.tenantRef.toLowerCase().includes(this.searchQuery.toLowerCase())
            || property.propertyName.toLowerCase().includes(this.searchQuery.toLowerCase())
            || property.newOccupation.toLowerCase().includes(this.searchQuery.toLowerCase())
            || property.contractorRequested.toLowerCase().includes(this.searchQuery.toLowerCase())
            || property.paidOut.toLowerCase().includes(this.searchQuery.toLowerCase())

          // Month filter
          if (this.monthFilter) {
            const propertyDate = new Date(property.leaseStartDate)
            const filterDate = new Date(this.monthFilter + '-01')
            const propertyMonth = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, '0')}`
            const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}`

            return textMatch && propertyMonth === filterMonth
          }

          return textMatch
        })
      },
      viewProperty (property) {
        console.log('Viewing property:', property)
        // Navigate to property details page
        this.$router.push(`/view-property-${property.id}`)
      },
      editProperty (property) {
        console.log('Editing property:', property)
        // Navigate to edit property page
        this.$router.push(`/edit-property-${property.id}`)
      },
      async deleteProperty (property) {
        console.log('Deleting property:', property)
        try {
          await this.showConfirmDialog({
            title: 'Delete property?',
            message: `Are you sure you want to delete property ${property.tenantRef}?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            color: '#dc3545',
          })
        } catch {
          return
        }
        const index = this.properties.findIndex(p => p.id === property.id)
        if (index !== -1) {
          this.properties.splice(index, 1)
          this.filterProperties()
        }
      },
      addUnit () {
        console.log('Adding new unit')
        this.$router.push('/add-unit')
      },

      async fetchAgencyData (agencyId) {
        this.loading = true
        try {
          const agencyDoc = await getDoc(doc(db, 'users', agencyId))

          if (agencyDoc.exists()) {
            const agencyData = agencyDoc.data()
            this.agency = {
              id: agencyDoc.id,
              ...agencyData,
            }
            console.log('Agency data loaded:', this.agency)
          } else {
            console.error('Agency not found')
          // Handle agency not found - could redirect to 404 or show error
          }
        } catch (error) {
          console.error('Error fetching agency data:', error)
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>

<style scoped>
.view-agency-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling to match system buttons */
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Table card styling - less curved */
.table-card {
  border-radius: 6px !important;
}

/* Kill all internal padding on the card shell; v-card-title / v-card-text have their own spacing */
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
  background-image: url('https://i.pinimg.com/736x/4a/e1/03/4ae1030bfab9ca4b172a312e87982f35.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Dark right-to-left gradient overlay behind info */
.agency-info-card-black::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to left, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0));
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
  width: min(1100px, 80%);
  padding: 16px 16px 24px;
  text-align: left;
}

.agency-title {
  display: block;
  margin: 0 0 8px;
  white-space: nowrap !important;
  overflow: visible;
  text-overflow: unset;
  line-height: 1.2;
  width: 100%;
  max-width: 100%;
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

/* Search field styling to match agency page */
.custom-input .v-field {
  border-radius: 8px;
}

.search-field {
  max-width: 300px;
}

/* Action Button Styling */
.action-btn {
  margin: 0 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Custom table header styling - black headers */
:deep(.custom-header .v-data-table-header) {
  background-color: #000000 !important;
}

:deep(.custom-header .v-data-table-header th) {
  background-color: #000000 !important;
  color: white !important;
}

:deep(.custom-header .v-data-table-header .v-data-table-header__content) {
  color: white !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-agency-page {
    padding: 10px;
  }

  .search-field {
    max-width: 100%;
  }

  .back-btn {
    width: 140px;
    height: 40px;
  }

  .action-btn {
    font-size: 0.7rem;
    padding: 6px 8px;
  }

  .agency-info-card-black {
    text-align: center;
  }

  /* Full-bleed image on mobile as well */
  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px; /* give it a nice visible height when stacked */
    object-fit: cover;
  }
  .agency-content-right {
    width: 100%;
  }
}
</style>
