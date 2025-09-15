<template>
  <div class="agency-page">
    <v-container fluid>
      <!-- Search and Add Agency Section -->
      <v-row class="mb-6 align-center">
        <v-col cols="12" md="4" lg="3">
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
        <v-col cols="12" md="3" lg="2" class="d-flex justify-end">
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
          <!-- Loading state -->
          <div v-if="loading" class="pa-4">
            <v-row>
              <v-col cols="12" sm="6" md="4" lg="3" v-for="n in 8" :key="n">
                <v-skeleton-loader type="image, article" />
              </v-col>
            </v-row>
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
              sm="4"
              md="4"
              lg="4"
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
                    {{ agency.notes || 'No description available' }}
                  </p>

                  <!-- Action Button -->
                <div class="button-container">
                  <v-btn
                    color="white"
                    variant="outlined"
                    class="action-btn btn-view"

                    @click="viewAgencyDetails(agency)"
                  >
                    View
                  </v-btn>
                  <v-btn
                    color="white"

                    class="action-btn btn-select"

                    @click="selectAgency(agency)"
                  >
                    Select 
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
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'

export default {
  name: 'AgencyPage',
  data() {
    return {
      agencies: [],
      searchQuery: '',
      filteredAgencies: [],
      loading: false,
      monthFilter: this.getCurrentMonth()
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    },
    openMonthPicker() {
      const el = this.$refs.monthInput?.$el?.querySelector('input')
      if (el) {
        if (typeof el.showPicker === 'function') el.showPicker()
        else el.focus()
      }
    },
    viewAgencyDetails(agency) {
      // Navigate to the view agency page with agency ID
      this.$router.push(`/view-agency-${agency.id}`);
    },
    selectAgency(agency) {
      try {
        const appStore = useAppStore();
        // Persist current working portfolio globally
        appStore.setCurrentAgency({
          id: agency.id,
          agencyName: agency.agencyName,
          profileImageUrl: agency.profileImageUrl || agency.profileImage || null,
          location: agency.location || null,
          establishedYear: agency.establishedYear || null,
          agencyDescription: agency.agencyDescription || agency.agencyTagline || null,
        });
        // Route to Active Units scoped to this agency
        this.$router.push('/active-units');
      } catch (e) {
        console.error('Failed to select agency', e);
      }
    },
    filterAgencies() {
      const queryText = this.searchQuery.toLowerCase()
      this.filteredAgencies = this.agencies.filter(agency => {
        const textMatch = (
          agency.agencyName?.toLowerCase().includes(queryText) ||
          agency.agencyTagline?.toLowerCase().includes(queryText) ||
          agency.agencyDescription?.toLowerCase().includes(queryText) ||
          agency.location?.toLowerCase().includes(queryText)
        )

        if (!this.monthFilter) return textMatch

        // Try to filter by createdAt month if available (Firestore Timestamp or Date/string)
        let createdAt = agency.createdAt || agency.creationDate || agency.created_on || null
        if (!createdAt) return textMatch

        let createdDate
        try {
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdDate = createdAt.toDate()
          } else {
            createdDate = new Date(createdAt)
          }
          const filterDate = new Date(this.monthFilter + '-01')
          const agencyMonth = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, '0')}`
          return textMatch && agencyMonth === filterMonth
        } catch (_) {
          return textMatch
        }
      })
    },
    addNewAgency() {
      // Navigate to the add agency page
      this.$router.push('/add-agency');
    },
    async fetchAgencies() {
      this.loading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        console.log('Current user data:', currentUser);
        console.log('User type:', userType);
        console.log('User UID:', currentUser?.uid);
        
        let agenciesQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see their own agency
          // Try multiple approaches to find the agency data
          let agencyData = null;
          
          // First try: Use the current user's document ID
          try {
            const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (agencyDoc.exists()) {
              agencyData = {
                id: agencyDoc.id,
                ...agencyDoc.data()
              };
            }
          } catch (error) {
            console.log('Could not fetch agency by UID:', error);
          }
          
          // Second try: If first approach failed, try to find by email
          if (!agencyData && currentUser.email) {
            try {
              const emailQuery = query(
                collection(db, 'users'),
                where('email', '==', currentUser.email),
                where('userType', '==', 'Agency')
              );
              const emailSnapshot = await getDocs(emailQuery);
              if (!emailSnapshot.empty) {
                const doc = emailSnapshot.docs[0];
                agencyData = {
                  id: doc.id,
                  ...doc.data()
                };
              }
            } catch (error) {
              console.log('Could not fetch agency by email:', error);
            }
          }
          
          // Third try: If still no data, use the current user data directly
          if (!agencyData && currentUser) {
            agencyData = {
              id: currentUser.uid || 'unknown',
              agencyName: currentUser.agencyName || currentUser.firstName || 'My Agency',
              agencyDescription: currentUser.agencyDescription || currentUser.agencyTagline || 'Agency Description',
              location: currentUser.location || 'Location not specified',
              profileImageUrl: currentUser.profileImageUrl || currentUser.profileImage,
              ...currentUser
            };
          }
          
          if (agencyData) {
            this.agencies = [agencyData];
            this.filteredAgencies = this.agencies;
            console.log('Agency user data found:', this.agencies);
          } else {
            this.agencies = [];
            this.filteredAgencies = [];
            console.log('No agency data found for current user');
          }
          return; // Exit early for agency users
        } else {
          // Super Admin and Admin users can see all agencies
          agenciesQuery = query(
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
        }
        
        console.log('User type:', userType, 'Current user:', currentUser);
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
  /* Clamp to a few lines with ellipsis to avoid stretching layout */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow-wrap: anywhere;
}

/* Button container */
.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  text-transform: none;
  padding: 10px 16px;
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

/* View button: subtle outline on dark card */
.btn-view {
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
  color: #ffffff !important;
  background: transparent !important;
}

.btn-view:hover {
  border-color: rgba(255, 255, 255, 0.85) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}

/* Select button: primary, slightly elevated */
.btn-select {
  color: black !important;
  background-color: white;
  border: none !important;
}

.btn-select:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
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

  .button-container {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
