<template>
  <div class="edit-property-page">
    <v-container fluid>
      
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/active-units')"
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
            <h1 class="page-title">Edit Property</h1>
          </div>
          
          <!-- Property Information Card -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading property details...</p>
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
                  <!-- Tenant Reference -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="property.tenantRef"
                      label="Tenant Reference"
                      variant="outlined"
                      class="custom-input"
                      :rules="tenantRefRules"
                      required
                    />
                  </v-col>

                  <!-- Property Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="property.propertyName"
                      label="Property Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="propertyNameRules"
                      required
                    />
                  </v-col>

                  <!-- New Occupation -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="property.newOccupation"
                      label="New Occupation Yes/No"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="newOccupationRules"
                      required
                    />
                  </v-col>

                  <!-- Lease Starting Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="property.leaseStartDate"
                      label="Lease Starting Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="leaseStartDateRules"
                      required
                    />
                  </v-col>

                  <!-- Lease End Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="property.leaseEndDate"
                      label="Lease End Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="leaseEndDateRules"
                      required
                    />
                  </v-col>

                  <!-- Months Missed Rent Payment -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="property.monthsMissed"
                      label="Months Missed Rent Payment"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      :rules="monthsMissedRules"
                      required
                    />
                  </v-col>

                  <!-- Maintenance Amount -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="property.maintenanceAmount"
                      label="Maintenance Amount"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      :rules="maintenanceAmountRules"
                      required
                    />
                  </v-col>

                  <!-- Contractor Requested -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="property.contractorRequested"
                      label="Contractor Requested"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="contractorRequestedRules"
                      required
                    />
                  </v-col>

                  <!-- Paid Towards Fund -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="property.paidTowardsFund"
                      label="Paid Towards Fund"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      :rules="paidTowardsFundRules"
                      required
                    />
                  </v-col>

                  <!-- Amount to be Paid Out -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="property.amountToBePaidOut"
                      label="Amount to be Paid Out (Inc Interest)"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      :rules="amountToBePaidOutRules"
                      required
                    />
                  </v-col>

                  <!-- Paid Out -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="property.paidOut"
                      label="Paid Out Yes/No"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="paidOutRules"
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
                  @click="$router.push('/active-units')"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  @click="saveProperty"
                  :disabled="!valid || loading"
                  :loading="loading"
                  class="save-btn"
                >
                  {{ loading ? 'Saving...' : 'Save Changes' }}
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuditTrail } from '@/composables/useAuditTrail'

