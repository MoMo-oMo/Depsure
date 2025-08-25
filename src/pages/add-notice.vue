<template>
  <div class="add-notice-page">
    <v-container fluid>
      
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon
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
            <h1 class="page-title">Add New Notice</h1>
          </div>
          
          <div class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Agency Selection -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="notice.agencyId"
                      :items="agencies"
                      item-title="agencyName"
                      item-value="id"
                      label="Select Agency"
                      variant="outlined"
                      class="custom-input"
                      :rules="agencyRules"
                      :loading="agenciesLoading"
                      required
                    />
                  </v-col>

                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.unitName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                    />
                  </v-col>

                  <!-- Lease Start Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseStartDate"
                      label="Lease Start Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="leaseStartDateRules"
                      required
                    />
                  </v-col>

                  <!-- Notice Given Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.noticeGivenDate"
                      label="Notice Given Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="noticeGivenDateRules"
                      required
                    />
                  </v-col>

                  <!-- Vacate Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.vacateDate"
                      label="Vacate Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="vacateDateRules"
                      required
                    />
                  </v-col>

                  <!-- Maintenance Required -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="notice.maintenanceRequired"
                      label="Maintenance Required After Inspection"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="maintenanceRequiredRules"
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
                  @click="$router.go(-1)"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  @click="saveNotice"
                  :disabled="!valid || loading"
                  :loading="loading"
                  class="save-btn"
                >
                  {{ loading ? 'Adding...' : 'Add Notice' }}
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
  name: 'AddNoticePage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    return { showSuccessDialog, showErrorDialog }
  },
  data() {
    return {
      valid: true,
      loading: false,
      agencies: [],
      agenciesLoading: false,
      notice: {
        agencyId: '',
        unitName: '',
        leaseStartDate: '',
        noticeGivenDate: '',
        vacateDate: '',
        maintenanceRequired: ''
      },
      agencyRules: [v => !!v || 'Agency selection is required'],
      unitNameRules: [
        v => !!v || 'Unit Name is required',
        v => v.length >= 2 || 'Unit Name must be at least 2 characters'
      ],
      leaseStartDateRules: [v => !!v || 'Lease Start Date is required'],
      noticeGivenDateRules: [v => !!v || 'Notice Given Date is required'],
      vacateDateRules: [v => !!v || 'Vacate Date is required'],
      maintenanceRequiredRules: [v => !!v || 'Maintenance selection is required']
    }
  },
  async mounted() {
    document.title = 'Add New Notice - Depsure';
    await this.fetchAgencies();
  },
  methods: {
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        console.log('Fetching agencies...');
        const agenciesQuery = query(collection(db, 'users'), where('userType', '==', 'Agency'));
        const agenciesSnapshot = await getDocs(agenciesQuery);
        
        this.agencies = agenciesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Agencies loaded:', this.agencies);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        this.agenciesLoading = false;
      }
    },
    
    async saveNotice() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          console.log('Saving notice:', this.notice);
          
          // Prepare notice data for Firestore
          const noticeData = {
            ...this.notice,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          console.log('Notice data to save:', noticeData);
          
          // Add notice to Firestore
          const docRef = await addDoc(collection(db, 'notices'), noticeData);
          
          console.log('Notice added successfully with ID:', docRef.id);
          this.showSuccessDialog('Notice added successfully!', 'Success!', 'Continue', '/notices');
          
        } catch (error) {
          console.error('Error adding notice:', error);
          this.showErrorDialog(`Failed to add notice: ${error.message}`, 'Error', 'OK');
        } finally {
          this.loading = false;
        }
      }
    }
  }
}
</script>

<style scoped>
.add-notice-page {
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

/* Form card styling */
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
  background-color: white !important;
  color: #000000 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Buttons */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 120px;
  height: 44px;
}

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .add-notice-page { padding: 10px; }
  .page-title { font-size: 1.1rem; }
  .back-btn { width: 140px; height: 40px; }
  .cancel-btn, .save-btn { width: 100%; margin-bottom: 8px; }
}
</style>
