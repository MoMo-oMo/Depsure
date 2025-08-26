<template>
  <div class="edit-inspection-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn @click="$router.go(-1)" class="back-btn">Back</v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Edit Inspection Entry</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading inspection entry details...</p>
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
                      v-model="entry.unitName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                      :rules="unitNameRules"
                      required
                    />
                  </v-col>

                  <!-- Inspection Required -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.inspectionRequired"
                      label="Inspection Required (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes','No']"
                      :rules="inspectionRequiredRules"
                      required
                    />
                  </v-col>

                  <!-- Contact Person -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactPerson"
                      label="Contact Person"
                      variant="outlined"
                      class="custom-input"
                      :rules="contactPersonRules"
                      required
                    />
                  </v-col>

                  <!-- Contact Number -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactNumber"
                      label="Contact Number"
                      variant="outlined"
                      class="custom-input"
                      :rules="contactNumberRules"
                      required
                    />
                  </v-col>

                  <!-- Appointment Made -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.appointmentMade"
                      label="Appointment Made (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes','No']"
                      :rules="appointmentMadeRules"
                      required
                    />
                  </v-col>

                  <!-- Inspection Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.inspectionDate"
                      label="Inspection Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="inspectionDateRules"
                      required
                    />
                  </v-col>

                  <!-- Quotes Needed -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.quotesNeeded"
                      label="Quotes Needed"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes','No']"
                      :rules="quotesNeededRules"
                      required
                    />
                  </v-col>

                  <!-- Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.status"
                      label="Status"
                      variant="outlined"
                      class="custom-input"
                      :items="['Pending', 'In Progress', 'Completed', 'Cancelled']"
                      :rules="statusRules"
                      required
                    />
                  </v-col>

                  <!-- Priority -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.priority"
                      label="Priority"
                      variant="outlined"
                      class="custom-input"
                      :items="['Low', 'Medium', 'High', 'Urgent']"
                      :rules="priorityRules"
                      required
                    />
                  </v-col>

                  <!-- Notes -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="entry.notes"
                      label="Notes"
                      variant="outlined"
                      rows="3"
                      class="custom-input"
                    />
                  </v-col>
                </v-row>
              </v-card-text>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn color="grey" variant="outlined" @click="$router.go(-1)" class="cancel-btn">
                  Cancel
                </v-btn>
                <v-btn color="black" variant="elevated" @click="saveEntry" :disabled="!valid || saving" :loading="saving" class="save-btn">
                  {{ saving ? 'Saving...' : 'Save Changes' }}
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
import { db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: "EditInspectionPage",
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    return { showSuccessDialog, showErrorDialog }
  },
  data() {
    return {
      entry: {
        id: null,
        unitName: "",
        inspectionRequired: "No",
        contactPerson: "",
        contactNumber: "",
        appointmentMade: "No",
        inspectionDate: "",
        quotesNeeded: "No",
        status: "Pending",
        priority: "Medium",
        notes: "",
        agencyId: "",
        agencyName: ""
      },
      loading: true,
      saving: false,
      error: null,
      valid: true,
      unitNameRules: [v => !!v || "Unit Name is required"],
      inspectionRequiredRules: [v => !!v || "Inspection Required is required"],
      contactPersonRules: [v => !!v || "Contact Person is required"],
      contactNumberRules: [v => !!v || "Contact Number is required"],
      appointmentMadeRules: [v => !!v || "Appointment Made is required"],
      inspectionDateRules: [v => !!v || "Inspection Date is required"],
      quotesNeededRules: [v => !!v || "Quotes Needed is required"],
      statusRules: [v => !!v || "Status is required"],
      priorityRules: [v => !!v || "Priority is required"]
    };
  },
  mounted() {
    document.title = "Edit Inspection Entry - Depsure";
    const entryId = this.$route.params.id;
    if (entryId) this.loadEntryData(entryId);
    else { this.error = "Entry ID not found"; this.loading = false; }
  },
  methods: {
    async loadEntryData(id) {
      try {
        console.log('Loading inspection entry with ID:', id);
        const docRef = doc(db, 'inspections', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          this.entry = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate()
          };
          console.log('Inspection entry loaded:', this.entry);
        } else {
          this.error = "Inspection entry not found";
          console.log('Inspection entry not found with ID:', id);
        }
      } catch (error) {
        console.error('Error loading inspection entry:', error);
        this.error = "Failed to load inspection entry";
      } finally {
        this.loading = false;
      }
    },
    
    async saveEntry() {
      if (this.$refs.form.validate()) {
        this.saving = true;
        try {
          console.log("Saving inspection entry:", this.entry);
          
          // Prepare update data
          const updateData = {
            unitName: this.entry.unitName,
            inspectionRequired: this.entry.inspectionRequired,
            contactPerson: this.entry.contactPerson,
            contactNumber: this.entry.contactNumber,
            appointmentMade: this.entry.appointmentMade,
            inspectionDate: this.entry.inspectionDate,
            quotesNeeded: this.entry.quotesNeeded,
            status: this.entry.status,
            priority: this.entry.priority,
            notes: this.entry.notes || "",
            updatedAt: new Date()
          };
          
          // Update the document
          const docRef = doc(db, 'inspections', this.entry.id);
          await updateDoc(docRef, updateData);
          
          console.log('Inspection entry updated successfully');
          this.showSuccessDialog("Inspection entry saved successfully!", "Success!", "Continue", "/inspections");
        } catch (error) {
          console.error('Error updating inspection entry:', error);
          this.showErrorDialog('Failed to save inspection entry. Please try again.', 'Error', 'OK');
        } finally {
          this.saving = false;
        }
      }
    }
  }
};
</script>

<style scoped>
.edit-inspection-page {
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
.back-btn:hover { background-color: #333 !important; border-color: #333 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }

/* Title section */
.title-section { background: black; color: white; padding: 0.75rem; border-radius: 12px 12px 0 0; margin-bottom: 0; }
.page-title { font-size: 1.25rem; font-weight: 600; color: white; margin: 0; text-align: left; }

/* Form card */
.form-card { background: white; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }

/* Input styling */
.custom-input .v-field { border-radius: 8px; }
.custom-input :deep(.v-field__input) { background-color: white !important; color: #000000 !important; }
.custom-input :deep(.v-field__outline) { border-color: #e9ecef !important; }

/* Buttons */
.cancel-btn { font-weight: 500; text-transform: none; border-radius: 8px; width: 120px; height: 44px; }
.save-btn { font-weight: 500; text-transform: none; border-radius: 8px; width: 160px; height: 44px; background-color: black !important; color: white !important; }
.save-btn:hover:not(:disabled) { background-color: #333 !important; }

/* Responsive */
@media (max-width: 768px) {
  .edit-inspection-page { padding: 10px; }
  .page-title { font-size: 1.1rem; }
  .back-btn { width: 140px; height: 40px; }
}
</style>