export default {
  name: 'EditPropertyPage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
  },
  data() {
    return {
      property: {
        id: '',
        tenantRef: '',
        propertyName: '',
        newOccupation: '',
        leaseStartDate: '',
        leaseEndDate: '',
        monthsMissed: 0,
        maintenanceAmount: 0,
        contractorRequested: '',
        paidTowardsFund: 0,
        amountToBePaidOut: 0,
        paidOut: ''
      },
      loading: true,
      error: null,
      valid: true,
      // Validation rules
      tenantRefRules: [
        v => !!v || 'Tenant Reference is required',
        v => v.length >= 2 || 'Tenant Reference must be at least 2 characters'
      ],
      propertyNameRules: [
        v => !!v || 'Property Name is required',
        v => v.length >= 5 || 'Property Name must be at least 5 characters'
      ],
      newOccupationRules: [
        v => !!v || 'New Occupation is required'
      ],
      leaseStartDateRules: [
        v => !!v || 'Lease Start Date is required'
      ],
      leaseEndDateRules: [
        v => !!v || 'Lease End Date is required'
      ],
      monthsMissedRules: [
        v => v >= 0 || 'Months Missed cannot be negative',
        v => v <= 12 || 'Months Missed cannot exceed 12'
      ],
      maintenanceAmountRules: [
        v => v >= 0 || 'Maintenance Amount cannot be negative'
      ],
      contractorRequestedRules: [
        v => !!v || 'Contractor Requested is required'
      ],
      paidTowardsFundRules: [
        v => v >= 0 || 'Paid Towards Fund cannot be negative'
      ],
      amountToBePaidOutRules: [
        v => v >= 0 || 'Amount to be Paid Out cannot be negative'
      ],
      paidOutRules: [
        v => !!v || 'Paid Out is required'
      ]
    }
  },
  async mounted() {
    console.log('EditPropertyPage mounted');
    // Set the page title for the app bar
    document.title = 'Edit Property - Depsure';
    
    // Get property ID from route params
    const propertyId = this.$route.params.id;
    console.log('Property ID from route:', propertyId);
    if (propertyId) {
      // Load property data based on ID
      console.log('Loading property with ID:', propertyId);
      await this.loadPropertyData(propertyId);
    } else {
      console.log('No property ID found in route params');
      this.error = 'No property ID provided';
      this.loading = false;
    }
  },
  methods: {
    async loadPropertyData(propertyId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Loading property data for ID:', propertyId);
        
        // Fetch property from Firestore
        const propertyDoc = await getDoc(doc(db, 'units', propertyId));
        
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          this.property = {
            id: propertyDoc.id,
            ...propertyData
          };
          console.log('Property loaded successfully:', this.property);
          
          // Ensure all required fields have default values if they're missing
          this.property.tenantRef = this.property.tenantRef || '';
          this.property.propertyName = this.property.propertyName || '';
          this.property.newOccupation = this.property.newOccupation || '';
          this.property.leaseStartDate = this.property.leaseStartDate || '';
          this.property.leaseEndDate = this.property.leaseEndDate || '';
          this.property.monthsMissed = this.property.monthsMissed || 0;
          this.property.maintenanceAmount = this.property.maintenanceAmount || 0;
          this.property.contractorRequested = this.property.contractorRequested || '';
          this.property.paidTowardsFund = this.property.paidTowardsFund || 0;
          this.property.amountToBePaidOut = this.property.amountToBePaidOut || 0;
          this.property.paidOut = this.property.paidOut || '';
          
          console.log('Property data after defaults:', this.property);
        } else {
          this.error = 'Property not found';
          console.log('Property not found in Firestore');
        }
      } catch (error) {
        console.error('Error loading property:', error);
        this.error = `Failed to load property details: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
    async saveProperty() {
      console.log('Save property called, form valid:', this.valid);
      console.log('Form ref exists:', !!this.$refs.form);
      
      if (this.$refs.form && this.$refs.form.validate()) {
        this.loading = true;
        try {
          console.log('Saving property:', this.property);
          
          // Validate that we have an ID
          if (!this.property.id) {
            throw new Error('Property ID is missing');
          }
          
          // Prepare property data for Firestore (remove id field)
          const { id, ...propertyData } = this.property;
          
          // Add updated timestamp
          propertyData.updatedAt = new Date();
          
          console.log('Property data to save:', propertyData);
          
          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              unitId: id,
              unitName: propertyData.propertyName,
              tenantRef: propertyData.tenantRef,
              updatedFields: Object.keys(propertyData),
              updatedData: propertyData
            },
            this.resourceTypes.UNIT,
            id
          )
          
          // Update property in Firestore
          await updateDoc(doc(db, 'units', id), propertyData);
          
          console.log('Property updated successfully');
          this.showSuccessDialog('Property saved successfully!', 'Success!', 'Continue', `/view-property-${id}`);
          
        } catch (error) {
          console.error('Error saving property:', error);
          this.showErrorDialog(`Failed to save property: ${error.message}`, 'Error', 'OK');
        } finally {
          this.loading = false;
        }
      } else {
        console.log('Form validation failed');
        this.showErrorDialog('Please fix the form errors before saving.', 'Validation Error', 'OK');
      }
    }
  }
}
</script>

<style scoped>
.edit-property-page {
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

/* Title section styling to match add-agency */
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

/* Form card styling */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
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

/* Button styling */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 120px;
  height: 44px;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .edit-property-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .back-btn {
    width: 140px;
    height: 40px;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
