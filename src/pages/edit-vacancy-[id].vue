<template>
  <div class="edit-vacancy-page">
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
            <h1 class="page-title">Edit Vacancy</h1>
          </div>
          
          <div class="form-card" elevation="0">
            <!-- Loading State -->
            <div v-if="loading" class="loading-container">
              <v-progress-circular indeterminate color="black" size="64"></v-progress-circular>
              <p class="loading-text">Loading vacancy details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container">
              <v-icon color="error" size="64">mdi-alert-circle</v-icon>
              <h3 class="error-title">Error Loading Vacancy</h3>
              <p class="error-message">{{ error }}</p>
              <v-btn @click="loadVacancy" color="black" variant="elevated">
                Try Again
              </v-btn>
            </div>

            <!-- Edit Form -->
            <v-form v-else-if="vacancy" ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.unitName"
                      label="Unit Name/Address"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                    />
                  </v-col>

                  <!-- Date Vacated -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.dateVacated"
                      label="Date Vacated"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="dateVacatedRules"
                      required
                    />
                  </v-col>

                  <!-- New Tenant Found -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="vacancy.newTenantFound"
                      label="New Tenant Found"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="newTenantFoundRules"
                      required
                    />
                  </v-col>

                  <!-- Move In Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.moveInDate"
                      label="Move In Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="moveInDateRules"
                      :disabled="vacancy.newTenantFound === 'No'"
                    />
                  </v-col>

                  <!-- Property Manager -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.propertyManager"
                      label="Property Manager"
                      variant="outlined"
                      class="custom-input"
                      :rules="propertyManagerRules"
                      required
                    />
                  </v-col>

                  <!-- Contact Number -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.contactNumber"
                      label="Contact Number"
                      variant="outlined"
                      type="tel"
                      class="custom-input"
                      :rules="contactNumberRules"
                      required
                    />
                  </v-col>

                  <!-- Monthly Rent -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="vacancy.monthlyRent"
                      label="Monthly Rent ($)"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      :rules="monthlyRentRules"
                      required
                    />
                  </v-col>

                  <!-- Security Deposit -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="vacancy.securityDeposit"
                      label="Security Deposit ($)"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      :rules="securityDepositRules"
                      required
                    />
                  </v-col>

                  <!-- Property Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="vacancy.propertyStatus"
                      label="Property Status"
                      variant="outlined"
                      class="custom-input"
                      :items="['Available', 'Under Maintenance', 'Reserved', 'Rented']"
                      :rules="propertyStatusRules"
                      required
                    />
                  </v-col>

                  <!-- Cleaning Required -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="vacancy.cleaningRequired"
                      label="Cleaning Required"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="cleaningRequiredRules"
                      required
                    />
                  </v-col>

                  <!-- Notes -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="vacancy.notes"
                      label="Notes"
                      variant="outlined"
                      class="custom-input"
                      rows="4"
                      auto-grow
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
                  @click="saveVacancy"
                  :disabled="!valid || saving"
                  :loading="saving"
                  class="save-btn"
                >
                  {{ saving ? 'Saving...' : 'Update Vacancy' }}
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
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'EditVacancyPage',
  setup() {
    const { showSuccess, showError } = useNotification()
    return { showSuccess, showError }
  },
  data() {
    return {
      vacancy: null,
      loading: true,
      saving: false,
      error: null,
      valid: true,
      // Validation rules
      unitNameRules: [
        v => !!v || 'Unit Name is required',
        v => v.length >= 3 || 'Unit Name must be at least 3 characters'
      ],
      dateVacatedRules: [
        v => !!v || 'Date Vacated is required'
      ],
      newTenantFoundRules: [
        v => !!v || 'New Tenant Found is required'
      ],
      moveInDateRules: [
        v => {
          if (this.vacancy && this.vacancy.newTenantFound === 'Yes') {
            return !!v || 'Move In Date is required when new tenant is found'
          }
          return true
        }
      ],
      propertyManagerRules: [
        v => !!v || 'Property Manager is required',
        v => v.length >= 2 || 'Property Manager must be at least 2 characters'
      ],
      contactNumberRules: [
        v => !!v || 'Contact Number is required',
        v => /^[\+]?[1-9][\d]{0,15}$/.test(v) || 'Please enter a valid phone number'
      ],
      monthlyRentRules: [
        v => v >= 0 || 'Monthly Rent cannot be negative'
      ],
      securityDepositRules: [
        v => v >= 0 || 'Security Deposit cannot be negative'
      ],
      propertyStatusRules: [
        v => !!v || 'Property Status is required'
      ],
      cleaningRequiredRules: [
        v => !!v || 'Cleaning Required is required'
      ]
    }
  },
  mounted() {
    console.log('EditVacancyPage mounted with ID:', this.$route.params.id);
    document.title = 'Edit Vacancy - Depsure';
    this.loadVacancy();
  },
  methods: {
    async loadVacancy() {
      this.loading = true;
      this.error = null;
      
      try {
        // Simulate API call - in real app, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        this.vacancy = {
          id: this.$route.params.id,
          unitName: '123 Main Street, Apt 4B',
          dateVacated: '2024-12-01',
          newTenantFound: 'Yes',
          moveInDate: '2025-01-15',
          propertyManager: 'John Smith',
          contactNumber: '+1 (555) 123-4567',
          monthlyRent: 2500,
          securityDeposit: 5000,
          propertyStatus: 'Reserved',
          cleaningRequired: 'No',
          notes: 'Tenant left the property in excellent condition. New tenant has been approved and will move in on January 15th, 2025.'
        };
        
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to load vacancy details. Please try again.';
        this.loading = false;
        console.error('Error loading vacancy:', err);
      }
    },
    
    async saveVacancy() {
      if (this.$refs.form.validate()) {
        this.saving = true;
        
        try {
          // Simulate API call - in real app, make API call to update
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          console.log('Updating vacancy:', this.vacancy);
          this.showSuccess('Vacancy updated successfully!');
          this.$router.go(-1); // Go back to previous page
        } catch (err) {
          console.error('Error updating vacancy:', err);
                      this.showError('Failed to update vacancy. Please try again.');
        } finally {
          this.saving = false;
        }
      }
    }
  }
}
</script>

<style scoped>
.edit-vacancy-page {
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

/* Title section styling */
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

/* Loading and error states */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 1.1rem;
}

.error-title {
  margin: 16px 0 8px 0;
  color: #d32f2f;
  font-size: 1.25rem;
}

.error-message {
  color: #666;
  margin-bottom: 24px;
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
  .edit-vacancy-page {
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
