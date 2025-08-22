<template>
  <div class="view-agency-page">
    <v-container fluid>
      

      <!-- Agency Information Card -->
      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <v-card class="agency-info-card">
            <v-img
              :src="agency.logo"
              :alt="agency.name"
              height="200"
              cover
              class="agency-logo"
            />
            <v-card-title class="text-center">{{ agency.name }}</v-card-title>
            <v-card-text>
              <div class="agency-details">
                <div class="detail-item">
                  <v-icon icon="mdi-map-marker" class="mr-2" />
                  <span>{{ agency.location }}</span>
                </div>
                <div class="detail-item">
                  <v-icon icon="mdi-calendar" class="mr-2" />
                  <span>Established: {{ agency.established }}</span>
                </div>
                <div class="detail-item">
                  <v-icon icon="mdi-home" class="mr-2" />
                  <span>{{ agency.properties }} Properties</span>
                </div>
                <div class="detail-item">
                  <v-icon icon="mdi-star" class="mr-2" />
                  <span>Rating: {{ agency.rating }}/5</span>
                </div>
              </div>
              <v-divider class="my-4" />
              <p class="agency-description">{{ agency.description }}</p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Agency Statistics -->
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="text-center">
                  <div class="stat-number">{{ agency.properties }}</div>
                  <div class="stat-label">Total Properties</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="text-center">
                  <div class="stat-number">{{ activeProperties }}</div>
                  <div class="stat-label">Active Listings</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="text-center">
                  <div class="stat-number">{{ soldProperties }}</div>
                  <div class="stat-label">Sold This Year</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="stat-card">
                <v-card-text class="text-center">
                  <div class="stat-number">{{ agency.rating }}</div>
                  <div class="stat-label">Average Rating</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

             <!-- Properties Table -->
       <v-row>
         <v-col cols="12">
           <v-card>
             <v-card-title class="d-flex justify-space-between align-center">
               <span>Properties</span>
               <v-text-field
                 v-model="searchQuery"
                 label="Search properties..."
                 prepend-inner-icon="mdi-magnify"
                 variant="outlined"
                 density="comfortable"
                 hide-details
                 class="search-field"
                 style="max-width: 300px;"
               />
             </v-card-title>
             <v-card-text>
                               <v-data-table
                  :headers="headers"
                  :items="filteredProperties"
                  :search="searchQuery"
                  class="custom-header"
                  density="comfortable"
                  hover
                >
                 <template v-slot:item.status="{ item }">
                   <v-chip
                     :color="getStatusColor(item.status)"
                     size="small"
                     variant="flat"
                   >
                     {{ item.status }}
                   </v-chip>
                 </template>
                 <template v-slot:item.price="{ item }">
                   <span class="font-weight-medium">R{{ item.price.toLocaleString() }}</span>
                 </template>
                                   <template v-slot:item.actions="{ item }">
                    <v-btn
                      icon="mdi-eye"
                      size="small"
                      variant="outlined"
                      color="primary"
                      @click="viewProperty(item)"
                      class="action-btn"
                    />
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="outlined"
                      color="secondary"
                      @click="editProperty(item)"
                      class="action-btn"
                    />
                  </template>
               </v-data-table>
             </v-card-text>
           </v-card>
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
          address: '123 Main Street, Cape Town',
          type: 'House',
          bedrooms: 4,
          bathrooms: 3,
          price: 2500000,
          status: 'Active',
          listedDate: '2024-01-15'
        },
        {
          id: 2,
          address: '456 Ocean Drive, Camps Bay',
          type: 'Apartment',
          bedrooms: 2,
          bathrooms: 2,
          price: 1800000,
          status: 'Active',
          listedDate: '2024-01-20'
        },
        {
          id: 3,
          address: '789 Mountain View, Constantia',
          type: 'House',
          bedrooms: 5,
          bathrooms: 4,
          price: 4500000,
          status: 'Sold',
          listedDate: '2023-12-10'
        },
        {
          id: 4,
          address: '321 Beach Road, Clifton',
          type: 'Penthouse',
          bedrooms: 3,
          bathrooms: 3,
          price: 3200000,
          status: 'Pending',
          listedDate: '2024-02-01'
        },
        {
          id: 5,
          address: '654 Garden Street, Newlands',
          type: 'House',
          bedrooms: 3,
          bathrooms: 2,
          price: 1900000,
          status: 'Active',
          listedDate: '2024-01-25'
        }
             ],
       headers: [
         { title: 'Address', key: 'address', sortable: true },
         { title: 'Type', key: 'type', sortable: true },
         { title: 'Bedrooms', key: 'bedrooms', sortable: true, align: 'center' },
         { title: 'Bathrooms', key: 'bathrooms', sortable: true, align: 'center' },
         { title: 'Price', key: 'price', sortable: true, align: 'end' },
         { title: 'Status', key: 'status', sortable: true, align: 'center' },
         { title: 'Listed Date', key: 'listedDate', sortable: true, align: 'center' },
         { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
       ]
    }
  },
  computed: {
    filteredProperties() {
      if (!this.searchQuery) return this.properties;
      return this.properties.filter(property =>
        property.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        property.status.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    activeProperties() {
      return this.properties.filter(p => p.status === 'Active').length;
    },
    soldProperties() {
      return this.properties.filter(p => p.status === 'Sold').length;
    }
  },
     methods: {
     getStatusColor(status) {
       switch (status) {
         case 'Active': return 'success';
         case 'Sold': return 'info';
         case 'Pending': return 'warning';
         default: return 'grey';
       }
     },
     viewProperty(property) {
       console.log('Viewing property:', property);
       // Navigate to property details page
     },
     editProperty(property) {
       console.log('Editing property:', property);
       // Navigate to edit property page
     }
   },
     mounted() {
     // Set the page title for the app bar
     document.title = 'Agency Details - Depsure';
     
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

.agency-info-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.agency-logo {
  border-bottom: 1px solid #e0e0e0;
}

.agency-details {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #666;
}

.agency-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #002060;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

   /* Responsive adjustments */
  @media (max-width: 768px) {
    .view-agency-page {
      padding: 10px;
    }
    
    .stat-number {
      font-size: 1.5rem;
    }
    
    .search-field {
      max-width: 100%;
    }
    
    .action-btn {
      font-size: 0.7rem;
      padding: 6px 8px;
    }
  }
</style>
