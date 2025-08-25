<template>
  <div class="add-vacancy-page">
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
            <h1 class="page-title">Add New Vacancy</h1>
          </div>
          
          <div class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Agency Selection -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="vacancy.agencyId"
                      label="Select Agency"
                      variant="outlined"
                      class="custom-input"
                      :items="agencies"
                      item-title="agencyName"
                      item-value="id"
                      :rules="agencyRules"
                      :loading="agenciesLoading"
                      required
                    />
                  </v-col>

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
                      class="custom-input"
                      :rules="contactNumberRules"
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
                      :rules="notesRules"
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
                  :disabled="!valid || loading"
                  :loading="loading"
                  class="save-btn"
                >
                  {{ loading ? 'Adding Vacancy...' : 'Add Vacancy' }}
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
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export default {
  name: 'AddVacancyPage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    return { showSuccessDialog, showErrorDialog }
  },
  data() {
    return {
      vacancy: {
        agencyId: '',
        unitName: '',
        dateVacated: '',
        newTenantFound: '',
        moveInDate: '',
        propertyManager: '',
        contactNumber: '',
        notes: ''
      },
      agencies: [],
      agenciesLoading: false,
      valid: true,
      loading: false,
      // Validation rules
      agencyRules: [
        v => !!v || 'Agency is required'
      ],
      unitNameRules: [
        v => !!v || 'Unit name is required'
      ],
      dateVacatedRules: [
        v => !!v || 'Date vacated is required'
      ],
      newTenantFoundRules: [
        v => !!v || 'Please specify if new tenant is found'
      ],
      moveInDateRules: [
        v => {
          if (this.vacancy.newTenantFound === 'Yes') {
            return !!v || 'Move in date is required when new tenant is found'
          }
          return true
        }
      ],
      propertyManagerRules: [
        v => !!v || 'Property manager is required'
      ],
      contactNumberRules: [
        v => !!v || 'Contact number is required'
      ],
      notesRules: []
    }
  },
  methods: {
    async saveVacancy() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          console.log('Adding new vacancy:', this.vacancy)
          
          // Prepare vacancy data for Firestore
          const vacancyData = {
            agencyId: this.vacancy.agencyId,
            unitName: this.vacancy.unitName,
            dateVacated: this.vacancy.dateVacated,
            newTenantFound: this.vacancy.newTenantFound,
            moveInDate: this.vacancy.newTenantFound === 'Yes' ? this.vacancy.moveInDate : null,
            propertyManager: this.vacancy.propertyManager,
            contactNumber: this.vacancy.contactNumber,
            notes: this.vacancy.notes || '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          // Store vacancy data in Firestore
          await addDoc(collection(db, 'vacancies'), vacancyData)
          
          console.log('Vacancy data stored in Firestore')
          this.showSuccessDialog('Vacancy added successfully!', 'Success!', 'Continue', '/vacancies')
          
        } catch (error) {
          console.error('Error creating vacancy:', error)
          this.showErrorDialog('Failed to create vacancy. Please try again.', 'Error', 'OK')
        } finally {
          this.loading = false
        }
      }
    },

    async fetchAgencies() {
      this.agenciesLoading = true
      try {
        const q = query(collection(db, 'users'), where('userType', '==', 'Agency'))
        const querySnapshot = await getDocs(q)
        this.agencies = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('Agencies loaded:', this.agencies.length)
      } catch (error) {
        console.error('Error fetching agencies:', error)
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK')
      } finally {
        this.agenciesLoading = false
      }
    }
  },
  async mounted() {
    await this.fetchAgencies()
  }
}
</script>

<style scoped>
.add-vacancy-page {
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

/* Input styling */
.custom-input {
  margin-bottom: 16px;
}

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
  margin-right: 12px;
}

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black !important;
  color: white !important;
}

.save-btn:hover {
  background-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Responsive design */
@media (max-width: 768px) {
  .add-vacancy-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .back-btn {
    width: 140px;
    height: 40px;
  }
}
</style>
