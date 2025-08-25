<template>
  <div class="view-inspection-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
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
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Inspection Entry Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading inspection entry...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Inspection Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <v-row>
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

                <!-- Inspection Required -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.inspectionRequired"
                    label="Inspection Required"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contact Person -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.contactPerson"
                    label="Contact Person"
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

                <!-- Appointment Made -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.appointmentMade"
                    label="Appointment Made"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Inspection Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.inspectionDate"
                    label="Inspection Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Quotes Needed -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.quotesNeeded"
                    label="Quotes Needed"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "ViewInspectionPage",
  data() {
    return {
      entry: {},
      loading: true,
      error: null,
      entries: [
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
      ]
    };
  },
  mounted() {
    document.title = "Inspection Entry Details - Depsure";
    const entryId = this.$route.params.id;
    this.loadEntry(entryId);
  },
  methods: {
    loadEntry(entryId) {
      const foundEntry = this.entries.find(e => e.id == entryId);
      if (foundEntry) {
        this.entry = foundEntry;
        this.loading = false;
      } else {
        this.error = "Inspection entry not found";
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.view-inspection-page {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Input styling */
.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  background-color: #f8f9fa !important;
  color: #000000 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Responsive */
@media (max-width: 768px) {
  .view-inspection-page {
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
