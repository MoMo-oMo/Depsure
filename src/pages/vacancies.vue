<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      <!-- Filters and Add Vacancy Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="2">
          <v-text-field
            v-model="searchQuery"
            label="Search vacancy entries..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input"
            @input="filterVacancies"
          />
        </v-col>

        <!-- Agency Filter -->
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
            class="custom-input"
            :loading="agenciesLoading"
            @update:model-value="onAgencyChange"
          />
        </v-col>

        <!-- Property Type Filter -->
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
            @update:model-value="filterVacancies"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="2" lg="2">
          <v-text-field
            v-model="monthFilter"
            label="Filter by creation month"
            prepend-inner-icon="mdi-calendar"
            flat
            density="comfortable"
            variant="outlined"
            type="month"
            hide-details
            dense
            class="custom-input"
            @input="filterVacancies"
          />
        </v-col>

        <!-- Add Vacancy Button - Only visible to Agency users -->
        <v-col cols="12" md="3" lg="3" class="d-flex align-center" v-if="isAgencyUser">
          <v-btn @click="addVacancy" class="back-btn">
            Add Vacancy
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
                      <span>{{ activeUnitsCount }} Properties</span>
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

      <!-- Vacancy Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredVacancies"
            :loading="vacanciesLoading"
            class="custom-header"
            density="comfortable"
            hover
            no-data-text="No data available"
          >
            <!-- New Tenant Found -->
            <template v-slot:item.newTenantFound="{ item }">
              <v-chip 
                :color="item.newTenantFound === 'Yes' ? 'success' : 'error'"
                size="small"
              >
                {{ item.newTenantFound }}
              </v-chip>
            </template>

            <!-- Date Vacated -->
            <template v-slot:item.dateVacated="{ item }">
              {{ formatDate(item.dateVacated) }}
            </template>

            <!-- Move In Date -->
            <template v-slot:item.moveInDate="{ item }">
              {{ item.moveInDate ? formatDate(item.moveInDate) : 'Not specified' }}
            </template>

            <!-- Property Type -->
            <template v-slot:item.propertyType="{ item }">
              <v-chip
                :color="getPropertyTypeColor(item.propertyType)"
                size="small"
                variant="outlined"
              >
                {{ getPropertyTypeLabel(item.propertyType) }}
              </v-chip>
            </template>

            <!-- Action Buttons -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewVacancy(item)"
                  class="action-btn"
                />
                <v-btn
                  v-if="!isSuperAdmin"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editVacancy(item)"
                  class="action-btn"
                />
                <v-btn
                  v-if="!isSuperAdmin"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteVacancy(item)"
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
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: "ViewVacancies",
  setup() {
    const { showErrorDialog, showConfirmDialog } = useCustomDialogs()
    const { getLabel, getColor, getOptions, resolvePropertyTypeFromUnit } = usePropertyType()
    return { 
      showErrorDialog, 
      showConfirmDialog,
      getPropertyTypeLabel: getLabel,
      getPropertyTypeColor: getColor,
      resolvePropertyTypeFromUnit
    }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      selectedAgency: null,
      propertyTypeFilter: null,
      filteredVacancies: [],
      vacancies: [],
      agencies: [],
      agenciesLoading: false,
      vacanciesLoading: false,
      activeUnitsCount: 0,
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Date Vacated", key: "dateVacated", sortable: true, align: "center" },
        { title: "New Tenant Found", key: "newTenantFound", sortable: true, align: "center" },
        { title: "Move In Date", key: "moveInDate", sortable: true, align: "center" },
        { title: "Property Type", key: "propertyType", sortable: true, align: "center" },
        { title: "Property Manager", key: "propertyManager", sortable: true },
        { title: "Contact Number", key: "contactNumber", sortable: true },
        { title: "Notes", key: "notes", sortable: false },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
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
    },
    isSuperAdmin() {
      const appStore = useAppStore();
      const userType = appStore.currentUser?.userType;
      console.log('Vacancies - User Type:', userType, 'Is Super Admin:', userType === 'Super Admin');
      return userType === 'Super Admin';
    },
    propertyTypeFilterOptions() {
      const { getOptions } = usePropertyType()
      return [
        { value: null, title: 'All Types' },
        ...getOptions()
      ]
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    },
    async refreshActiveUnitsCount(agencyId = null) {
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        let unitsQuery;
        if (userType === 'Agency') {
          unitsQuery = query(collection(db, 'units'), where('agencyId', '==', currentUser.uid));
        } else if (agencyId) {
          unitsQuery = query(collection(db, 'units'), where('agencyId', '==', agencyId));
        } else {
          this.activeUnitsCount = 0;
          return;
        }
        const snap = await getDocs(unitsQuery);
        this.activeUnitsCount = snap.size;
      } catch (error) {
        console.error('Error counting active units:', error);
        this.activeUnitsCount = 0;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    filterVacancies() {
      this.filteredVacancies = this.vacancies.filter(vacancy => {
        const textMatch = vacancy.unitName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         vacancy.propertyManager.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         vacancy.contactNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         (vacancy.notes && vacancy.notes.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        let agencyMatch = true;
        let monthMatch = true;
        let propertyTypeMatch = true;
        
        if (this.selectedAgency) {
          agencyMatch = vacancy.agencyId === this.selectedAgency;
        }
        
        if (this.propertyTypeFilter) {
          propertyTypeMatch = vacancy.propertyType === this.propertyTypeFilter;
        }
        
        if (this.monthFilter) {
          const vacancyDate = new Date(vacancy.dateVacated);
          const filterDate = new Date(this.monthFilter+"-01");
          monthMatch = vacancyDate.getMonth() === filterDate.getMonth() && vacancyDate.getFullYear() === filterDate.getFullYear();
        }
        
        return textMatch && agencyMatch && monthMatch && propertyTypeMatch;
      });
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
      this.vacancies = [];
      this.filteredVacancies = [];
      
      if (agencyId) {
        // Fetch vacancy entries for selected agency
        console.log('Fetching vacancies for agency:', agencyId);
        this.fetchVacancies(agencyId);
        this.refreshActiveUnitsCount(agencyId);
      } else {
        // Fetch all vacancy entries when no agency is selected
        console.log('Fetching all vacancies');
        this.fetchVacancies();
        this.refreshActiveUnitsCount();
      }
    },

    viewVacancy(vacancy) { 
      this.$router.push(`/view-vacancy-${vacancy.id}`); 
    },
    
    editVacancy(vacancy) { 
      this.$router.push(`/edit-vacancy-${vacancy.id}`); 
    },
    
    async deleteVacancy(vacancy) {
      try {
        await this.showConfirmDialog({
          title: 'Delete vacancy?',
          message: `Are you sure you want to delete ${vacancy.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        await deleteDoc(doc(db, 'vacancies', vacancy.id));
        const index = this.vacancies.findIndex(v => v.id === vacancy.id);
        if (index > -1) this.vacancies.splice(index, 1);
        this.filterVacancies();
      } catch (error) {
        console.error('Error deleting vacancy:', error);
        this.showErrorDialog('Failed to delete vacancy. Please try again.', 'Error', 'OK');
      }
    },
    
    addVacancy() { 
      this.$router.push('/add-vacancy'); 
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
            await this.refreshActiveUnitsCount(this.selectedAgency);
          } else {
            this.agencies = [];
          }
          console.log('Agency user - own agency loaded:', this.agencies);
        } else {
          // Super Admin and Admin users can see all agencies
          console.log('Fetching agencies...');
          const q = query(collection(db, 'users'), where('userType', '==', 'Agency'));
          const querySnapshot = await getDocs(q);
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('Agencies loaded:', this.agencies.length);
          
          if (this.agencies.length === 0) {
            console.log('No agencies found, creating test agencies...');
            await this.createTestAgencies();
          }
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK');
      } finally {
        this.agenciesLoading = false;
      }
    },

    async createTestAgencies() {
      try {
        console.log('Creating test agencies for vacancies...');
        const testAgencies = [
          {
            agencyName: 'Pam Golding Properties',
            userType: 'Agency',
            location: 'Cape Town, South Africa',
            establishedYear: 1976,
            numberOfProperties: 1250,
            rating: '5 Stars',
            agencyDescription: 'Premium real estate agency specializing in property management.',
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
          }
        ];

        const createdAgencies = [];
        for (const agencyData of testAgencies) {
          const docRef = await addDoc(collection(db, 'users'), agencyData);
          createdAgencies.push({ id: docRef.id, ...agencyData });
        }

        console.log('Test agencies created successfully');
        
        // Create some test vacancies for these agencies
        await this.createTestVacancies(createdAgencies);
        
        // Fetch agencies again
        await this.fetchAgencies();
      } catch (error) {
        console.error('Error creating test agencies:', error);
      }
    },

    async createTestVacancies(agencies) {
      try {
        console.log('Creating test vacancies...');
        const testVacancies = [
          {
            agencyId: agencies[0].id,
            unitName: 'Unit 101 - Sea Point',
            dateVacated: '2024-12-01',
            newTenantFound: 'Yes',
            moveInDate: '2025-01-15',
            propertyType: 'residential',
            propertyManager: 'John Smith',
            contactNumber: '+27 82 123 4567',
            notes: 'Property in excellent condition, new tenant approved',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            agencyId: agencies[0].id,
            unitName: 'Unit 205 - Green Point',
            dateVacated: '2024-11-15',
            newTenantFound: 'No',
            moveInDate: null,
            propertyType: 'residential',
            propertyManager: 'Sarah Johnson',
            contactNumber: '+27 83 234 5678',
            notes: 'Property needs minor repairs before new tenant',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            agencyId: agencies[1].id,
            unitName: 'Unit 301 - Sandton',
            dateVacated: '2024-12-10',
            newTenantFound: 'Yes',
            moveInDate: '2025-02-01',
            propertyType: 'commercial',
            propertyManager: 'Mike Wilson',
            contactNumber: '+27 84 345 6789',
            notes: 'High-end property, tenant screening in progress',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        for (const vacancyData of testVacancies) {
          await addDoc(collection(db, 'vacancies'), vacancyData);
        }

        console.log('Test vacancies created successfully');
      } catch (error) {
        console.error('Error creating test vacancies:', error);
      }
    },

    async fetchVacancies(agencyId = null) {
      this.vacanciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        console.log('Fetching vacancies for agencyId:', agencyId);
        let q;
        
        if (userType === 'Agency') {
          // Agency users can only see their own vacancies
          q = query(collection(db, 'vacancies'), where('agencyId', '==', currentUser.uid));
          console.log('Querying vacancies for agency user:', currentUser.uid);
        } else if (agencyId) {
          q = query(collection(db, 'vacancies'), where('agencyId', '==', agencyId));
          console.log('Querying vacancies for specific agency:', agencyId);
        } else {
          q = collection(db, 'vacancies');
          console.log('Querying all vacancies');
        }
        
        const querySnapshot = await getDocs(q);
        const vacanciesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        
        // Resolve property types for each vacancy
        this.vacancies = await Promise.all(
          vacanciesData.map(async (vacancy) => {
            try {
              // Try to resolve property type from unitId first
              if (vacancy.unitId) {
                const propertyType = await this.resolvePropertyTypeFromUnit(vacancy.unitId);
                return { ...vacancy, propertyType };
              }
              // If no unitId, try to resolve from unitName (fallback)
              else if (vacancy.unitName) {
                // Query units collection to find the unit by name
                const unitsQuery = query(
                  collection(db, 'units'),
                  where('unitName', '==', vacancy.unitName)
                );
                const unitSnapshot = await getDocs(unitsQuery);
                if (!unitSnapshot.empty) {
                  const unitDoc = unitSnapshot.docs[0];
                  const propertyType = await this.resolvePropertyTypeFromUnit(unitDoc.id);
                  return { ...vacancy, propertyType };
                }
              }
              // Default to residential if no unit found
              return { ...vacancy, propertyType: 'residential' };
            } catch (error) {
              console.error(`Error resolving property type for vacancy ${vacancy.id}:`, error);
              return { ...vacancy, propertyType: 'residential' };
            }
          })
        );
        
        console.log('Vacancies loaded:', this.vacancies.length);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
        
        // Log the first vacancy structure if available
        if (this.vacancies.length > 0) {
          console.log('First vacancy structure:', this.vacancies[0]);
          console.log('First vacancy agencyId:', this.vacancies[0].agencyId);
        }
        
        this.filterVacancies();
      } catch (error) {
        console.error('Error fetching vacancies:', error);
        this.showErrorDialog('Failed to load vacancies. Please try again.', 'Error', 'OK');
      } finally {
        this.vacanciesLoading = false;
      }
    }
  },
  async mounted() {
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch vacancies based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own vacancies
      await this.fetchVacancies();
      await this.refreshActiveUnitsCount();
    } else {
      // Super Admin/Admin users get all vacancies initially
      await this.fetchVacancies();
      if (this.selectedAgency) await this.refreshActiveUnitsCount(this.selectedAgency);
    }
  }
};
</script>

<style scoped>
.view-vacancy-page { padding:20px; min-height:100vh; }
.back-btn {
  font-weight: 500; text-transform:none; border-radius:8px; transition: all 0.3s ease;
  background-color:black !important; color:white !important; border:2px solid black !important;
  width:160px; height:44px;
}
.back-btn:hover { background-color:#333 !important; border-color:#333 !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.5); }

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
@media(max-width:768px){ .back-btn { width:140px; height:40px; } .action-btn { font-size:0.7rem; } .agency-info-card-black { text-align:center; } .agency-logo-black { height:220px; } }
</style>
