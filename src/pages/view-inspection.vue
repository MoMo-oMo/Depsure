<template>
  <div class="view-inspection-entry-page">
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

      <!-- Inspection Entry Details -->
      <v-row>
        <v-col cols="12" md="8" lg="6">
          <v-card class="pa-4">
            <v-card-title class="text-h5">
              Inspection Entry Details
            </v-card-title>
            <v-divider class="my-2" />
            <v-card-text>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Unit Name:</v-col>
                <v-col cols="7">{{ entry.unitName }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Inspection Required:</v-col>
                <v-col cols="7">{{ entry.inspectionRequired }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Contact Person:</v-col>
                <v-col cols="7">{{ entry.contactPerson }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Contact Number:</v-col>
                <v-col cols="7">{{ entry.contactNumber }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Appointment Made:</v-col>
                <v-col cols="7">{{ entry.appointmentMade }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Inspection Date:</v-col>
                <v-col cols="7">{{ entry.inspectionDate }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="5" class="font-weight-bold">Quotes Needed:</v-col>
                <v-col cols="7">{{ entry.quotesNeeded }}</v-col>
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
  name: "ViewInspectionEntry",
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
          description: "Premium real estate agency specializing in inspections."
        },
        {
          name: "RE/MAX Properties",
          logo: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
          location: "Johannesburg, South Africa",
          established: "1973",
          properties: 890,
          rating: 4.6,
          description: "Global real estate network with local expertise."
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
      const entries = [
        {
          id: 1,
          unitName: "123 Main Street, Cape Town",
          inspectionRequired: "Yes",
          contactPerson: "John Doe",
          contactNumber: "0821234567",
          appointmentMade: "Yes",
          inspectionDate: "2024-12-01",
          quotesNeeded: "Yes",
          agency: "Pam Golding Properties"
        },
        {
          id: 2,
          unitName: "456 Ocean Drive, Camps Bay",
          inspectionRequired: "No",
          contactPerson: "Jane Smith",
          contactNumber: "0839876543",
          appointmentMade: "No",
          inspectionDate: "2024-11-15",
          quotesNeeded: "No",
          agency: "RE/MAX Properties"
        }
      ];
      this.entry = entries.find(e => e.id === id);
    },
    editEntry() {
      this.$router.push(`/edit-inspection-entry-${this.entry.id}`);
    },
    deleteEntry() {
      if (confirm(`Are you sure you want to delete inspection entry for ${this.entry.unitName}?`)) {
        this.showSuccess("Inspection entry deleted successfully!");
        this.$router.back();
      }
    }
  },
  mounted() {
    this.fetchEntry();
    document.title = "View Inspection Entry - Depsure";
  }
};
</script>

<style scoped>
.view-inspection-entry-page {
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
