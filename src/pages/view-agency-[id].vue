<template>
  <div class="view-agency-page">
    <v-container fluid>
      
      <!-- Back Button only -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/agencies')"
            class="back-btn"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State with Skeleton -->
      <div v-if="loading">
        <!-- Skeleton for Agency Info Card -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card class="agency-info-card-black skeleton-card">
              <v-row align="stretch" class="no-gutters">
                <v-col cols="12" md="3" class="pa-0 ma-0">
                  <v-skeleton-loader
                    type="image"
                    height="100%"
                    class="agency-logo-black"
                  />
                </v-col>
                <v-col cols="12" md="9" class="pa-4">
                  <v-skeleton-loader
                    type="heading"
                    class="mb-4"
                  />
                  <div class="agency-details-black">
                    <v-skeleton-loader
                      v-for="i in 4"
                      :key="i"
                      type="list-item-two-line"
                      class="mb-2"
                    />
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <v-skeleton-loader
                    type="paragraph"
                    class="mt-4"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- Skeleton for Properties Table -->
        <v-row>
          <v-col cols="12" class="pa-4">
            <v-card class="table-card">
              <v-skeleton-loader
                type="table-heading"
                class="mb-4"
              />
              <v-skeleton-loader
                v-for="i in 5"
                :key="i"
                type="table-row"
                class="mb-2"
              />
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Agency Information Card - Black Rectangle -->
      <v-row v-else class="mb-6">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <div class="agency-card-bg" :style="agencyCardBgStyle"></div>
            <!-- Remove all grid gutters and stretch columns so the image fills its whole section -->
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12" md="9">
                <div class="agency-content-right">
                  <v-card-title class="text-white text-h4 mb-2">{{ agency.agencyName }}</v-card-title>
                 <v-card-text class="text-white">
                 <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ agency.address || 'Address not provided' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-card-account-details" class="mr-2 text-white" />
                      <span>Reg No: {{ agency.regNo || '—' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-account" class="mr-2 text-white" />
                      <span>Primary Contact: {{ agency.primaryContactName || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-phone" class="mr-2 text-white" />
                      <span>{{ agency.contactNumber || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-email" class="mr-2 text-white" />
                      <span>{{ agency.email || 'N/A' }}</span>
                    </div>
                  </div>
                  <v-divider v-if="agency.notes" class="my-4 bg-white" />
                  <p v-if="agency.notes" class="agency-description-black">{{ agency.notes }}</p>
                </v-card-text>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search Section -->
 

      <!-- Info-only: no table or actions below -->
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAppStore } from '@/stores/app'

export default {
  name: 'ViewAgencyPage',
  setup() {
    const { showConfirmDialog } = useCustomDialogs()
    return { showConfirmDialog }
  },
  data() {
    return {
      agency: {},
      loading: false
    }
  },
  computed: {
    agencyCardBgStyle() {
      const url = this.agency?.profileImageUrl || this.agency?.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
      return {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000'
      }
    }
  },
  methods: {
    openMonthPicker() {
      const el = this.$refs.monthInput?.$el?.querySelector('input');
      if (el) {
        if (typeof el.showPicker === 'function') el.showPicker();
        else el.focus();
      }
    },
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    },
    filterProperties() {
      this.filteredProperties = this.properties.filter(property => {
        // Text search filter
        const textMatch = property.tenantRef.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.propertyName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.newOccupation.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.contractorRequested.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.paidOut.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        // Month filter - now filtering by createdAt date
        if (this.monthFilter) {
          // Handle Firestore Timestamp objects
          let propertyDate;
          if (property.createdAt && property.createdAt.toDate) {
            // Firestore Timestamp object
            propertyDate = property.createdAt.toDate();
          } else if (property.createdAt) {
            // Regular Date object or date string
            propertyDate = new Date(property.createdAt);
          } else {
            // No createdAt date, skip this property
            return textMatch;
          }
          
          const filterDate = new Date(this.monthFilter + '-01');
          const propertyMonth = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, '0')}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}`;
          
          return textMatch && propertyMonth === filterMonth;
        }
        
        return textMatch;
      });
    },
    viewProperty(property) {
      console.log('Viewing property:', property);
      // Navigate to property details page
      this.$router.push(`/view-property-${property.id}`);
    },
    editProperty(property) {
      console.log('Editing property:', property);
      // Navigate to edit property page
      this.$router.push(`/edit-property-${property.id}`);
    },
    async deleteProperty(property) {
      console.log('Deleting property:', property);
      try {
        await this.showConfirmDialog({
          title: 'Delete property?',
          message: `Are you sure you want to delete property ${property.tenantRef}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      const index = this.properties.findIndex(p => p.id === property.id);
      if (index > -1) {
        this.properties.splice(index, 1);
        this.filterProperties(); // Refresh filtered list
      }
    },
    addUnit() {
      console.log('Adding new unit');
      // Navigate to add unit page with agency ID
      this.$router.push(`/add-unit?agencyId=${this.agency.id}`);
    },
    
    async fetchProperties(agencyId) {
      this.propertiesLoading = true;
      try {
        // Query units collection for properties belonging to this agency
        const unitsQuery = query(
          collection(db, 'units'),
          where('agencyId', '==', agencyId)
        );
        
        const querySnapshot = await getDocs(unitsQuery);
        this.properties = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Apply initial filtering
        this.filterProperties();
        console.log('Properties fetched for agency:', this.properties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        this.propertiesLoading = false;
      }
    },
    
    async fetchAgencyData(agencyId) {
      this.loading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        // Check if user has permission to view this agency
        if (userType === 'Agency' && currentUser.uid !== agencyId) {
          console.error('Agency user can only view their own agency');
          this.$router.push('/active-units');
          return;
        }
        
        const agencyDoc = await getDoc(doc(db, 'users', agencyId));
        
        if (agencyDoc.exists()) {
          const agencyData = agencyDoc.data();
          this.agency = {
            id: agencyDoc.id,
            ...agencyData
          };
          console.log('Agency data loaded:', this.agency);
          
          // Fetch properties for this agency
          await this.fetchProperties(agencyId);
        } else {
          console.error('Agency not found');
          // Handle agency not found - could redirect to 404 or show error
        }
      } catch (error) {
        console.error('Error fetching agency data:', error);
      } finally {
        this.loading = false;
      }
    }
  },
  async mounted() {
    // Set the page title for the app bar
    document.title = 'Agency Details - Depsure';
    
    // Get agency ID from route params
    const agencyId = this.$route.params.id;
    if (agencyId) {
      console.log('Loading agency with ID:', agencyId);
      await this.fetchAgencyData(agencyId);
    } else {
      console.error('No agency ID provided in route');
    }
  }
}
</script>

<style scoped>
.agency-card-bg { position:absolute; inset:0; z-index:0; }
.agency-info-card-black { position: relative; }
.agency-info-card-black::after { content:''; position:absolute; inset:0; background:linear-gradient(to left, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0)); pointer-events:none; }
.agency-info-card-black .no-gutters, .agency-info-card-black .v-row { position:relative; z-index:1; }
.agency-content-right { margin-left:auto; width:min(720px,55%); padding:16px 16px 24px; text-align:left; }
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

/* Skeleton Loading Styles */
.skeleton-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%) !important;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.v-skeleton-loader) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.v-skeleton-loader__bone) {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%) !important;
  animation: skeleton-loading 1.5s infinite !important;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
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
}
</style>
