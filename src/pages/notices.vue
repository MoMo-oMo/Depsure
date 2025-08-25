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
        <v-col cols="12" md="2" lg="2" class="pa-4">
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
                  :src="selectedAgencyDetails.logo"
                  :alt="selectedAgencyDetails.name"
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
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.location }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-calendar" class="mr-2 text-white" />
                      <span>Established: {{ selectedAgencyDetails.established }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-home" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.properties }} Properties</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-star" class="mr-2 text-white" />
                      <span>Rating: {{ selectedAgencyDetails.rating }}/5</span>
                    </div>
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <p class="agency-description-black">
                    {{ selectedAgencyDetails.description }}
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
          <v-data-table
            :headers="headers"
            :items="filteredProperties"
            :search="searchQuery"
            class="custom-header"
            density="comfortable"
            hover
          >
            <template v-slot:item.maintenanceRequired="{ item }">
              <span class="font-weight-medium">
                {{ item.maintenanceRequired }}
              </span>
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
export default {
  name: "NoticePage",
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      filteredProperties: [],
      selectedAgency: null,
      agencies: [
        {
          name: "Pam Golding Properties",
          title: "Luxury Real Estate Specialist",
          logo: "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
          description:
            "Premium real estate agency specializing in luxury properties and exceptional service.",
          location: "Cape Town, South Africa",
          established: "1976",
          properties: 1250,
          rating: 4.8,
        },
        {
          name: "RE/MAX Properties",
          title: "Global Real Estate Network",
          logo: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
          description:
            "Global real estate network with local expertise and innovative solutions.",
          location: "Johannesburg, South Africa",
          established: "1973",
          properties: 890,
          rating: 4.6,
        },
      ],
      properties: [
        {
          id: 1,
          propertyName: "123 Main Street, Cape Town",
          leaseStartDate: "2024-01-15",
          noticeGivenDate: "2024-12-01",
          leaseEndDate: "2025-01-15",
          maintenanceRequired: "Yes",
        },
        {
          id: 2,
          propertyName: "456 Ocean Drive, Camps Bay",
          leaseStartDate: "2023-06-01",
          noticeGivenDate: "2024-05-01",
          leaseEndDate: "2024-06-01",
          maintenanceRequired: "No",
        },
      ],
      headers: [
        { title: "UNIT NAME", key: "propertyName", sortable: true },
        { title: "LEASE START DATE", key: "leaseStartDate", sortable: true, align: "center" },
        { title: "NOTICE GIVEN DATE", key: "noticeGivenDate", sortable: true, align: "center" },
        { title: "VACATE DATE", key: "leaseEndDate", sortable: true, align: "center" },
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
      return this.agencies.find((a) => a.name === this.selectedAgency) || null;
    },
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
          property.propertyName.toLowerCase().includes(this.searchQuery.toLowerCase());
        if (this.monthFilter) {
          const propertyDate = new Date(property.leaseStartDate);
          const filterDate = new Date(this.monthFilter + "-01");
          const propertyMonth = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, "0")}`;
          return textMatch && propertyMonth === filterMonth;
        }
        return textMatch;
      });
    },
    viewProperty(property) { this.$router.push(`/view-notice-${property.id}`); },
    editProperty(property) { this.$router.push(`/edit-notice-${property.id}`); },
    deleteProperty(property) {
      if (confirm(`Are you sure you want to delete notice for ${property.propertyName}?`)) {
        const index = this.properties.findIndex((p) => p.id === property.id);
        if (index > -1) {
          this.properties.splice(index, 1);
          this.filterProperties();
        }
      }
    },
    addNotice() { this.$router.push('/add-notice'); },
  },
  mounted() {
    document.title = "Notice Page - Depsure";
    this.filteredProperties = this.properties;
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
