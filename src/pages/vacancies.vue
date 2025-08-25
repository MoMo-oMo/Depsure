<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      <!-- Filters and Add Vacancy Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="4">
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
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedAgency"
            label="Filter by agency"
            prepend-inner-icon="mdi-domain"
            flat
            density="comfortable"
            variant="outlined"
            :items="[{ id: 'all', agencyName: 'All Agencies' }, ...agencies]"
            item-title="agencyName"
            item-value="id"
            hide-details
            dense
            class="custom-input"
            :loading="agenciesLoading"
            @update:model-value="onAgencyChange"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="3">
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

        <!-- Add Vacancy Button -->
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn @click="addVacancy" class="back-btn">
            Add Vacancy
          </v-btn>
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
                :color="item.newTenantFound === 'Yes' ? 'success' : 'warning'"
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
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editVacancy(item)"
                  class="action-btn"
                />
                <v-btn
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
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'

export default {
  name: "ViewVacancies",
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    return { showErrorDialog }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      selectedAgency: 'all',
      filteredVacancies: [],
      vacancies: [],
      agencies: [],
      agenciesLoading: false,
      vacanciesLoading: false,
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Date Vacated", key: "dateVacated", sortable: true, align: "center" },
        { title: "New Tenant Found", key: "newTenantFound", sortable: true, align: "center" },
        { title: "Move In Date", key: "moveInDate", sortable: true, align: "center" },
        { title: "Property Manager", key: "propertyManager", sortable: true },
        { title: "Contact Number", key: "contactNumber", sortable: true },
        { title: "Notes", key: "notes", sortable: false },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ]
    };
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
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
        if (this.selectedAgency !== 'all') {
          agencyMatch = vacancy.agencyId === this.selectedAgency;
        }
        
        let monthMatch = true;
        if (this.monthFilter && vacancy.createdAt) {
          const vacancyDate = vacancy.createdAt instanceof Date ? vacancy.createdAt : vacancy.createdAt.toDate();
          const filterDate = new Date(this.monthFilter);
          monthMatch = vacancyDate.getFullYear() === filterDate.getFullYear() && 
                      vacancyDate.getMonth() === filterDate.getMonth();
        }
        
        return textMatch && agencyMatch && monthMatch;
      });
    },

    async onAgencyChange(agencyId) {
      await this.fetchVacancies(agencyId === 'all' ? null : agencyId);
    },

    viewVacancy(vacancy) { 
      this.$router.push(`/view-vacancy-${vacancy.id}`); 
    },
    
    editVacancy(vacancy) { 
      this.$router.push(`/edit-vacancy-${vacancy.id}`); 
    },
    
    async deleteVacancy(vacancy) {
      if (confirm(`Delete vacancy entry for ${vacancy.unitName}?`)) {
        try {
          await deleteDoc(doc(db, 'vacancies', vacancy.id));
          const index = this.vacancies.findIndex(v => v.id === vacancy.id);
          if (index > -1) this.vacancies.splice(index, 1);
          this.filterVacancies();
        } catch (error) {
          console.error('Error deleting vacancy:', error);
          this.showErrorDialog('Failed to delete vacancy. Please try again.', 'Error', 'OK');
        }
      }
    },
    
    addVacancy() { 
      this.$router.push('/add-vacancy'); 
    },

    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const q = query(collection(db, 'users'), where('userType', '==', 'Agency'));
        const querySnapshot = await getDocs(q);
        this.agencies = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Agencies loaded:', this.agencies.length);
      } catch (error) {
        console.error('Error fetching agencies:', error);
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK');
      } finally {
        this.agenciesLoading = false;
      }
    },

    async fetchVacancies(agencyId = null) {
      this.vacanciesLoading = true;
      try {
        let q = collection(db, 'vacancies');
        if (agencyId) {
          q = query(collection(db, 'vacancies'), where('agencyId', '==', agencyId));
        }
        
        const querySnapshot = await getDocs(q);
        this.vacancies = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Vacancies loaded:', this.vacancies.length);
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
    await this.fetchAgencies();
    await this.fetchVacancies();
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

.custom-input .v-field { border-radius:8px; }
.action-btn-container { display:flex; justify-content:center; align-items:center; gap:4px; }
.action-btn { font-size:0.75rem; font-weight:500; text-transform:none; border-radius:6px; }
.action-btn:hover { transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.2); }
:deep(.custom-header .v-data-table-header) { background:#000; color:white; }
@media(max-width:768px){ .back-btn { width:140px; height:40px; } .action-btn { font-size:0.7rem; } }
</style>
