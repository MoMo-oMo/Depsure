<template>
  <div class="view-maintenance-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/maintenance')"
            class="back-btn"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Maintenance Entry Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading maintenance entry...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Maintenance Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <v-row>
                <!-- Agency -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.agencyName || 'Not specified'"
                    label="Agency"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Unit Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.unitName"
                    label="Unit Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Notice Given -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.noticeGiven"
                    label="Notice Given"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Vacate Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.vacateDate"
                    label="Vacate Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contact Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.contactNumber"
                    label="Contact Number"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Address -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.address"
                    label="Address"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Status -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.status"
                    label="Maintenance Status"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Priority -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.priority"
                    label="Priority Level"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Estimated Cost -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.estimatedCost ? `R${entry.estimatedCost.toLocaleString()}` : 'Not specified'"
                    label="Estimated Cost"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Quote File -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.quoteFileName || 'No file uploaded'"
                    label="Quote Instructions File"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Notes -->
                <v-col cols="12">
                  <v-textarea
                    :model-value="entry.notes || 'No additional notes'"
                    label="Additional Notes"
                    variant="outlined"
                    readonly
                    class="custom-input"
                    rows="3"
                    auto-grow
                  />
                </v-col>

                <!-- Created Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Not available'"
                    label="Created Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Last Updated -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString() : 'Not available'"
                    label="Last Updated"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Action Buttons -->
            <v-card-actions class="pa-4">
              <v-spacer />
              <v-btn
                color="black"
                variant="elevated"
                class="edit-btn"
                @click="editEntry"
              >
                Edit Entry
              </v-btn>
            </v-card-actions>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: "ViewMaintenancePage",
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    return { showErrorDialog }
  },
  data() {
    return {
      entry: {},
      loading: true,
      error: null
    };
  },
  async mounted() {
    document.title = "Maintenance Entry Details - Depsure";
    const entryId = this.$route.params.id;
    this.loadEntry(entryId);
  },
  methods: {
    async loadEntry(entryId) {
      try {
        const docRef = doc(db, 'maintenance', entryId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.entry = {
            id: docSnap.id,
            agencyName: data.agencyName || 'Not specified',
            unitName: data.unitName || '',
            noticeGiven: data.noticeGiven || 'No',
            vacateDate: data.vacateDate || '',
            contactNumber: data.contactNumber || '',
            address: data.address || '',
            status: data.status || 'Pending',
            priority: data.priority || 'Medium',
            estimatedCost: data.estimatedCost || 0,
            notes: data.notes || '',
            quoteFileName: data.quoteFileName || '',
            quoteFileURL: data.quoteFileURL || '',
            createdAt: data.createdAt?.toDate() || data.createdAt,
            updatedAt: data.updatedAt?.toDate() || data.updatedAt
          };
          this.loading = false;
        } else {
          this.error = "Maintenance entry not found";
          this.loading = false;
        }
      } catch (error) {
        console.error('Error loading maintenance entry:', error);
        this.error = "Failed to load maintenance entry";
        this.loading = false;
      }
    },

    editEntry() {
      this.$router.push(`/edit-maintenance-${this.entry.id}`);
    }
  }
};
</script>

<style scoped>
.view-maintenance-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling */
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

/* Title section */
.title-section {
  background: black;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: left;
}

/* Form card */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  padding: 10px !important;
  background-color: white !important;
  color: #000 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

.edit-btn {
  width: 160px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #333 !important;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .view-maintenance-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .back-btn {
    width: 140px;
    height: 40px;
  }
}
</style>
