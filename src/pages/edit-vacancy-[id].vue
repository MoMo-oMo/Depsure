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
            @click="$router.push('/vacancies')"
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
                      @input="validateForm"
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
                      @input="validateForm"
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
                      @update:model-value="validateForm"
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
                      @input="validateForm"
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
                      @input="validateForm"
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
                      @input="validateForm"
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
                  @click="$router.push('/vacancies')"
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuditTrail } from '@/composables/useAuditTrail'

export default {
  name: 'EditVacancyPage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
  },
  data() {
    return {
      vacancy: null,
      loading: true,
      saving: false,
      error: null,
      valid: false,
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
        v => /^\d{7,15}$/.test(v) || 'Please enter a valid phone number'
      ]
    }
  },
  mounted() {
    console.log('EditVacancyPage mounted with ID:', this.$route.params.id);
    document.title = 'Edit Vacancy - Depsure';
    this.loadVacancy();
  },
  watch: {
    vacancy: {
      handler(newVacancy) {
        if (newVacancy) {
          // Trigger form validation after vacancy is loaded
          this.$nextTick(() => {
            if (this.$refs.form) {
              this.valid = this.$refs.form.validate();
            }
          });
        }
      },
      immediate: true
    },
    'vacancy.newTenantFound': {
      handler() {
        // Re-validate when newTenantFound changes (affects moveInDate validation)
        this.$nextTick(() => {
          this.validateForm();
        });
      }
    }
  },
  methods: {
    async loadVacancy() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Loading vacancy with ID:', this.$route.params.id);
        const docRef = doc(db, 'vacancies', this.$route.params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          this.vacancy = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate()
          };
          console.log('Vacancy loaded:', this.vacancy);
          
          // If agencyId exists but no agencyName, try to fetch agency name
          if (this.vacancy.agencyId && !this.vacancy.agencyName) {
            await this.fetchAgencyName(this.vacancy.agencyId);
          }
        } else {
          this.error = 'Vacancy not found';
          console.log('Vacancy not found with ID:', this.$route.params.id);
        }
        
        this.loading = false;
      } catch (err) {
        this.error = 'Failed to load vacancy details. Please try again.';
        this.loading = false;
        console.error('Error loading vacancy:', err);
      }
    },

    async fetchAgencyName(agencyId) {
      try {
        const agencyRef = doc(db, 'users', agencyId);
        const agencySnap = await getDoc(agencyRef);
        if (agencySnap.exists()) {
          this.vacancy.agencyName = agencySnap.data().agencyName;
        }
      } catch (error) {
        console.error('Error fetching agency name:', error);
      }
    },
    
    validateForm() {
      if (this.$refs.form) {
        this.valid = this.$refs.form.validate();
        console.log('Form validation result:', this.valid);
        console.log('Form errors:', this.$refs.form.errors);
      }
    },
    
    async saveVacancy() {
      this.validateForm();
      if (this.valid) {
        this.saving = true;
        
        try {
          console.log('Updating vacancy:', this.vacancy);
          
          // Prepare update data
          const updateData = {
            unitName: this.vacancy.unitName,
            dateVacated: this.vacancy.dateVacated,
            newTenantFound: this.vacancy.newTenantFound,
            moveInDate: this.vacancy.newTenantFound === 'Yes' ? this.vacancy.moveInDate : null,
            propertyManager: this.vacancy.propertyManager,
            contactNumber: this.vacancy.contactNumber,
            notes: this.vacancy.notes || "",
            updatedAt: new Date()
          };
          
          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              vacancyId: this.vacancy.id,
              unitName: updateData.unitName,
              updatedFields: Object.keys(updateData),
              updatedData: updateData
            },
            this.resourceTypes.VACANCY,
            this.vacancy.id
          )
          
          // Update the document
          const docRef = doc(db, 'vacancies', this.vacancy.id);
          await updateDoc(docRef, updateData);
          
          console.log('Vacancy updated successfully');
          this.showSuccessDialog('Vacancy updated successfully!', 'Success!', 'Continue', `/view-vacancy-${this.vacancy.id}`);
        } catch (err) {
          console.error('Error updating vacancy:', err);
          this.showErrorDialog('Failed to update vacancy. Please try again.', 'Error', 'OK');
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
