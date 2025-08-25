<template>
  <div class="view-agency-page">
    <v-container fluid>
      
      <!-- Filters and Add Flagged Unit Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search flagged units..."
            prepend-inner-icon="mdi-magnify"
            flat="true"
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input"
            @input="filterUnits"
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
            @change="filterUnits"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="2" lg="2" class="pa-4">
          <v-text-field
            v-model="monthFilter"
            label="Filter by month"
            prepend-inner-icon="mdi-calendar"
            flat="true"
            density="comfortable"
            variant="outlined"
            type="month"
            hide-details
            dense
            class="custom-input"
            @input="filterUnits"
          />
        </v-col>

        <!-- Add Flagged Unit Button -->
        <v-col cols="12" md="3" lg="3" class="pa-4 d-flex align-center">
          <v-btn @click="addFlaggedUnit" class="back-btn">
            Add Flagged Unit
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

      <!-- Flagged Units Table -->
      <v-row>
        <v-col cols="12" class="pa-4">
          <v-data-table
            :headers="headers"
            :items="filteredUnits"
            :search="searchQuery"
            class="custom-header"
            density="comfortable"
            hover
          >
            <!-- Centered Action Buttons -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewUnit(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editUnit(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteUnit(item)"
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
  name: "FlaggedUnitsPage",
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      selectedAgency: null,
      filteredUnits: [],
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
      units: [
        {
          id: 1,
          unitName: "123 Main Street, Cape Town",
          missedPaymentFlag: "Yes",
          noticeToVacateGiven: "2024-12-01",
          notes: "Tenant behind 2 months",
          agency: "Pam Golding Properties",
          leaseStartDate: "2024-01-15"
        },
        {
          id: 2,
          unitName: "456 Ocean Drive, Camps Bay",
          missedPaymentFlag: "No",
          noticeToVacateGiven: "2024-05-01",
          notes: "All payments up to date",
          agency: "RE/MAX Properties",
          leaseStartDate: "2023-06-01"
        }
      ],
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Missed Payment Flag", key: "missedPaymentFlag", sortable: true, align: "center" },
        { title: "Notice To Vacate Given", key: "noticeToVacateGiven", sortable: true, align: "center" },
        { title: "Notes", key: "notes", sortable: true },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ]
    };
  },
  computed: {
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.name === this.selectedAgency) || null;
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },
    filterUnits() {
      this.filteredUnits = this.units.filter((unit) => {
        const textMatch = unit.unitName.toLowerCase().includes(this.searchQuery.toLowerCase());
        let agencyMatch = true;
        let monthMatch = true;

        if (this.selectedAgency) {
          agencyMatch = unit.agency === this.selectedAgency;
        }

        if (this.monthFilter) {
          const propertyDate = new Date(unit.leaseStartDate);
          const filterDate = new Date(this.monthFilter + "-01");
          const unitMonth = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, "0")}`;
          monthMatch = unitMonth === filterMonth;
        }

        return textMatch && agencyMatch && monthMatch;
      });
    },
    viewUnit(unit) {
  console.log("Viewing flagged unit:", unit);
  this.$router.push(`/view-flagged-unit-${unit.id}`);
  },

    editUnit(unit) {
      this.$router.push(`/edit-flagged-unit-${unit.id}`);
    },
    deleteUnit(unit) {
      if (confirm(`Are you sure you want to delete flagged unit ${unit.unitName}?`)) {
        const index = this.units.findIndex(u => u.id === unit.id);
        if (index > -1) {
          this.units.splice(index, 1);
          this.filterUnits();
        }
      }
    },
    addFlaggedUnit() {
      this.$router.push('/add-flagged-unit');
    }
  },
  mounted() {
    document.title = "Flagged Units - Depsure";
    this.filteredUnits = this.units;
  }
};
</script>

<style scoped>
/* Reuse styles from previous pages */

.view-agency-page {
  padding: 20px;
  min-height: 100vh;
}

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

.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0;
}

.no-gutters {
  --v-gutter-x: 0;
  --v-gutter-y: 0;
  margin: 0 !important;
}

.agency-logo-black {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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

.custom-input .v-field {
  border-radius: 8px;
}

.action-btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.action-btn {
  margin: 0;
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

@media (max-width: 768px) {
  .view-agency-page {
    padding: 10px;
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

  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px;
    object-fit: cover;
  }
}
</style>
