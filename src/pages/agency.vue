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
        <v-col cols="12" md="3" lg="2" class="d-flex align-center">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            class="add-agency-btn"
            @click="addNewAgency"
          >
            Add Agency
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col
              v-for="(agency, index) in filteredAgencies"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <div class="business-card">
                <!-- Image section with overlay title -->
                <div class="image-section">
                  <v-img
                    :src="agency.logo"
                    :alt="agency.name"
                    class="card-image"
                    cover
                  />
                  <div class="image-overlay">
                    <h2 class="card-headline">
                      {{ agency.name }}
                    </h2>
                  </div>
                </div>

                <!-- Content section -->
                <div class="content-section">
                  <!-- Description -->
                  <p class="card-description">
                    {{ agency.description }}
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
export default {
  name: 'AgencyPage',
  data() {
    return {
      agencies: [
        {
          name: 'Pam Golding Properties',
          title: 'Luxury Real Estate Specialist',
          logo: 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg',
          description: 'Premium real estate agency specializing in luxury properties and exceptional service.',
          location: 'Cape Town, South Africa',
          established: '1976',
          properties: 1250,
          rating: 4.8
        },
        {
          name: 'RE/MAX Properties',
          title: 'Global Real Estate Network',
          logo: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
          description: 'Global real estate network with local expertise and innovative solutions.',
          location: 'Johannesburg, South Africa',
          established: '1973',
          properties: 890,
          rating: 4.6
        },
        {
          name: 'Seeff Properties',
          title: 'Family-Owned Agency',
          logo: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          description: 'Trusted family-owned agency with over 50 years of experience in property sales.',
          location: 'Durban, South Africa',
          established: '1964',
          properties: 756,
          rating: 4.7
        },
        {
          name: 'Lew Geffen Sotheby\'s',
          title: 'Luxury Property Experts',
          logo: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          description: 'Luxury real estate specialists with international connections and premium listings.',
          location: 'Pretoria, South Africa',
          established: '1983',
          properties: 432,
          rating: 4.9
        },
        {
          name: 'Chas Everitt International',
          title: 'Comprehensive Property Services',
          logo: 'https://images.pexels.com/photos/1797393/pexels-photo-1797393.jpeg',
          description: 'Comprehensive property services with a focus on customer satisfaction and results.',
          location: 'Port Elizabeth, South Africa',
          established: '1980',
          properties: 678,
          rating: 4.5
        },
        {
          name: 'Keller Williams Realty',
          title: 'Innovative Real Estate',
          logo: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
          description: 'Innovative real estate company with cutting-edge technology and training programs.',
          location: 'Bloemfontein, South Africa',
          established: '1983',
          properties: 543,
          rating: 4.4
        }
      ],
      searchQuery: '',
      filteredAgencies: []
    }
  },
  methods: {
    viewAgencyDetails(agency) {
      // Navigate to the view agency page
      this.$router.push('/view-agency');
    },
    filterAgencies() {
      this.filteredAgencies = this.agencies.filter(agency =>
        agency.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agency.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agency.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        agency.location.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    addNewAgency() {
      // Navigate to the add agency page
      this.$router.push('/add-agency');
    }
  },
  mounted() {
    this.filteredAgencies = this.agencies; // Initialize filteredAgencies with all agencies
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
