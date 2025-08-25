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
                <!-- Agency -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="agencyName"
                    label="Agency"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Unit Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.unitName"
                    label="Unit Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Tenant Reference -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.tenantRef"
                    label="Tenant Reference"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Lease Start Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.leaseStartDate"
                    label="Lease Start Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Flag Reason -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.flagReason"
                    label="Reason Flagged"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Date Flagged -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="unit.dateFlagged"
                    label="Date Flagged"
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

                <!-- Action Taken -->
                <v-col cols="12">
                  <v-textarea
                    :model-value="unit.actionTaken"
                    label="Action Taken"
                    readonly
                    class="custom-input"
                    rows="3"
                  />
                </v-col>

                <!-- Notes -->
                <v-col cols="12">
                  <v-textarea
                    :model-value="unit.notes"
                    label="Additional Notes"
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
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: "ViewFlaggedUnitPage",
  data() {
    return {
      unit: {},
      agencyName: '',
      loading: true,
      error: null,
    };
  },
  async mounted() {
    document.title = "Flagged Unit Details - Depsure";
    const unitId = this.$route.params.id;
    if (unitId) {
      await this.loadUnit(unitId);
    } else {
      this.error = "No flagged unit ID provided";
      this.loading = false;
    }
  },
  methods: {
    async loadUnit(unitId) {
      try {
        console.log('Loading flagged unit with ID:', unitId);
        
        // Fetch flagged unit from Firestore
        const unitDoc = await getDoc(doc(db, 'flaggedUnits', unitId));
        
        if (unitDoc.exists()) {
          const unitData = unitDoc.data();
          this.unit = {
            id: unitDoc.id,
            ...unitData
          };
          
          // Fetch agency name if agencyId exists
          if (unitData.agencyId) {
            await this.loadAgencyName(unitData.agencyId);
          }
          
          console.log('Flagged unit loaded:', this.unit);
        } else {
          this.error = "Flagged unit not found";
        }
      } catch (error) {
        console.error('Error loading flagged unit:', error);
        this.error = "Failed to load flagged unit details";
      } finally {
        this.loading = false;
      }
    },

    async loadAgencyName(agencyId) {
      try {
        const agencyDoc = await getDoc(doc(db, 'users', agencyId));
        if (agencyDoc.exists()) {
          const agencyData = agencyDoc.data();
          this.agencyName = agencyData.agencyName || 'Unknown Agency';
        } else {
          this.agencyName = 'Unknown Agency';
        }
      } catch (error) {
        console.error('Error loading agency name:', error);
        this.agencyName = 'Unknown Agency';
      }
    }
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
