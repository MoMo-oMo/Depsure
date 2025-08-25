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

        <!-- Month filter -->
        <v-col cols="12" md="3">
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
            @input="filterVacancies"
          />
        </v-col>

        <!-- Add Vacancy Button -->
        <v-col cols="12" md="3" class="d-flex align-center">
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
            class="custom-header"
            density="comfortable"
            hover
          >
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
export default {
  name: "ViewVacancies",
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      filteredVacancies: [],
      vacancies: [
        { id: 1, unitName: "123 Main Street", dateVacated: "2024-12-01", newTenantFound: "Yes", moveInDate: "2025-01-01", notes: "Tenant left in good condition." },
        { id: 2, unitName: "456 Ocean Drive", dateVacated: "2024-11-15", newTenantFound: "No", moveInDate: "", notes: "Needs deep cleaning." },
      ],
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Date Vacated", key: "dateVacated", sortable: true, align: "center" },
        { title: "New Tenant Found", key: "newTenantFound", sortable: true, align: "center" },
        { title: "Move In Date", key: "moveInDate", sortable: true, align: "center" },
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
    filterVacancies() {
      this.filteredVacancies = this.vacancies.filter(entry => {
        const textMatch = entry.unitName.toLowerCase().includes(this.searchQuery.toLowerCase());
        let monthMatch = true;
        if(this.monthFilter && entry.dateVacated) {
          const entryMonth = entry.dateVacated.slice(0,7);
          monthMatch = entryMonth === this.monthFilter;
        }
        return textMatch && monthMatch;
      });
    },
    viewVacancy(entry) { this.$router.push(`/view-vacancy-${entry.id}`); },
    editVacancy(entry) { this.$router.push(`/edit-vacancy-${entry.id}`); },
    deleteVacancy(entry) {
      if(confirm(`Delete vacancy entry for ${entry.unitName}?`)) {
        const index = this.vacancies.findIndex(e => e.id === entry.id);
        if(index > -1) this.vacancies.splice(index,1);
        this.filterVacancies();
      }
    },
    addVacancy() { this.$router.push('/add-vacancy'); },
  },
  mounted() { this.filteredVacancies = this.vacancies; }
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
