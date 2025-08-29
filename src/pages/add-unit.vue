<template>
  <div class="add-unit-page">
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
            <h1 class="page-title">Add New Unit</h1>
          </div>
          
          <div class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Agency Selection -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="property.agencyId"
                      label="Select Agency"
                      variant="outlined"
                      class="custom-input"
                      :items="agencies"
                      item-title="agencyName"
                      item-value="id"
                      :rules="agencyRules"
                      required
                      :loading="agenciesLoading"
                      :disabled="isAgencyUser"
                    />
                  </v-col>

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

                  <!-- Property Type -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="property.propertyType"
                      label="Property Type"
                      variant="outlined"
                      class="custom-input"
                      :items="propertyTypeOptions"
                      item-title="title"
                      item-value="value"
                      :rules="propertyTypeRules"
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
                  {{ loading ? 'Adding Unit...' : 'Add Unit' }}
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
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: 'AddUnitPage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getOptions } = usePropertyType()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes, getOptions }
  },
  data() {
    return {
      property: {
        agencyId: '',
        tenantRef: '',
        propertyName: '',
        propertyType: '',
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
      agencies: [],
      agenciesLoading: false,
      loading: false,
      valid: true,
      // Validation rules
      agencyRules: [
        v => !!v || 'Agency selection is required'
      ],
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
      ],
      propertyTypeRules: [
        v => !!v || 'Property Type is required'
      ]
    }
  },
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Agency';
    },
    propertyTypeOptions() {
      return this.getOptions();
    }
  },
  async mounted() {
    console.log('AddUnitPage mounted');
    // Set the page title for the app bar
    document.title = 'Add New Unit - Depsure';
    
    // Fetch agencies for dropdown
    await this.fetchAgencies();
    
    // Check if agencyId is provided in URL params (from view-agency page)
    const urlParams = new URLSearchParams(window.location.search);
    const agencyId = urlParams.get('agencyId');
    if (agencyId) {
      this.property.agencyId = agencyId;
      console.log('Pre-selected agency ID:', agencyId);
    }
  },
  methods: {
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency') {
          // Agency users can only add units to their own agency
          const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (agencyDoc.exists()) {
            const agencyData = agencyDoc.data();
            this.agencies = [{
              id: agencyDoc.id,
              ...agencyData
            }];
            // Pre-select the agency for agency users
            this.property.agencyId = agencyDoc.id;
          } else {
            this.agencies = [];
          }
          console.log('Agency user - own agency loaded:', this.agencies);
        } else {
          // Super Admin and Admin users can see all agencies
          const agenciesQuery = query(
            collection(db, 'users'),
            where('userType', '==', 'Agency')
          );
          
          const querySnapshot = await getDocs(agenciesQuery);
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('All agencies fetched:', this.agencies);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK');
      } finally {
        this.agenciesLoading = false;
      }
    },
    
    async saveProperty() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          console.log('Adding new unit:', this.property);
          
          // Prepare unit data for Firestore
          const unitData = {
            ...this.property,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Add unit to Firestore
          const docRef = await addDoc(collection(db, 'units'), unitData);
          
          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.CREATE,
            {
              propertyName: this.property.propertyName,
              tenantRef: this.property.tenantRef,
              agencyId: this.property.agencyId,
              leaseStartDate: this.property.leaseStartDate,
              leaseEndDate: this.property.leaseEndDate,
              maintenanceAmount: this.property.maintenanceAmount
            },
            this.resourceTypes.UNIT,
            docRef.id
          )
          
          console.log('Unit added with ID:', docRef.id);
          this.showSuccessDialog('Unit added successfully!', 'Success!', 'Continue', '/active-units');
          
        } catch (error) {
          console.error('Error adding unit:', error);
          this.showErrorDialog('Failed to add unit. Please try again.', 'Error', 'OK');
        } finally {
          this.loading = false;
        }
      }
    }
  }
}
</script>

<style scoped>
.add-unit-page {
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
  .add-unit-page {
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
