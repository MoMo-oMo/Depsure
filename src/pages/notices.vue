<template>
  <div class="view-agency-page">
    <v-container fluid>
      <!-- Filters and Add Notice Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search notices..."
            prepend-inner-icon="mdi-magnify"
            flat
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
            flat
            density="comfortable"
            variant="outlined"
            type="month"
            hide-details
            dense
            class="custom-input"
            @input="filterProperties"
          />
        </v-col>

        <!-- Add Notice Button -->
        <v-col cols="12" md="3" lg="3" class="pa-4 d-flex align-center">
          <v-btn @click="addNotice" class="back-btn">
            Add Notice
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

      <!-- Notices Table -->
      <v-row>
        <v-col cols="12" class="pa-4">
          <!-- Notices Table -->
          <v-data-table
            :headers="headers"
            :items="filteredProperties"
            :search="searchQuery"
            class="custom-header"
            density="comfortable"
            hover
            :loading="propertiesLoading"
            no-data-text="No data available"
          >
            <template v-slot:item.maintenanceRequired="{ item }">
              <v-chip :color="item.maintenanceRequired === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.maintenanceRequired }}
              </v-chip>
            </template>

            <!-- Centered Action Buttons -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewProperty(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editProperty(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteProperty(item)"
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'

export default {
  name: "NoticePage",
  setup() {
    const { showSuccessDialog, showErrorDialog, showConfirmDialog } = useCustomDialogs()
    return { showSuccessDialog, showErrorDialog, showConfirmDialog }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      filteredProperties: [],
      selectedAgency: null,
      agencies: [],
      agenciesLoading: false,
      properties: [],
      propertiesLoading: false,
      headers: [
        { title: "UNIT NAME", key: "unitName", sortable: true },
        { title: "LEASE START DATE", key: "leaseStartDate", sortable: true, align: "center" },
        { title: "NOTICE GIVEN DATE", key: "noticeGivenDate", sortable: true, align: "center" },
        { title: "VACATE DATE", key: "vacateDate", sortable: true, align: "center" },
        {
          title: "MAINTENANCE REQUIRED AFTER INSPECTION YES/NO",
          key: "maintenanceRequired",
          sortable: true,
          align: "center",
        },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ],
    };
  },
  computed: {
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.id === this.selectedAgency) || null;
    },
    isAgencyUser() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Agency';
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },
    filterProperties() {
      this.filteredProperties = this.properties.filter((property) => {
        const textMatch =
          property.unitName.toLowerCase().includes(this.searchQuery.toLowerCase());
        
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
          
          const filterDate = new Date(this.monthFilter + "-01");
          const propertyMonth = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, "0")}`;
          return textMatch && propertyMonth === filterMonth;
        }
        return textMatch;
      });
    },
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency') {
          // Agency users can only see their own agency
          const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (agencyDoc.exists()) {
            const agencyData = agencyDoc.data();
            this.agencies = [{
              id: agencyDoc.id,
              ...agencyData
            }];
            // Pre-select the agency for agency users
            this.selectedAgency = agencyDoc.id;
          } else {
            this.agencies = [];
          }
          console.log('Agency user - own agency loaded:', this.agencies);
        } else {
          // Super Admin and Admin users can see all agencies
          console.log('Fetching agencies...');
          const agenciesQuery = query(collection(db, 'users'), where('userType', '==', 'Agency'));
          const agenciesSnapshot = await getDocs(agenciesQuery);
          
          this.agencies = agenciesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('All agencies loaded:', this.agencies);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        this.agenciesLoading = false;
      }
    },
    
    async fetchNotices(agencyId = null) {
      this.propertiesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        console.log('Fetching notices...');
        let noticesQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see their own notices
          noticesQuery = query(collection(db, 'notices'), where('agencyId', '==', currentUser.uid));
        } else if (agencyId) {
          // Super Admin/Admin users query notices for specific agency
          noticesQuery = query(collection(db, 'notices'), where('agencyId', '==', agencyId));
        } else {
          // Super Admin/Admin users query all notices when no agency selected
          noticesQuery = collection(db, 'notices');
        }
        
        const noticesSnapshot = await getDocs(noticesQuery);
        
        this.properties = noticesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Notices loaded:', this.properties);
        console.log('Number of notices found:', this.properties.length);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
        
        // Log the first notice structure if available
        if (this.properties.length > 0) {
          console.log('First notice structure:', this.properties[0]);
        }
        
        // Apply filters after loading
        this.filterProperties();
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        this.propertiesLoading = false;
      }
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }
      
      this.fetchNotices(agencyId);
    },
    
    viewProperty(property) { this.$router.push(`/view-notice-${property.id}`); },
    editProperty(property) { this.$router.push(`/edit-notice-${property.id}`); },
    async deleteProperty(property) {
      try {
        await this.showConfirmDialog({
          title: 'Delete notice?',
          message: `Are you sure you want to delete notice for ${property.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        console.log('Deleting notice:', property.id);
        await deleteDoc(doc(db, 'notices', property.id));
        const index = this.properties.findIndex((p) => p.id === property.id);
        if (index > -1) {
          this.properties.splice(index, 1);
          this.filterProperties();
        }
        this.showSuccessDialog(`Notice for ${property.unitName} deleted successfully!`, 'Success!', 'Continue');
      } catch (error) {
        console.error('Error deleting notice:', error);
        this.showErrorDialog(`Failed to delete notice: ${error.message}`, 'Error', 'OK');
      }
    },
    addNotice() { this.$router.push('/add-notice'); },
  },
  async mounted() {
    document.title = "Notice Page - Depsure";
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch notices based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own notices
      await this.fetchNotices();
    } else {
      // Super Admin/Admin users get all notices initially
      await this.fetchNotices();
    }
  },
};
</script>

<style scoped>
.view-agency-page { padding: 20px; min-height: 100vh; }

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

.agency-info-card-black {
  background: linear-gradient(135deg,#000000 0%,#1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  color: white;
  padding: 0;
}

.no-gutters { --v-gutter-x:0; --v-gutter-y:0; margin:0 !important; }
.agency-logo-black { display:block; width:100%; height:100%; object-fit:cover; }
.agency-details-black { margin-bottom:16px; }
.detail-item-black { display:flex; align-items:center; margin-bottom:12px; font-size:1rem; color:#fff; }
.agency-description-black { font-size:1rem; line-height:1.6; color:#e0e0e0; margin:0; }

.custom-input .v-field { border-radius:8px; }

.action-btn-container { display:flex; justify-content:center; align-items:center; gap:4px; height:100%; }
.action-btn { margin:0; font-size:0.75rem; font-weight:500; text-transform:none; border-radius:6px; transition:all 0.3s ease; }
.action-btn:hover { transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.2); }

:deep(.custom-header .v-data-table-header) { background-color:#000 !important; }
:deep(.custom-header .v-data-table-header th) { background-color:#000 !important; color:white !important; }
:deep(.custom-header .v-data-table-header .v-data-table-header__content) { color:white !important; }

@media (max-width:768px){
  .view-agency-page { padding:10px; }
  .back-btn { width:140px; height:40px; }
  .action-btn { font-size:0.7rem; padding:6px 8px; }
  .agency-info-card-black { text-align:center; }
  .agency-logo-black { margin:0; width:100%; height:220px; object-fit:cover; }
}
</style>
