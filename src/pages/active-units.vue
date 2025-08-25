<template>
  <div class="view-agency-page">
    <v-container fluid>
      <!-- Filters and Add Unit Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search properties..."
            prepend-inner-icon="mdi-magnify"
            flat="true"
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
            flat="true"
            density="comfortable"
            variant="outlined"
            type="month"
            hide-details
            dense
            class="custom-input"
            @input="filterProperties"
          />
        </v-col>

        <!-- Add Unit Button -->
        <v-col cols="12" md="3" lg="3" class="pa-4 d-flex align-center">
          <v-btn
            icon="mdi-plus"
            variant="outlined"
            color="primary"
            @click="addUnit"
            class="back-btn"
          >
            Add Unit
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

      <!-- Properties Table -->
      <v-row>
        <v-col cols="12" class="pa-4">
          <!-- Properties Table -->
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
            <template v-slot:item.maintenanceAmount="{ item }">
              <span class="font-weight-medium">
                R{{ item.maintenanceAmount.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.paidTowardsFund="{ item }">
              <span class="font-weight-medium">
                R{{ item.paidTowardsFund.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.amountToBePaidOut="{ item }">
              <span class="font-weight-medium">
                R{{ item.amountToBePaidOut.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.actions="{ item }">
            <div class ="v-data-table_actions-cell">
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
import { db } from '@/firebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default {
  name: "ActiveUnitsPage",
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
        { title: "TENANT REF", key: "tenantRef", sortable: true },
        { title: "PROPERTY NAME", key: "propertyName", sortable: true },
        {
          title: "LEASE STARTING DATE",
          key: "leaseStartDate",
          sortable: true,
          align: "center",
        },
        {
          title: "MONTHS MISSED",
          key: "monthsMissed",
          sortable: true,
          align: "center",
        },
        {
          title: "MAINTENANCE AMOUNT",
          key: "maintenanceAmount",
          sortable: true,
          align: "end",
        },
        { title: "PAID OUT", key: "paidOut", sortable: true, align: "center" },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ],
    };
  },
  computed: {
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.id === this.selectedAgency) || null;
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
          property.tenantRef
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.propertyName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.newOccupation
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.contractorRequested
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.paidOut
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

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
          const propertyMonth = `${propertyDate.getFullYear()}-${String(
            propertyDate.getMonth() + 1
          ).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(
            filterDate.getMonth() + 1
          ).padStart(2, "0")}`;

          return textMatch && propertyMonth === filterMonth;
        }

        return textMatch;
      });
    },
    viewProperty(property) {
      console.log("Viewing property:", property);
      this.$router.push(`/view-property-${property.id}`);
    },
    editProperty(property) {
      console.log("Editing property:", property);
      this.$router.push(`/edit-property-${property.id}`);
    },
    deleteProperty(property) {
      if (confirm(`Are you sure you want to delete ${property.tenantRef}?`)) {
        const index = this.properties.findIndex((p) => p.id === property.id);
        if (index > -1) {
          this.properties.splice(index, 1);
          this.filterProperties();
        }
      }
    },
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        // Query users collection for agencies only
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
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        this.agenciesLoading = false;
      }
    },
    
    async fetchProperties(agencyId = null) {
      this.propertiesLoading = true;
      try {
        let unitsQuery;
        
        if (agencyId) {
          // Query units for specific agency
          unitsQuery = query(
            collection(db, 'units'),
            where('agencyId', '==', agencyId)
          );
        } else {
          // Query all units
          unitsQuery = collection(db, 'units');
        }
        
        const querySnapshot = await getDocs(unitsQuery);
        this.properties = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Apply initial filtering
        this.filterProperties();
        console.log('Properties fetched:', this.properties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        this.propertiesLoading = false;
      }
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      if (agencyId) {
        // Fetch properties for selected agency
        this.fetchProperties(agencyId);
      } else {
        // Fetch all properties when no agency is selected
        this.fetchProperties();
      }
    },
    
    addUnit() {
      console.log("Adding new unit");
      this.$router.push('/add-unit');
    },
  },
  async mounted() {
    document.title = "Active Units - Depsure";
    
    // Fetch agencies and all properties
    await this.fetchAgencies();
    await this.fetchProperties();
  },
};
</script>

<style scoped>
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
