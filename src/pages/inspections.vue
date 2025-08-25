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

        <v-col cols="12" md="3" class="pa-4">
          <v-select
            v-model="selectedAgency"
            :items="agencies"
            item-title="name"
            item-value="name"
            label="Select Agency"
            prepend-inner-icon="mdi-domain"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            class="custom-input"
            @change="filterEntries"
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
                  :src="selectedAgencyDetails.logo"
                  height="100%"
                  cover
                  class="agency-logo-black"
                />
              </v-col>
              <v-col cols="12" md="9">
                <v-card-title class="text-white text-h4 mb-2">
                  {{ selectedAgencyDetails.name }}
                </v-card-title>
                <v-card-text class="text-white">
                  <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon class="mr-2 text-white">mdi-map-marker</v-icon>
                      {{ selectedAgencyDetails.location }}
                    </div>
                    <div class="detail-item-black">
                      <v-icon class="mr-2 text-white">mdi-calendar</v-icon>
                      Established: {{ selectedAgencyDetails.established }}
                    </div>
                    <div class="detail-item-black">
                      <v-icon class="mr-2 text-white">mdi-home</v-icon>
                      {{ selectedAgencyDetails.properties }} Properties
                    </div>
                    <div class="detail-item-black">
                      <v-icon class="mr-2 text-white">mdi-star</v-icon>
                      Rating: {{ selectedAgencyDetails.rating }}/5
                    </div>
                  </div>
                  <v-divider class="my-4 bg-white"/>
                  <p class="agency-description-black">
                    {{ selectedAgencyDetails.description }}
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
          >
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
export default {
  name: "InspectionPage",
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      selectedAgency: null,
      filteredEntries: [],
      snackbar: false,
      snackbarMessage: "",
      agencies: [
        { name: "Pam Golding Properties", logo: "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg", location: "Cape Town, South Africa", established: "1976", properties: 1250, rating: 4.8, description: "Premium real estate agency specializing in inspections." },
        { name: "RE/MAX Properties", logo: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg", location: "Johannesburg, South Africa", established: "1973", properties: 890, rating: 4.6, description: "Global real estate network with local expertise." }
      ],
      entries: [
        { id: 1, unitName: "123 Main Street, Cape Town", inspectionRequired: "Yes", appointmentMade: "Yes", inspectionDate: "2024-12-01", quotesNeeded: "Yes", agency: "Pam Golding Properties" },
        { id: 2, unitName: "456 Ocean Drive, Camps Bay", inspectionRequired: "No", appointmentMade: "No", inspectionDate: "2024-11-15", quotesNeeded: "No", agency: "RE/MAX Properties" }
      ],
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Inspection Required", key: "inspectionRequired", sortable: true, align: "center" },
        { title: "Appointment Made", key: "appointmentMade", sortable: true, align: "center" },
        { title: "Inspection Date", key: "inspectionDate", sortable: true, align: "center" },
        { title: "Quotes Needed", key: "quotesNeeded", sortable: true, align: "center" },
        { title: "Actions", key: "actions", sortable: false, align: "center" }
      ]
    };
  },
  computed: {
    selectedAgencyDetails() {
      return this.agencies.find(a => a.name === this.selectedAgency) || null;
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    },
    filterEntries() {
      this.filteredEntries = this.entries.filter(entry => {
        const textMatch = entry.unitName.toLowerCase().includes(this.searchQuery.toLowerCase());
        let agencyMatch = true;
        let monthMatch = true;
        if (this.selectedAgency) agencyMatch = entry.agency === this.selectedAgency;
        if (this.monthFilter) {
          const entryDate = new Date(entry.inspectionDate);
          const filterDate = new Date(this.monthFilter+"-01");
          monthMatch = entryDate.getMonth() === filterDate.getMonth() && entryDate.getFullYear() === filterDate.getFullYear();
        }
        return textMatch && agencyMatch && monthMatch;
      });
    },
    viewEntry(entry) { this.$router.push(`/view-inspection-${entry.id}`); },
    editEntry(entry) { this.$router.push(`/edit-inspection-${entry.id}`); },
    deleteEntry(entry) {
      if(confirm(`Delete inspection entry for ${entry.unitName}?`)) {
        const index = this.entries.findIndex(e => e.id === entry.id);
        if(index>-1) {
          this.entries.splice(index,1);
          this.filterEntries();
          this.snackbarMessage = `Deleted inspection entry for ${entry.unitName}`;
          this.snackbar = true;
        }
      }
    },
    addInspection() { this.$router.push('/add-inspection'); }
  },
  mounted() { 
    document.title = "Inspections - Depsure";
    this.filteredEntries = this.entries;
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
