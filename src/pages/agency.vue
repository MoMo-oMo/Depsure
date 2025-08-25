<template>
  <div class="agency-page">
    <v-container fluid>
      <!-- Search and Add Agency Section -->
      <v-row class="mb-6">
        <v-col cols="12" md="6" lg="4">
          <v-text-field
            v-model="searchQuery"
            label="Search agencies..."
            prepend-inner-icon="mdi-magnify"
            flat="true"
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input"
            @input="filterAgencies"
          />
        </v-col>
        <!-- <v-col cols="12" md="3" lg="2" class="d-flex align-center">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            class="add-agency-btn"
            @click="addNewAgency"
          >
            Add Agency
          </v-btn>
        </v-col> -->
      </v-row>

      <v-row>
        <v-col cols="12">
          <!-- Loading state -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="mt-4">Loading agencies...</p>
          </div>
          
          <!-- No agencies found -->
          <div v-else-if="filteredAgencies.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-domain-off</v-icon>
            <p class="mt-4 text-grey">No agencies found</p>
          </div>
          
          <!-- Agencies grid -->
          <v-row v-else>
            <v-col
              v-for="(agency, index) in filteredAgencies"
              :key="agency.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <div class="business-card">
                <!-- Image section with overlay title -->
                <div class="image-section">
                  <v-img
                    :src="agency.profileImageUrl || agency.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'"
                    :alt="agency.agencyName"
                    class="card-image"
                    cover
                  />
                  <div class="image-overlay">
                    <h2 class="card-headline">
                      {{ agency.agencyName }}
                    </h2>
                  </div>
                </div>

                <!-- Content section -->
                <div class="content-section">
                  <!-- Description -->
                  <p class="card-description">
                    {{ agency.agencyDescription || agency.agencyTagline || 'No description available' }}
                  </p>

                  <!-- Action Button -->
                  <div class="button-container">
                    <v-btn
                      color="white"
                      variant="outlined"
                      class="action-btn"
                      @click="viewAgencyDetails(agency)"
                    >
                      View Agency
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default {
  name: 'AgencyPage',
  data() {
    return {
      agencies: [],
      searchQuery: '',
      filteredAgencies: [],
      loading: false
    }
  },
  methods: {
    viewAgencyDetails(agency) {
      // Navigate to the view agency page with agency ID
      this.$router.push(`/view-agency-${agency.id}`);
    },
    filterAgencies() {
      this.filteredAgencies = this.agencies.filter(agency =>
        agency.agencyName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agency.agencyTagline?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agency.agencyDescription?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agency.location?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    addNewAgency() {
      // Navigate to the add agency page
      this.$router.push('/add-agency');
    },
    async fetchAgencies() {
      this.loading = true;
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
        this.filteredAgencies = this.agencies;
        console.log('Agencies fetched:', this.agencies);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        this.loading = false;
      }
    }
  },
  async mounted() {
    await this.fetchAgencies();
  }
}
</script>

<style scoped>
.agency-page {
  padding: 20px;
  min-height: 100vh;
  position: relative;
}

.agency-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* Search and Add Agency Styles */
.custom-input .v-field {
  border-radius: 8px;
}

.add-agency-btn {
  width: 160px;
  height: 40px;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  font-size: 0.875rem;
  background-color: black !important;
  color: white !important;
}

.add-agency-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  background-color: #333 !important;
}

.business-card {
  width: 100%;
  max-width: 320px;
  height: 320px;
  margin: 0;
  background: #000000;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.business-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Image section with overlay */
.image-section {
  height: 60%;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Image overlay for title */
.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px 16px 16px;
}

/* Content section */
.content-section {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Headline on image */
.card-headline {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-align: left;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Description */
.card-description {
  font-size: 0.85rem;
  color: #cccccc;
  line-height: 1.4;
  margin: 0;
  text-align: left;
  flex: 1;
}

/* Button container */
.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.action-btn {
  border: 2px solid black;
  color: white;
  font-weight: 600;
  text-transform: none;
  padding: 10px 24px;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: black;
  min-width: 140px;
}

.action-btn:hover {
  background: #333;
  border-color: #333;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .business-card {
    max-width: 280px;
    height: 280px;
  }

  .image-section {
    height: 55%;
  }

  .card-headline {
    font-size: 1rem;
  }

  .card-description {
    font-size: 0.8rem;
  }

  .content-section {
    padding: 12px;
  }
}
</style>
