<template>
  <div class="view-agency-page">
    <v-container fluid>
      
      <!-- Back Button and Add Unit -->
      <v-row class="mb-4">
        <v-col cols="6">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.go(-1)"
            class="back-btn"
          >
            Back
          </v-btn>
        </v-col>
        <v-col cols="12" md="2" lg="2" class="pa-4">
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
        <v-col cols="12" md="2" lg="2" class="pa-4 d-flex align-center">
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

      <!-- Agency Information Card - Black Rectangle -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <!-- Remove all grid gutters and stretch columns so the image fills its whole section -->
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12" md="3" class="pa-0 ma-0">
                <v-img
                  :src="agency.logo"
                  :alt="agency.name"
                  height="100%"
                  cover
                  class="agency-logo-black"
                />
              </v-col>
              <v-col cols="12" md="9">
                <v-card-title class="text-white text-h4 mb-2">{{ agency.name }}</v-card-title>
                <v-card-text class="text-white">
                  <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ agency.location }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-calendar" class="mr-2 text-white" />
                      <span>Established: {{ agency.established }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-home" class="mr-2 text-white" />
                      <span>{{ agency.properties }} Properties</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-star" class="mr-2 text-white" />
                      <span>Rating: {{ agency.rating }}/5</span>
                    </div>
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <p class="agency-description-black">{{ agency.description }}</p>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search Section -->
 

      <!-- Properties Table -->
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
                <template v-slot:item.maintenanceAmount="{ item }">
                  <span class="font-weight-medium">R{{ item.maintenanceAmount.toLocaleString() }}</span>
                </template>
                <template v-slot:item.paidTowardsFund="{ item }">
                  <span class="font-weight-medium">R{{ item.paidTowardsFund.toLocaleString() }}</span>
                </template>
                <template v-slot:item.amountToBePaidOut="{ item }">
                  <span class="font-weight-medium">R{{ item.amountToBePaidOut.toLocaleString() }}</span>
                </template>
                <template v-slot:item.actions="{ item }">
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
                </template>
              </v-data-table>


        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ViewAgencyPage',
  data() {
    return {
      searchQuery: '',
      monthFilter: this.getCurrentMonth(),
      filteredProperties: [],
      agency: {
        name: 'Pam Golding Properties',
        title: 'Luxury Real Estate Specialist',
        logo: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg',
        description: 'Premium real estate agency specializing in luxury properties and exceptional service. With over 45 years of experience, we have built a reputation for excellence in the South African property market.',
        location: 'Cape Town, South Africa',
        established: '1976',
        properties: 1250,
        rating: 4.8
      },
      properties: [
        {
          id: 1,
          tenantRef: 'T001',
          propertyName: '123 Main Street, Cape Town',
          newOccupation: 'Yes',
          leaseStartDate: '2024-01-15',
          leaseEndDate: '2025-01-15',
          monthsMissed: 2,
          maintenanceAmount: 15000,
          contractorRequested: 'Yes',
          paidTowardsFund: 5000,
          amountToBePaidOut: 25000,
          paidOut: 'No'
        },
        {
          id: 2,
          tenantRef: 'T002',
          propertyName: '456 Ocean Drive, Camps Bay',
          newOccupation: 'No',
          leaseStartDate: '2023-06-01',
          leaseEndDate: '2024-06-01',
          monthsMissed: 0,
          maintenanceAmount: 8000,
          contractorRequested: 'No',
          paidTowardsFund: 12000,
          amountToBePaidOut: 0,
          paidOut: 'Yes'
        },
        {
          id: 3,
          tenantRef: 'T003',
          propertyName: '789 Mountain View, Constantia',
          newOccupation: 'Yes',
          leaseStartDate: '2024-02-01',
          leaseEndDate: '2025-02-01',
          monthsMissed: 1,
          maintenanceAmount: 22000,
          contractorRequested: 'Yes',
          paidTowardsFund: 8000,
          amountToBePaidOut: 18000,
          paidOut: 'No'
        },
        {
          id: 4,
          tenantRef: 'T004',
          propertyName: '321 Beach Road, Clifton',
          newOccupation: 'No',
          leaseStartDate: '2023-09-15',
          leaseEndDate: '2024-09-15',
          monthsMissed: 3,
          maintenanceAmount: 30000,
          contractorRequested: 'Yes',
          paidTowardsFund: 15000,
          amountToBePaidOut: 35000,
          paidOut: 'No'
        },
        {
          id: 5,
          tenantRef: 'T005',
          propertyName: '654 Garden Street, Newlands',
          newOccupation: 'Yes',
          leaseStartDate: '2024-03-01',
          leaseEndDate: '2025-03-01',
          monthsMissed: 0,
          maintenanceAmount: 12000,
          contractorRequested: 'No',
          paidTowardsFund: 10000,
          amountToBePaidOut: 0,
          paidOut: 'Yes'
        }
      ],
      headers: [
        { title: 'TENANT REF', key: 'tenantRef', sortable: true },
        { title: 'PROPERTY NAME', key: 'propertyName', sortable: true },
        { title: 'LEASE STARTING DATE', key: 'leaseStartDate', sortable: true, align: 'center' },
        { title: 'MONTHS MISSED', key: 'monthsMissed', sortable: true, align: 'center' },
        { title: 'MAINTENANCE AMOUNT', key: 'maintenanceAmount', sortable: true, align: 'end' },
        { title: 'PAID OUT', key: 'paidOut', sortable: true, align: 'center' },
        { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
      ]
    }
  },
  computed: {
    filteredProperties() {
      return this.properties;
    },
    activeProperties() {
      return this.properties.filter(p => p.status === 'Active').length;
    },
    soldProperties() {
      return this.properties.filter(p => p.status === 'Sold').length;
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    },
    filterProperties() {
      this.filteredProperties = this.properties.filter(property => {
        // Text search filter
        const textMatch = property.tenantRef.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.propertyName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.newOccupation.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.contractorRequested.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          property.paidOut.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        // Month filter
        if (this.monthFilter) {
          const propertyDate = new Date(property.leaseStartDate);
          const filterDate = new Date(this.monthFilter + '-01');
          const propertyMonth = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, '0')}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}`;
          
          return textMatch && propertyMonth === filterMonth;
        }
        
        return textMatch;
      });
    },
    viewProperty(property) {
      console.log('Viewing property:', property);
      // Navigate to property details page
      this.$router.push(`/view-property-${property.id}`);
    },
    editProperty(property) {
      console.log('Editing property:', property);
      // Navigate to edit property page
      this.$router.push(`/edit-property-${property.id}`);
    },
    deleteProperty(property) {
      console.log('Deleting property:', property);
      // Show confirmation dialog and delete property
      if (confirm(`Are you sure you want to delete property ${property.tenantRef}?`)) {
        // Remove from properties array
        const index = this.properties.findIndex(p => p.id === property.id);
        if (index > -1) {
          this.properties.splice(index, 1);
          this.filterProperties(); // Refresh filtered list
        }
      }
    },
    addUnit() {
      console.log('Adding new unit');
      this.$router.push('/add-unit');
    }
  },
  mounted() {
    // Set the page title for the app bar
    document.title = 'Agency Details - Depsure';
    
    // Initialize filteredProperties with all properties
    this.filteredProperties = this.properties;
    
    // Get agency ID from route params if needed
    const agencyId = this.$route.params.id;
    if (agencyId) {
      // Load agency data based on ID
      console.log('Loading agency with ID:', agencyId);
    }
  }
}
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
