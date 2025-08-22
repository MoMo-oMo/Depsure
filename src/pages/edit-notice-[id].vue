<template>
  <div class="edit-notice-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
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
            <h1 class="page-title">Edit Notice</h1>
          </div>

          <!-- Notice Information Card -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading notice details...</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <div v-else class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.propertyName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="propertyNameRules"
                      required
                    />
                  </v-col>

                  <!-- Lease Start Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseStartDate"
                      label="Lease Start Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="leaseStartDateRules"
                      required
                    />
                  </v-col>

                  <!-- Notice Given Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.noticeGivenDate"
                      label="Notice Given Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="noticeGivenRules"
                      required
                    />
                  </v-col>

                  <!-- Vacate Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseEndDate"
                      label="Vacate Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="leaseEndDateRules"
                      required
                    />
                  </v-col>

                  <!-- Maintenance Required -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="notice.maintenanceRequired"
                      label="Maintenance Required (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="maintenanceRequiredRules"
                      required
                    />
                  </v-col>
                </v-row>
              </v-card-text>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="$router.go(-1)"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  @click="saveNotice"
                  :disabled="!valid"
                  class="save-btn"
                >
                  Save Changes
                </v-btn>
              </v-card-actions>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "EditNoticePage",
  data() {
    return {
      notice: {
        id: null,
        propertyName: "",
        leaseStartDate: "",
        noticeGivenDate: "",
        leaseEndDate: "",
        maintenanceRequired: "No",
      },
      loading: true,
      error: null,
      valid: true,
      // Validation rules
      propertyNameRules: [
        v => !!v || "Unit Name is required",
        v => v.length >= 5 || "Unit Name must be at least 5 characters"
      ],
      leaseStartDateRules: [
        v => !!v || "Lease Start Date is required"
      ],
      noticeGivenRules: [
        v => !!v || "Notice Given Date is required"
      ],
      leaseEndDateRules: [
        v => !!v || "Vacate Date is required"
      ],
      maintenanceRequiredRules: [
        v => !!v || "Maintenance Required is required"
      ]
    };
  },
  mounted() {
    document.title = "Edit Notice - Depsure";
    const noticeId = this.$route.params.id;
    if (noticeId) {
      this.loadNoticeData(noticeId);
    } else {
      this.error = "Notice ID not found";
      this.loading = false;
    }
  },
  methods: {
    loadNoticeData(id) {
      const mockNotices = [
        {
          id: 1,
          propertyName: "123 Main Street, Cape Town",
          leaseStartDate: "2024-01-15",
          noticeGivenDate: "2024-12-01",
          leaseEndDate: "2025-01-15",
          maintenanceRequired: "Yes"
        },
        {
          id: 2,
          propertyName: "456 Ocean Drive, Camps Bay",
          leaseStartDate: "2023-06-01",
          noticeGivenDate: "2024-05-01",
          leaseEndDate: "2024-06-01",
          maintenanceRequired: "No"
        }
      ];

      const foundNotice = mockNotices.find(n => n.id == id);
      if (foundNotice) {
        this.notice = { ...foundNotice };
        this.loading = false;
      } else {
        this.error = "Notice not found";
        this.loading = false;
      }
    },
    saveNotice() {
      if (this.$refs.form.validate()) {
        console.log("Saving notice:", this.notice);
        alert("Notice saved successfully!");
        this.$router.go(-1);
      }
    }
  }
};
</script>

<style scoped>
.edit-notice-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling matching Notice Page */
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

/* Form card styling */
.form-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Input field styling */
.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  background-color: white !important;
  color: #000000 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Buttons */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 120px;
  height: 44px;
}

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
}
</style>
