<template>
  <div class="view-flagged-unit-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/flagged-units')"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Page Title -->
      <v-row class="mb-6">
        <v-col cols="12">
          <h1 class="page-title">Flagged Unit Details</h1>
          <p class="page-subtitle">View complete flagged unit information</p>
        </v-col>
      </v-row>

      <!-- Flagged Unit Information Card -->
      <v-row>
        <v-col cols="12">
          <v-card class="form-card">
            <v-card-title class="card-header">
              <v-icon class="mr-2" icon="mdi-alert-circle-outline" />
              Flagged Unit Information
            </v-card-title>

            <v-card-text>
              <v-row>
                <!-- Unit Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Unit Name"
                    :model-value="unit.propertyName"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Missed Payment Flag -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Missed Payment Flag"
                    :model-value="unit.missedPaymentFlag"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Notice Given / Notes -->
                <v-col cols="12">
                  <v-textarea
                    class="custom-input"
                    label="Notice Given / Notes"
                    :model-value="unit.noticeGivenNotes"
                    readonly
                    rows="4"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'ViewFlaggedUnitPage',
    data () {
      return {
        unit: {
          id: null,
          propertyName: '123 Main Street, Cape Town',
          missedPaymentFlag: 'Yes',
          noticeGivenNotes: 'Tenant has missed 2 months of payment. Notice given on 01/08/2025.',
        },
      }
    },
    mounted () {
      document.title = 'Flagged Unit Details - Depsure'
      const unitId = this.$route.params.id
      if (unitId) {
        this.loadUnitData(unitId)
      }
    },
    methods: {
      loadUnitData (id) {
        // Mock data - replace with API call in real app
        const mockUnits = [
          {
            id: 1,
            propertyName: '123 Main Street, Cape Town',
            missedPaymentFlag: 'Yes',
            noticeGivenNotes: 'Tenant has missed 2 months of payment. Notice given on 01/08/2025.',
          },
          {
            id: 2,
            propertyName: '456 Ocean Drive, Camps Bay',
            missedPaymentFlag: 'No',
            noticeGivenNotes: 'Tenant caught up on all payments.',
          },
        ]

        const foundUnit = mockUnits.find(u => u.id == id)
        if (foundUnit) {
          this.unit = foundUnit
        }
      },
    },
  }
</script>

<style scoped>
.view-flagged-unit-page {
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
  width: 160px;
  height: 44px;
}

.back-btn:hover {
  background-color: #333 !important;
  border-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #000;
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}
</style>
