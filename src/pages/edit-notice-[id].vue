<template>
  <div class="edit-notice-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            @click="$router.push('/notices')"
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
            <h1 class="page-title">Edit Notice</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading notice details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Form -->
          <div v-else class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
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
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="leaseStartDateRules"
                      required
                    />
                  </v-col>

                  <!-- Lease End Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseEndDate"
                      label="Lease End Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="leaseEndDateRules"
                      required
                    />
                  </v-col>

                  <!-- Maintenance Amount -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="notice.maintenanceAmount"
                      label="Maintenance Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      prefix="R"
                      variant="outlined"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Month's Missed Rent -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="notice.monthsMissedRent"
                      label="Month's Missed Rent"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      min="0"
                      step="1"
                      hint="Enter number of months rent was missed"
                      persistent-hint
                    />
                  </v-col>

                  <!-- Paid Out Amount -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="notice.paidOutAmount"
                      label="Paid Out Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      prefix="R"
                      variant="outlined"
                      class="custom-input"
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
                  @click="$router.push('/notices')"
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
import { useNoticeToVacancyTransition } from '@/composables/useNoticeToVacancyTransition'

export default {
  name: 'EditNoticePage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { autoTransitionToVacancy } = useNoticeToVacancyTransition()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes, autoTransitionToVacancy }
  },
  data() {
    return {
      notice: {
        id: '',
        unitName: '',
        leaseStartDate: '',
        leaseEndDate: '',
        monthsMissedRent: 0,
        maintenanceAmount: 0,
        paidOutAmount: 0
      },
      loading: true,
      error: null,
      valid: true,
      // Validation rules
      unitNameRules: [
        v => !!v || "Unit Name is required",
        v => v.length >= 5 || "Unit Name must be at least 5 characters"
      ],
      leaseStartDateRules: [
        v => !!v || "Lease Start Date is required"
      ],
      leaseEndDateRules: [
        v => !!v || "Lease End Date is required"
      ]
    };
  },
  async mounted() {
    document.title = "Edit Notice - Depsure";
    const noticeId = this.$route.params.id;
    if (noticeId) {
      await this.loadNoticeData(noticeId);
    } else {
      this.error = "Notice ID not found";
      this.loading = false;
    }
  },
  methods: {
    async loadNoticeData(noticeId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Loading notice data for ID:', noticeId);
        
        // Fetch notice from Firestore
        const noticeDoc = await getDoc(doc(db, 'notices', noticeId));
        
        if (noticeDoc.exists()) {
          const noticeData = noticeDoc.data();
          this.notice = {
            id: noticeDoc.id,
            ...noticeData
          };
          this.notice.maintenanceAmount = Number(
            noticeData?.maintenanceAmount ?? 0
          ) || 0;
          this.notice.paidOutAmount = Number(
            noticeData?.paidOutAmount ?? 0
          ) || 0;
          console.log('Notice loaded successfully:', this.notice);
        } else {
          this.error = 'Notice not found';
          console.log('Notice not found in Firestore');
        }
      } catch (error) {
        console.error('Error loading notice:', error);
        this.error = `Failed to load notice details: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
    
    async saveNotice() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          console.log('Saving notice:', this.notice);
          
          // Validate that we have an ID
          if (!this.notice.id) {
            throw new Error('Notice ID is missing');
          }
          
          // Prepare notice data for Firestore (remove id field)
          const { id, ...noticeData } = this.notice;
          
          // Set vacateDate to match leaseEndDate (they are the same thing)
          noticeData.vacateDate = this.notice.leaseEndDate;
          
          // Add updated timestamp
          noticeData.updatedAt = new Date();
        noticeData.maintenanceAmount =
          Number(this.notice.maintenanceAmount) || 0;
        noticeData.paidOutAmount =
          Number(this.notice.paidOutAmount) || 0;
          
          console.log('Notice data to save:', noticeData);
          
          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              noticeId: id,
              noticeTitle: noticeData.noticeTitle,
              updatedFields: Object.keys(noticeData),
              updatedData: noticeData
            },
            this.resourceTypes.NOTICE,
            id
          )
          
          // Update notice in Firestore
          await updateDoc(doc(db, 'notices', id), noticeData);
          
          console.log('Notice updated successfully');
          
          // AUTO-TRANSITION: Check if notice is complete and move to vacancies
          const transitioned = await this.autoTransitionToVacancy(id);
          
          if (transitioned) {
            // Notice was moved to vacancies
            this.showSuccessDialog(
              'Notice completed and moved to Vacancies!',
              'Success!',
              'Continue',
              '/vacancies'
            );
          } else {
            // Notice saved but not complete yet
            this.showSuccessDialog(
              'Notice saved successfully!',
              'Success!',
              'Continue',
              `/view-notice-${id}`
            );
          }
          
        } catch (error) {
          console.error('Error saving notice:', error);
          this.showErrorDialog(`Failed to save notice: ${error.message}`, 'Error', 'OK');
        } finally {
          this.loading = false;
        }
      } else {
        console.log('Form validation failed');
        this.showErrorDialog('Please fix the form errors before saving.', 'Validation Error', 'OK');
      }
    }
  }
};
</script>

<style scoped>
.edit-notice-page {
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
  text-align: center;
  text-transform: uppercase;
}

/* Form card */
.form-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Input styling */
.custom-input .v-field {
  border-radius: 8px;
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
  .edit-notice-page {
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
