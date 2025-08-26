<template>
  <div class="view-inspection-page">
    <v-container fluid>
      <!-- Filters and Add Inspection Entry -->
      <v-row class="mb-4">
        <v-col cols="12" md="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search inspection entries..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input"
            @input="filterEntries"
          />
        </v-col>

        <v-col v-if="!isAgencyUser" cols="12" md="3" class="pa-4">
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
            class="custom-input"
            :loading="agenciesLoading"
            @update:model-value="onAgencyChange"
          />
        </v-col>

        <v-col cols="12" md="2" class="pa-4">
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
            @input="filterEntries"
          />
        </v-col>

        <v-col cols="12" md="3" class="pa-4 d-flex align-center">
          <v-btn @click="addInspection" class="back-btn">
            Add Inspection
          </v-btn>
        </v-col>
      </v-row>

      <!-- Agency Info Card -->
      <v-row class="mb-6" v-if="selectedAgencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <v-row class="no-gutters" align="stretch">
              <v-col cols="12" md="3">
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

      <!-- Inspection Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredEntries"
            class="custom-header"
            density="comfortable"
            hover
            :loading="entriesLoading"
          >
            <template v-slot:item.inspectionRequired="{ item }">
              <v-chip :color="item.inspectionRequired === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.inspectionRequired }}
              </v-chip>
            </template>
            <template v-slot:item.appointmentMade="{ item }">
              <v-chip :color="item.appointmentMade === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.appointmentMade }}
              </v-chip>
            </template>
            <template v-slot:item.quotesNeeded="{ item }">
              <v-chip :color="item.quotesNeeded === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.quotesNeeded }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewEntry(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editEntry(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteEntry(item)"
                  class="action-btn"
                />
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <v-snackbar v-model="snackbar" timeout="3000">
        {{ snackbarMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn color="white" text v-bind="attrs" @click="snackbar=false">Close</v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { collection, getDocs, deleteDoc, doc, query, where, addDoc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: "InspectionPage",
  setup() {
    const { showConfirmDialog } = useCustomDialogs()
    return { showConfirmDialog }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      selectedAgency: null,
      filteredEntries: [],
      entries: [],
      agencies: [],
      entriesLoading: false,
      agenciesLoading: false,
      snackbar: false,
      snackbarMessage: "",
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Agency", key: "agencyName", sortable: true },
        { title: "Inspection Required", key: "inspectionRequired", sortable: true, align: "center" },
        { title: "Appointment Made", key: "appointmentMade", sortable: true, align: "center" },
        { title: "Inspection Date", key: "inspectionDate", sortable: true, align: "center" },
        { title: "Status", key: "status", sortable: true, align: "center" },
        { title: "Priority", key: "priority", sortable: true, align: "center" },
        { title: "Actions", key: "actions", sortable: false, align: "center" }
      ]
    };
  },
  computed: {
    selectedAgencyDetails() {
      return this.agencies.find(a => a.id === this.selectedAgency) || null;
    },
    isAgencyUser() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Agency';
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    },
    
    async fetchInspections(agencyId = null) {
      this.entriesLoading = true
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        console.log('Fetching inspections for agencyId:', agencyId);
        let inspectionsQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see their own inspections
          inspectionsQuery = query(
            collection(db, 'inspections'),
            where('agencyId', '==', currentUser.uid)
          );
          console.log('Querying inspections for agency user:', currentUser.uid);
        } else if (agencyId) {
          // Query inspection entries for specific agency
          inspectionsQuery = query(
            collection(db, 'inspections'),
            where('agencyId', '==', agencyId)
          );
          console.log('Querying inspections for specific agency:', agencyId);
        } else {
          // Query all inspection entries
          inspectionsQuery = collection(db, 'inspections');
          console.log('Querying all inspections');
        }
        
        const querySnapshot = await getDocs(inspectionsQuery)
        this.entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }))
        console.log('Inspections loaded:', this.entries.length);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
        
        // Log the first inspection structure if available
        if (this.entries.length > 0) {
          console.log('First inspection structure:', this.entries[0]);
          console.log('First inspection agencyId:', this.entries[0].agencyId);
        }
        
        this.filterEntries()
      } catch (error) {
        console.error('Error fetching inspections:', error)
        this.snackbarMessage = 'Failed to load inspections'
        this.snackbar = true
      } finally {
        this.entriesLoading = false
      }
    },

    async fetchAgencies(createTestData = true) {
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
          const agenciesQuery = query(
            collection(db, 'users'),
            where('userType', '==', 'Agency')
          );
          
          const querySnapshot = await getDocs(agenciesQuery);
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('Agencies fetched:', this.agencies);
          console.log('Number of agencies found:', this.agencies.length);
          
          // Log the first agency structure if available
          if (this.agencies.length > 0) {
            console.log('First agency structure:', this.agencies[0]);
            console.log('First agency agencyName:', this.agencies[0].agencyName);
          } else if (createTestData) {
            console.log('No agencies found in database');
            // Create some test agencies in the database
            await this.createTestAgencies();
          }
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        this.agenciesLoading = false;
      }
    },

    async createTestAgencies() {
      try {
        console.log('Creating test agencies...');
        const testAgencies = [
          {
            agencyName: 'Pam Golding Properties',
            userType: 'Agency',
            location: 'Cape Town, South Africa',
            establishedYear: 1976,
            numberOfProperties: 1250,
            rating: '5 Stars',
            agencyDescription: 'Premium real estate agency specializing in inspections.',
            agencyTagline: 'Excellence in Real Estate'
          },
          {
            agencyName: 'RE/MAX Properties',
            userType: 'Agency',
            location: 'Johannesburg, South Africa',
            establishedYear: 1973,
            numberOfProperties: 890,
            rating: '4 Stars',
            agencyDescription: 'Global real estate network with local expertise.',
            agencyTagline: 'Above the Crowd'
          },
          {
            agencyName: 'Seeff Properties',
            userType: 'Agency',
            location: 'Durban, South Africa',
            establishedYear: 1964,
            numberOfProperties: 1100,
            rating: '5 Stars',
            agencyDescription: 'Leading real estate agency with comprehensive property services.',
            agencyTagline: 'Your Property Partner'
          }
        ];

        const createdAgencies = [];
        for (const agencyData of testAgencies) {
          const docRef = await addDoc(collection(db, 'users'), agencyData);
          createdAgencies.push({ id: docRef.id, ...agencyData });
        }

        console.log('Test agencies created successfully');
        
        // Create some test inspections for these agencies
        await this.createTestInspections(createdAgencies);
        
        // Fetch agencies again
        await this.fetchAgencies();
      } catch (error) {
        console.error('Error creating test agencies:', error);
      }
    },

    async createTestInspections(agencies) {
      try {
        console.log('Creating test inspections...');
        const testInspections = [
          {
            agencyId: agencies[0].id,
            agencyName: agencies[0].agencyName,
            unitName: 'Unit 101 - Sea Point',
            inspectionRequired: 'Yes',
            contactPerson: 'John Smith',
            contactNumber: '+27 82 123 4567',
            appointmentMade: 'Yes',
            inspectionDate: '2024-12-15',
            quotesNeeded: 'No',
            status: 'Pending',
            priority: 'High',
            notes: 'Urgent inspection required for new tenant',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            agencyId: agencies[0].id,
            agencyName: agencies[0].agencyName,
            unitName: 'Unit 205 - Green Point',
            inspectionRequired: 'No',
            contactPerson: 'Sarah Johnson',
            contactNumber: '+27 83 234 5678',
            appointmentMade: 'No',
            inspectionDate: '2024-12-20',
            quotesNeeded: 'Yes',
            status: 'Completed',
            priority: 'Medium',
            notes: 'Routine maintenance inspection',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            agencyId: agencies[1].id,
            agencyName: agencies[1].agencyName,
            unitName: 'Unit 301 - Sandton',
            inspectionRequired: 'Yes',
            contactPerson: 'Mike Wilson',
            contactNumber: '+27 84 345 6789',
            appointmentMade: 'Yes',
            inspectionDate: '2024-12-18',
            quotesNeeded: 'Yes',
            status: 'In Progress',
            priority: 'Urgent',
            notes: 'Structural inspection needed',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            agencyId: agencies[2].id,
            agencyName: agencies[2].agencyName,
            unitName: 'Unit 102 - Umhlanga',
            inspectionRequired: 'No',
            contactPerson: 'Lisa Brown',
            contactNumber: '+27 85 456 7890',
            appointmentMade: 'No',
            inspectionDate: '2024-12-25',
            quotesNeeded: 'No',
            status: 'Pending',
            priority: 'Low',
            notes: 'Annual property inspection',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        for (const inspectionData of testInspections) {
          await addDoc(collection(db, 'inspections'), inspectionData);
        }

        console.log('Test inspections created successfully');
      } catch (error) {
        console.error('Error creating test inspections:', error);
      }
    },

    filterEntries() {
      this.filteredEntries = this.entries.filter(entry => {
        const textMatch = entry.unitName.toLowerCase().includes(this.searchQuery.toLowerCase());
        let agencyMatch = true;
        let monthMatch = true;
        
        if (this.selectedAgency) {
          agencyMatch = entry.agencyId === this.selectedAgency;
        }
        
        if (this.monthFilter) {
          const entryDate = new Date(entry.inspectionDate);
          const filterDate = new Date(this.monthFilter+"-01");
          monthMatch = entryDate.getMonth() === filterDate.getMonth() && entryDate.getFullYear() === filterDate.getFullYear();
        }
        return textMatch && agencyMatch && monthMatch;
      });
    },
    
    viewEntry(entry) { 
      this.$router.push(`/view-inspection-${entry.id}`); 
    },
    
    editEntry(entry) { 
      this.$router.push(`/edit-inspection-${entry.id}`); 
    },
    
    async deleteEntry(entry) {
      try {
        await this.showConfirmDialog({
          title: 'Delete inspection entry?',
          message: `Are you sure you want to delete inspection entry for ${entry.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        await deleteDoc(doc(db, 'inspections', entry.id))
        const index = this.entries.findIndex(e => e.id === entry.id);
        if(index > -1) {
          this.entries.splice(index, 1);
          this.filterEntries();
          this.snackbarMessage = `Deleted inspection entry for ${entry.unitName}`;
          this.snackbar = true;
        }
      } catch (error) {
        console.error('Error deleting inspection:', error)
        this.snackbarMessage = 'Failed to delete inspection entry'
        this.snackbar = true
      }
    },
    
    addInspection() { 
      this.$router.push('/add-inspection'); 
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      console.log('Available agencies:', this.agencies);
      console.log('Selected agency details:', this.selectedAgencyDetails);
      
      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }
      
      // Clear current entries before fetching new ones
      this.entries = [];
      this.filteredEntries = [];
      
      if (agencyId) {
        // Fetch inspection entries for selected agency
        console.log('Fetching inspections for agency:', agencyId);
        this.fetchInspections(agencyId);
      } else {
        // Fetch all inspection entries when no agency is selected
        console.log('Fetching all inspections');
        this.fetchInspections();
      }
    }
  },
  async mounted() { 
    document.title = "Inspections - Depsure";
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch inspections based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own inspections
      await this.fetchInspections();
    } else {
      // Super Admin/Admin users get all inspections initially
      await this.fetchInspections();
    }
  }
};
</script>

<style scoped>
/* reuse maintenance page styles */
.view-inspection-page { padding:20px; min-height:100vh; }
.back-btn { font-weight:500; text-transform:none; border-radius:8px; transition:all 0.3s; background:black; color:white; border:2px solid black; width:160px; height:44px; }
.back-btn:hover { background:#333; border-color:#333; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.5); }

.agency-info-card-black { background:linear-gradient(135deg,#000,#1a1a1a); border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.3); color:white; padding:0; }
.agency-logo-black { width:100%; height:100%; object-fit:cover; }
.agency-details-black { margin-bottom:16px; }
.detail-item-black { display:flex; align-items:center; margin-bottom:12px; color:#fff; }
.agency-description-black { color:#e0e0e0; line-height:1.6; margin:0; }

.custom-input .v-field { border-radius:8px; }

.action-btn-container { display:flex; justify-content:center; align-items:center; gap:4px; }
.action-btn { font-size:0.75rem; font-weight:500; text-transform:none; border-radius:6px; }
.action-btn:hover { transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.2); }

:deep(.custom-header .v-data-table-header) { background:#000; color:white; }

@media(max-width:768px){
  .back-btn { width:140px; height:40px; }
  .action-btn { font-size:0.7rem; padding:6px 8px; }
  .agency-info-card-black { text-align:center; }
  .agency-logo-black { height:220px; }
}
</style>
