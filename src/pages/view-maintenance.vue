<template>
  <div class="view-maintenance-entry-page">
    <v-container fluid>
      
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn icon="mdi-arrow-left" variant="outlined" color="primary" @click="$router.back()" class="back-btn">
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Agency Info Card (if applicable) -->
      <v-row class="mb-6" v-if="agencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12" md="3" class="pa-0 ma-0">
                <v-img
                  :src="agencyDetails.logo"
                  :alt="agencyDetails.name"
                  height="100%"
                  cover
                  class="agency-logo-black"
                />
              </v-col>
              <v-col cols="12" md="9">
                <v-card-title class="text-white text-h4 mb-2">
                  {{ agencyDetails.name }}
                </v-card-title>
                <v-card-text class="text-white">
                  <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ agencyDetails.location }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-calendar" class="mr-2 text-white" />
                      <span>Established: {{ agencyDetails.established }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-home" class="mr-2 text-white" />
                      <span>{{ agencyDetails.properties }} Properties</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-star" class="mr-2 text-white" />
                      <span>Rating: {{ agencyDetails.rating }}/5</span>
                    </div>
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <p class="agency-description-black">
                    {{ agencyDetails.description }}
                  </p>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Maintenance Entry Details -->
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-4">
            <v-card-title class="text-h5">
              Maintenance Entry Details
            </v-card-title>
            <v-divider class="my-2" />
            <v-card-text>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Unit Name:</v-col>
                <v-col cols="7">{{ entry.unitName }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Notice Given:</v-col>
                <v-col cols="7">{{ entry.noticeGiven }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Vacate Date:</v-col>
                <v-col cols="7">{{ entry.vacateDate }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Contact Number:</v-col>
                <v-col cols="7">{{ entry.contactNumber }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Address:</v-col>
                <v-col cols="7">{{ entry.address }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Quote Instructions:</v-col>
                <v-col cols="7">{{ entry.quoteInstructions || "N/A" }}</v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="mt-4">
              <v-btn color="primary" @click="editEntry">
                Edit Entry
              </v-btn>
              <v-btn color="error" @click="deleteEntry">
                Delete Entry
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useNotification } from '@/composables/useNotification'

export default {
  name: "ViewMaintenanceEntry",
  setup() {
    const { showSuccess } = useNotification()
    return { showSuccess }
  },
  data() {
    return {
      entry: null,
      agencies: [
        {
          name: "Pam Golding Properties",
          logo: "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg",
          location: "Cape Town, South Africa",
          established: "1976",
          properties: 1250,
          rating: 4.8,
          description: "Premium real estate agency specializing in luxury properties and exceptional service."
        },
        {
          name: "RE/MAX Properties",
          logo: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
          location: "Johannesburg, South Africa",
          established: "1973",
          properties: 890,
          rating: 4.6,
          description: "Global real estate network with local expertise and innovative solutions."
        }
      ]
    };
  },
  computed: {
    agencyDetails() {
      return this.entry ? this.agencies.find(a => a.name === this.entry.agency) : null;
    }
  },
  methods: {
    fetchEntry() {
      const id = Number(this.$route.params.id);
      // Fetch entry from a store, API, or pass via props
      const entries = [
        {
          id: 1,
          unitName: "123 Main Street, Cape Town",
          noticeGiven: "2024-12-01",
          vacateDate: "2025-01-15",
          contactNumber: "0821234567",
          address: "123 Main Street, Cape Town",
          quoteInstructions: "Upload required quote PDF here.",
          agency: "Pam Golding Properties"
        },
        {
          id: 2,
          unitName: "456 Ocean Drive, Camps Bay",
          noticeGiven: "2024-05-01",
          vacateDate: "2024-06-01",
          contactNumber: "0839876543",
          address: "456 Ocean Drive, Camps Bay",
          quoteInstructions: "",
          agency: "RE/MAX Properties"
        }
      ];
      this.entry = entries.find(e => e.id === id);
    },
    editEntry() {
      this.$router.push(`/edit-maintenance-entry-${this.entry.id}`);
    },
    deleteEntry() {
      if (confirm(`Are you sure you want to delete maintenance entry for ${this.entry.unitName}?`)) {
        // Delete logic here (API or store)
        this.showSuccess("Maintenance entry deleted successfully!");
        this.$router.back();
      }
    }
  },
  mounted() {
    this.fetchEntry();
    document.title = "View Maintenance Entry - Depsure";
  }
};
</script>

<style scoped>
.view-maintenance-entry-page {
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
  width: 140px;
  height: 40px;
}

.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  color: white;
  padding: 0;
}

.agency-logo-black {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agency-details-black { margin-bottom: 16px; }
.detail-item-black { display: flex; align-items: center; margin-bottom: 12px; color: #fff; }
.agency-description-black { color: #e0e0e0; }

@media (max-width: 768px) {
  .agency-logo-black { height: 220px; }
}
</style>
