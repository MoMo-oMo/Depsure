<template>
  <div class="edit-flagged-unit-page">
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
            <h1 class="page-title">Edit Flagged Unit</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading flagged unit details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Form -->
          <div v-else class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="unit.propertyName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="[v => !!v || 'Unit Name is required']"
                      required
                    />
                  </v-col>

                  <!-- Missed Payment Flag -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="unit.missedPaymentFlag"
                      :items="['Yes', 'No']"
                      label="Missed Payment Flag"
                      variant="outlined"
                      class="custom-input"
                      :rules="[v => !!v || 'This field is required']"
                      required
                    />
                  </v-col>

                  <!-- Notice to Vacate Given -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="unit.noticeToVacateGiven"
                      :items="['Yes', 'No']"
                      label="Notice to Vacate Given"
                      variant="outlined"
                      class="custom-input"
                      :rules="[v => !!v || 'This field is required']"
                      required
                    />
                  </v-col>

                  <!-- Comments -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="unit.comments"
                      label="Comments"
                      variant="outlined"
                      class="custom-input"
                      :rules="[v => !!v || 'Comments are required']"
                      rows="4"
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
                  @click="saveUnit"
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
  name: "EditFlaggedUnitPage",
  data() {
    return {
      unit: {},
      loading: true,
      error: null,
      valid: false,
    };
  },
  mounted() {
    document.title = "Edit Flagged Unit - Depsure";
    const unitId = this.$route.params.id;
    this.loadUnit(unitId);
  },
  methods: {
    loadUnit(unitId) {
      // Mock flagged units data
      const mockUnits = [
        {
          id: 1,
          propertyName: "123 Main Street, Cape Town",
          missedPaymentFlag: "Yes",
          noticeToVacateGiven: "Yes",
          comments: "Tenant missed 2 months of payment. Follow up next week."
        },
        {
          id: 2,
          propertyName: "456 Ocean Drive, Camps Bay",
          missedPaymentFlag: "No",
          noticeToVacateGiven: "No",
          comments: "Tenant caught up on all payments. No action required."
        },
        {
          id: 3,
          propertyName: "789 Mountain View, Constantia",
          missedPaymentFlag: "Yes",
          noticeToVacateGiven: "Yes",
          comments: "Tenant has multiple late payments. Monitor payments closely."
        },
      ];

      const foundUnit = mockUnits.find((u) => u.id == unitId);
      if (foundUnit) {
        this.unit = { ...foundUnit };
        this.loading = false;
      } else {
        this.error = "Flagged unit not found";
        this.loading = false;
      }
    },
    saveUnit() {
      if (this.$refs.form.validate()) {
        console.log("Saving flagged unit:", this.unit);
        alert("Flagged unit updated successfully!");
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style scoped>
.edit-flagged-unit-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button */
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
  padding: 0;
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

/* Responsive */
@media (max-width: 768px) {
  .edit-flagged-unit-page {
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
