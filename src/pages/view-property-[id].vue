<template>
  <div class="view-property-page">
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
             <h1 class="page-title">Property Details</h1>
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

            
            <v-card-text>
              <v-row>
                <!-- Tenant Reference -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.tenantRef"
                    label="Tenant Reference"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Property Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.propertyName"
                    label="Property Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- New Occupation -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.newOccupation"
                    label="New Occupation Yes/No"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Lease Starting Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.leaseStartDate"
                    label="Lease Starting Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Lease End Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.leaseEndDate"
                    label="Lease End Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Months Missed Rent Payment -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.monthsMissed"
                    label="Months Missed Rent Payment"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Maintenance Amount -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`R${property.maintenanceAmount.toLocaleString()}`"
                    label="Maintenance Amount"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contractor Requested -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.contractorRequested"
                    label="Contractor Requested"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Paid Towards Fund -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`R${property.paidTowardsFund.toLocaleString()}`"
                    label="Paid Towards Fund"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Amount to be Paid Out -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`R${property.amountToBePaidOut.toLocaleString()}`"
                    label="Amount to be Paid Out (Inc Interest)"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Paid Out -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.paidOut"
                    label="Paid Out Yes/No"
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
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'ViewPropertyPage',
  data() {
    return {
      property: {
        id: 1,
        tenantRef: 'T001',
        propertyName: '123 Main Street, Cape Town',
        newOccupation: 'Yes',
        leaseStartDate: '2024-01-15',
        leaseEndDate: '2025-01-15',
        monthsMissed: 2,
        maintenanceAmount: 15000,
        contractorRequested: 'Yes',
        paidTowardsFund: 5000,
        amountToBePaidOut: 25000,
        paidOut: 'No'
      },
      loading: true,
      error: null
    }
  },
  mounted() {
    console.log('ViewPropertyPage mounted');
    // Set the page title for the app bar
    document.title = 'Property Details - Depsure';
    
    // Get property ID from route params
    const propertyId = this.$route.params.id;
    console.log('Property ID from route:', propertyId);
    if (propertyId) {
      // Load property data based on ID
      console.log('Loading property with ID:', propertyId);
      // In a real app, you would fetch the property data here
      this.loadPropertyData(propertyId);
    } else {
      console.log('No property ID found in route params');
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
        } else {
          this.error = 'Property not found';
          console.log('Property not found in Firestore');
        }
      } catch (error) {
        console.error('Error loading property:', error);
        this.error = 'Failed to load property details';
      } finally {
        this.loading = false;
      }
    }
  }
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

.custom-input :deep(.v-field__input) {
  background-color: #f8f9fa !important;
  color: #000000 !important;
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
    font-size: 1.1rem;
  }
  
  .back-btn {
    width: 140px;
    height: 40px;
  }
}
</style>
