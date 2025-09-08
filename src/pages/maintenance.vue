<template>
  <div class="view-maintenance-page">
    <v-container fluid>
      <!-- Filters and Add Maintenance Entry -->
      <v-row class="mb-4">
        <v-col cols="12" md="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search maintenance entries..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterEntries"
          />
        </v-col>

        <v-col v-if="!isAgencyUser && !hasCurrentAgency" cols="12" md="3" class="pa-4">
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
            :loading="agenciesLoading"
            class="custom-input top-filter"
            @update:model-value="onAgencyChange"
          />
        </v-col>

        <v-col cols="12" md="3" class="pa-4">
          <v-text-field
            v-model="monthFilter"
            label="Filter by month"
         
            flat
            density="comfortable"
            variant="outlined"
            type="month"
            hide-details
            dense
            class="custom-input top-filter month-input"
            ref="monthInput"
            @input="filterEntries"
            @click:prepend-inner="openMonthPicker"
          />
        </v-col>

        <v-col cols="12" md="2" class="pa-4">
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
            class="custom-input top-filter"
            @update:model-value="filterEntries"
          />
        </v-col>

        <v-col cols="12" md="2" class="pa-4 d-flex align-center" v-if="isAgencyUser">
          <v-btn @click="addMaintenance" class="back-btn">
            Add Maintenance
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
                      <span>{{ selectedAgencyDetails.address || 'Address not provided' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-card-account-details" class="mr-2 text-white" />
                      <span>Reg No: {{ selectedAgencyDetails.regNo || '—' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-account" class="mr-2 text-white" />
                      <span>Primary Contact: {{ selectedAgencyDetails.primaryContactName || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-phone" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.contactNumber || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-email" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.email || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-home" class="mr-2 text-white" />
                      <span>{{ activeUnitsCount }} Properties</span>
                    </div>
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <p class="agency-description-black">
                    {{ selectedAgencyDetails.notes || 'No notes available' }}
                  </p>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Maintenance Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredEntries"
            class="custom-header"
            density="comfortable"
            hover
            :loading="loading"
            loading-text="Loading maintenance entries..."
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
            <template v-slot:item.noticeGiven="{ item }">
              <v-chip :color="item.noticeGiven === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.noticeGiven }}
              </v-chip>
            </template>
            <!-- Action buttons - Edit/Delete hidden for Super Admin -->
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
                  v-if="isAgencyUser || userType === 'Admin'"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editEntry(item)"
                  class="action-btn"
                />
                <v-btn
                  v-if="isAgencyUser || userType === 'Admin'"
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


    </v-container>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: "MaintenancePage",
  setup() {
    const { showSuccessDialog, showErrorDialog, showConfirmDialog } = useCustomDialogs()
    const { getOptions, getLabel, getColor, resolvePropertyTypeFromUnit } = usePropertyType()
    return { showSuccessDialog, showErrorDialog, showConfirmDialog, getOptions, getLabel, getColor, resolvePropertyTypeFromUnit }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      propertyTypeFilter: null,
      selectedAgency: null,
      filteredEntries: [],
      loading: false,
      agenciesLoading: false,

      agencies: [],
      entries: [],
      activeUnitsCount: 0,
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Property Type", key: "propertyType", sortable: true, align: "center" },
        { title: "Agency", key: "agencyName", sortable: true },
        { title: "Notice Given", key: "noticeGiven", sortable: true, align: "center" },
        { title: "Vacate Date", key: "vacateDate", sortable: true, align: "center" },
        { title: "Contact Number", key: "contactNumber", sortable: true },
        { title: "Address", key: "address", sortable: true },
        { title: "Status", key: "status", sortable: true, align: "center" },
        { title: "Priority", key: "priority", sortable: true, align: "center" },
        { title: "Actions", key: "actions", sortable: false, align: "center" }
      ]
    };
  },
  computed: {
    hasCurrentAgency() {
      const appStore = useAppStore();
      return !!appStore.currentAgency;
    },
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
      const isSuper = userType === 'Super Admin';
      console.log('Maintenance - User Type:', userType, 'Is Super Admin:', isSuper);
      return isSuper;
    },
    userType() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType;
    },
    propertyTypeFilterOptions() {
      return [
        { value: null, title: 'All Types' },
        ...this.getOptions()
      ];
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
    filterEntries() {
      this.filteredEntries = this.entries.filter(entry => {
        const textMatch = entry.unitName.toLowerCase().includes(this.searchQuery.toLowerCase());
        let agencyMatch = true;
        let monthMatch = true;
        let propertyTypeMatch = true;
        
        if (this.selectedAgency) {
          agencyMatch = entry.agencyId === this.selectedAgency;
        }
        
        if (this.propertyTypeFilter) {
          propertyTypeMatch = entry.propertyType === this.propertyTypeFilter;
        }
        
        if (this.monthFilter) {
          const entryDate = new Date(entry.vacateDate);
          const filterDate = new Date(this.monthFilter+"-01");
          monthMatch = entryDate.getMonth() === filterDate.getMonth() && entryDate.getFullYear() === filterDate.getFullYear();
        }
        return textMatch && agencyMatch && monthMatch && propertyTypeMatch;
      });
    },
    viewEntry(entry) { this.$router.push(`/view-maintenance-${entry.id}`); },
    editEntry(entry) { this.$router.push(`/edit-maintenance-${entry.id}`); },
    async deleteEntry(entry) {
      try {
        await this.showConfirmDialog({
          title: 'Delete maintenance entry?',
          message: `Are you sure you want to delete entry for ${entry.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        await deleteDoc(doc(db, 'maintenance', entry.id))
        const index = this.entries.findIndex(e => e.id === entry.id);
        if(index > -1) {
          this.entries.splice(index, 1);
          this.filterEntries();
          this.showSuccessDialog(`Maintenance entry for ${entry.unitName} deleted successfully!`, 'Success!', 'Continue');
        }
      } catch (error) {
        console.error('Error deleting maintenance entry:', error)
        this.showErrorDialog('Failed to delete maintenance entry. Please try again.', 'Error', 'OK')
      }
    },
    addMaintenance() { 
      this.$router.push('/add-maintenance'); 
    },
    async fetchMaintenanceEntries(agencyId = null) {
      this.loading = true
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        let maintenanceQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see their own maintenance entries
          maintenanceQuery = query(
            collection(db, 'maintenance'),
            where('agencyId', '==', currentUser.uid)
          );
        } else if (agencyId) {
          // Super Admin/Admin users query maintenance entries for specific agency
          maintenanceQuery = query(
            collection(db, 'maintenance'),
            where('agencyId', '==', agencyId)
          );
        } else {
          // Super Admin/Admin users query all maintenance entries when no agency selected
          maintenanceQuery = collection(db, 'maintenance');
        }
        
        const querySnapshot = await getDocs(maintenanceQuery)
        
        // First, get all maintenance entries
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }))
        
        // Resolve property types for each entry
        const entriesWithPropertyTypes = await Promise.all(
          entries.map(async (entry) => {
            try {
              // Try to resolve property type from unitId if available
              if (entry.unitId) {
                const propertyType = await this.resolvePropertyTypeFromUnit(entry.unitId);
                return { ...entry, propertyType };
              }
              // If no unitId, try to resolve from unitName by finding the unit
              else if (entry.unitName) {
                // Find the unit by name in the units collection
                const unitsQuery = query(
                  collection(db, 'units'),
                  where('propertyName', '==', entry.unitName)
                );
                const unitsSnapshot = await getDocs(unitsQuery);
                if (!unitsSnapshot.empty) {
                  const unitDoc = unitsSnapshot.docs[0];
                  const unitData = unitDoc.data();
                  return { ...entry, propertyType: unitData.propertyType || 'residential' };
                }
              }
              // Default to residential if we can't resolve
              return { ...entry, propertyType: 'residential' };
            } catch (error) {
              console.error('Error resolving property type for maintenance entry:', entry.id, error);
              return { ...entry, propertyType: 'residential' };
            }
          })
        );
        
        this.entries = entriesWithPropertyTypes;
        console.log('Maintenance entries loaded with property types:', this.entries.length)
        console.log('User type:', userType, 'Agency ID filter:', agencyId)
        this.filterEntries()
      } catch (error) {
        console.error('Error fetching maintenance entries:', error)
        this.showErrorDialog('Failed to load maintenance entries. Please try again.', 'Error', 'OK')
      } finally {
        this.loading = false
      }
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }
      
      if (agencyId) {
        // Fetch maintenance entries for selected agency
        this.fetchMaintenanceEntries(agencyId);
        this.refreshActiveUnitsCount(agencyId);
      } else {
        // Fetch all maintenance entries when no agency is selected
        this.fetchMaintenanceEntries();
        this.refreshActiveUnitsCount();
      }
    },
    async fetchAgencies() {
      this.agenciesLoading = true
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
          const q = query(collection(db, 'users'), where('userType', '==', 'Agency'))
          const querySnapshot = await getDocs(q)
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          console.log('All agencies loaded:', this.agencies.length)
        }
      } catch (error) {
        console.error('Error fetching agencies:', error)
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK')
      } finally {
        this.agenciesLoading = false
      }
    }
  },
  async mounted() { 
    document.title = "Maintenance - Depsure";
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch maintenance entries based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own maintenance entries
      await this.fetchMaintenanceEntries();
      await this.refreshActiveUnitsCount();
    } else {
      const appStore = useAppStore();
      const globalId = appStore.currentAgency?.id || null;
      if (globalId) {
        this.selectedAgency = globalId;
        await this.fetchMaintenanceEntries(globalId);
        await this.refreshActiveUnitsCount(globalId);
      } else {
        // Super Admin/Admin users get all maintenance entries initially
        await this.fetchMaintenanceEntries();
        if (this.selectedAgency) await this.refreshActiveUnitsCount(this.selectedAgency);
      }
    }
  }
};
</script>

<style scoped>
.view-maintenance-page { padding:20px; min-height:100vh; }
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
