<template>
  <div class="view-flagged-unit-page">
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
            <h1 class="page-title">Flagged Unit Details</h1>
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

          <!-- Unit Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <v-row>
                <!-- Unit Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.propertyName"
                    label="Unit Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Missed Payment Flag -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.missedPaymentFlag"
                    label="Missed Payment Flag"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Notice to Vacate Given -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.noticeToVacateGiven"
                    label="Notice to Vacate Given"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Comments -->
                <v-col cols="12">
                  <v-textarea
                    :model-value="unit.comments"
                    label="Comments"
                    readonly
                    class="custom-input"
                    rows="3"
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
  name: "ViewFlaggedUnitPage",
  data() {
    return {
      unit: {},
      loading: true,
      error: null,
    };
  },
  mounted() {
    document.title = "Flagged Unit Details - Depsure";
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
          noticeToVacateGiven: "Yes, notice sent on 05/08/2025.",
          comments: "Tenant missed 2 months of payment. Follow up next week if no payment is received."
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
          noticeToVacateGiven: "Yes, notice sent on 20/07/2025.",
          comments: "Tenant has multiple late payments. Monitor payments closely for the next two months."
        },
      ];

      const foundUnit = mockUnits.find((u) => u.id == unitId);
      if (foundUnit) {
        this.unit = foundUnit;
        this.loading = false;
      } else {
        this.error = "Flagged unit not found";
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.view-flagged-unit-page {
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

/* Responsive */
@media (max-width: 768px) {
  .view-flagged-unit-page {
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
