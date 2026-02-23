<template>
  <div class="view-property-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/notices')"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Page Title -->
      <v-row class="mb-6">
        <v-col cols="12">
          <h1 class="page-title">Property Details</h1>
          <p class="page-subtitle">View complete property and tenant information</p>
        </v-col>
      </v-row>

      <!-- Property Information Card -->
      <v-row>
        <v-col cols="12">
          <v-card class="form-card">
            <v-card-title class="card-header">
              <v-icon class="mr-2" icon="mdi-home" />
              Property Information
            </v-card-title>

            <v-card-text>
              <v-row>
                <!-- Tenant Reference -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Tenant Reference"
                    :model-value="property.tenantRef"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Property Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Property Name"
                    :model-value="property.propertyName"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- New Occupation -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="New Occupation Yes/No"
                    :model-value="property.newOccupation"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Lease Starting Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Lease Starting Date"
                    :model-value="formatDateField(property.leaseStartDate)"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Lease End Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Lease End Date"
                    :model-value="formatDateField(property.leaseEndDate)"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Months Missed Rent Payment -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Months Missed Rent Payment"
                    :model-value="property.monthsMissed"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Maintenance Amount -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Maintenance Amount"
                    :model-value="formatCurrency(property.maintenanceAmount)"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Contractor Requested -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Contractor Requested"
                    :model-value="property.contractorRequested"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Paid Out -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Paid Out Yes/No"
                    :model-value="property.paidOut"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <!-- Paid Towards Fund -->
                <v-col cols="12" md="6">
                  <v-text-field
                    class="custom-input"
                    label="Paid Towards Fund"
                    :model-value="formatCurrency(property.paidTowardsFund)"
                    readonly
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
    name: 'ViewPropertyPage',
    data () {
      return {
        property: {
          id: 1,
          tenantRef: 'T001',
          propertyName: '123 Main Street, Cape Town',
          newOccupation: 'Yes',
          leaseStartDate: '2024-01-15',
          leaseEndDate: '2025-01-15',
          monthsMissed: 2,
          maintenanceAmount: 15_000,
          contractorRequested: 'Yes',
          paidOut: 'No',
          paidTowardsFund: 5000,
        },
      }
    },
    mounted () {
      console.log('ViewPropertyPage mounted')
      // Set the page title for the app bar
      document.title = 'Property Details - Depsure'

      // Get property ID from route params
      const propertyId = this.$route.params.id
      console.log('Property ID from route:', propertyId)
      if (propertyId) {
        // Load property data based on ID
        console.log('Loading property with ID:', propertyId)
        // In a real app, you would fetch the property data here
        this.loadPropertyData(propertyId)
      }
    },
    methods: {
      formatDateField (value) {
        if (!value) return 'N/A'
        if (typeof value === 'string') return value
        if (value instanceof Date) return value.toISOString().slice(0, 10)
        if (value?.toDate) {
          try {
            return value.toDate().toISOString().slice(0, 10)
          } catch (error) {
            console.warn('Failed to convert Firestore timestamp:', error)
          }
        }
        return String(value)
      },
      formatCurrency (value) {
        if (value === null || value === undefined || value === '') return 'R0'
        const amount = typeof value === 'number' ? value : Number(value)
        if (!Number.isFinite(amount)) return 'R0'
        return `R${amount.toLocaleString()}`
      },
      loadPropertyData (propertyId) {
        // Mock data - in a real app this would be an API call
        const mockProperties = [
          {
            id: 1,
            tenantRef: 'T001',
            propertyName: '123 Main Street, Cape Town',
            newOccupation: 'Yes',
            leaseStartDate: '2024-01-15',
            leaseEndDate: '2025-01-15',
            monthsMissed: 2,
            maintenanceAmount: 15_000,
            contractorRequested: 'Yes',
            paidOut: 'No',
            paidTowardsFund: 5000,
          },
          {
            id: 2,
            tenantRef: 'T002',
            propertyName: '456 Ocean Drive, Camps Bay',
            newOccupation: 'No',
            leaseStartDate: '2023-06-01',
            leaseEndDate: '2024-06-01',
            monthsMissed: 0,
            maintenanceAmount: 8000,
            contractorRequested: 'No',
            paidOut: 'Yes',
            paidTowardsFund: 12_000,
          },
          {
            id: 3,
            tenantRef: 'T003',
            propertyName: '789 Mountain View, Constantia',
            newOccupation: 'Yes',
            leaseStartDate: '2024-02-01',
            leaseEndDate: '2025-02-01',
            monthsMissed: 1,
            maintenanceAmount: 22_000,
            contractorRequested: 'Yes',
            paidOut: 'No',
            paidTowardsFund: 8000,
          },
          {
            id: 4,
            tenantRef: 'T004',
            propertyName: '321 Beach Road, Clifton',
            newOccupation: 'No',
            leaseStartDate: '2023-09-15',
            leaseEndDate: '2024-09-15',
            monthsMissed: 3,
            maintenanceAmount: 30_000,
            contractorRequested: 'Yes',
            paidOut: 'No',
            paidTowardsFund: 15_000,
          },
          {
            id: 5,
            tenantRef: 'T005',
            propertyName: '654 Garden Street, Newlands',
            newOccupation: 'Yes',
            leaseStartDate: '2024-03-01',
            leaseEndDate: '2025-03-01',
            monthsMissed: 0,
            maintenanceAmount: 12_000,
            contractorRequested: 'No',
            paidOut: 'Yes',
            paidTowardsFund: 10_000,
          },
        ]

        const foundProperty = mockProperties.find(p => p.id == propertyId)
        if (foundProperty) {
          this.property = foundProperty
        }
      },
    },
  }
</script>

<style scoped>
.view-property-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling to match system buttons */
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

/* Page title styling */
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1rem;
  color: #666666;
  margin: 0;
}

/* Form card styling */
.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #000000;
}

/* Input field styling */
.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-property-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .back-btn {
    width: 140px;
    height: 40px;
  }
}
</style>
