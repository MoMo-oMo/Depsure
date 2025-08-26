<template>
  <div class="edit-maintenance-page">
    <v-container fluid>

      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            @click="$router.push('/maintenance')"
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
            <h1 class="page-title">Edit Maintenance Entry</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading maintenance entry details...</p>
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
                  <!-- Agency Selection -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.agencyId"
                      label="Select Agency"
                      variant="outlined"
                      class="custom-input"
                      :items="agencies"
                      item-title="agencyName"
                      item-value="id"
                      :rules="agencyRules"
                      required
                      :loading="agenciesLoading"
                    />
                  </v-col>

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

                  <!-- Notice Given (Yes/No) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.noticeGiven"
                      label="Notice Given (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      :rules="noticeGivenRules"
                      required
                    />
                  </v-col>

                  <!-- Vacate Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.vacateDate"
                      label="Vacate Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                      :rules="vacateDateRules"
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

                  <!-- Address -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.address"
                      label="Address"
                      variant="outlined"
                      class="custom-input"
                      :rules="addressRules"
                      required
                    />
                  </v-col>

                  <!-- Maintenance Status -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.status"
                      label="Maintenance Status"
                      variant="outlined"
                      class="custom-input"
                      :items="['Pending', 'In Progress', 'Completed', 'Cancelled']"
                      :rules="statusRules"
                      required
                    />
                  </v-col>

                  <!-- Priority Level -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.priority"
                      label="Priority Level"
                      variant="outlined"
                      class="custom-input"
                      :items="['Low', 'Medium', 'High', 'Urgent']"
                      :rules="priorityRules"
                      required
                    />
                  </v-col>

                  <!-- Estimated Cost -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="entry.estimatedCost"
                      label="Estimated Cost (R)"
                      type="number"
                      variant="outlined"
                      class="custom-input"
                      :rules="estimatedCostRules"
                      prefix="R"
                    />
                  </v-col>

                  <!-- Quote Instructions Upload -->
                  <v-col cols="12" md="6">
                    <v-file-input
                      v-model="entry.quoteFile"
                      label="Upload Quote Instructions"
                      variant="outlined"
                      class="custom-input"
                      accept=".pdf,.doc,.docx"
                      show-size
                      prepend-icon="mdi-upload"
                      :loading="uploading"
                    />
                  </v-col>

                  <!-- Notes -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="entry.notes"
                      label="Additional Notes"
                      variant="outlined"
                      class="custom-input"
                      rows="3"
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
                  class="cancel-btn"
                  @click="$router.push('/maintenance')"
                  :disabled="saving"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  class="submit-btn"
                  :disabled="!valid || saving"
                  :loading="saving"
                  @click="saveEntry"
                >
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db, storage } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default {
  name: "EditMaintenancePage",
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    return { showSuccessDialog, showErrorDialog }
  },
  data() {
    return {
      entry: {
        id: null,
        agencyId: "",
        unitName: "",
        noticeGiven: "No",
        vacateDate: "",
        contactNumber: "",
        address: "",
        status: "Pending",
        priority: "Medium",
        estimatedCost: 0,
        notes: "",
        quoteFile: null
      },
      agencies: [],
      agenciesLoading: false,
      loading: true,
      saving: false,
      uploading: false,
      error: null,
      valid: true,
      // Validation rules
      agencyRules: [v => !!v || "Agency selection is required"],
      unitNameRules: [v => !!v || "Unit Name is required"],
      noticeGivenRules: [v => !!v || "Notice Given is required"],
      vacateDateRules: [v => !!v || "Vacate Date is required"],
      contactNumberRules: [v => !!v || "Contact Number is required"],
      addressRules: [v => !!v || "Address is required"],
      statusRules: [v => !!v || "Status is required"],
      priorityRules: [v => !!v || "Priority is required"],
      estimatedCostRules: [v => v >= 0 || "Estimated cost cannot be negative"]
    };
  },
  async mounted() {
    document.title = "Edit Maintenance Entry - Depsure";
    const entryId = this.$route.params.id;
    if (entryId) {
      await this.fetchAgencies();
      this.loadEntryData(entryId);
    } else {
      this.error = "Entry ID not found";
      this.loading = false;
    }
  },
  methods: {
    async loadEntryData(id) {
      try {
        const docRef = doc(db, 'maintenance', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.entry = {
            id: docSnap.id,
            agencyId: data.agencyId || "",
            unitName: data.unitName || "",
            noticeGiven: data.noticeGiven || "No",
            vacateDate: data.vacateDate || "",
            contactNumber: data.contactNumber || "",
            address: data.address || "",
            status: data.status || "Pending",
            priority: data.priority || "Medium",
            estimatedCost: data.estimatedCost || 0,
            notes: data.notes || "",
            quoteFile: null
          };
          this.loading = false;
        } else {
          this.error = "Maintenance entry not found";
          this.loading = false;
        }
      } catch (error) {
        console.error('Error loading maintenance entry:', error);
        this.error = "Failed to load maintenance entry";
        this.loading = false;
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
    },

    async saveEntry() {
      if (this.$refs.form.validate()) {
        this.saving = true
        try {
          console.log("Saving maintenance entry:", this.entry);
          
          // Get agency name from selected agency
          const selectedAgency = this.agencies.find(agency => agency.id === this.entry.agencyId)
          
          // Prepare maintenance data for Firestore
          const maintenanceData = {
            agencyId: this.entry.agencyId,
            agencyName: selectedAgency ? selectedAgency.agencyName : '',
            unitName: this.entry.unitName,
            noticeGiven: this.entry.noticeGiven,
            vacateDate: this.entry.vacateDate,
            contactNumber: this.entry.contactNumber,
            address: this.entry.address,
            status: this.entry.status,
            priority: this.entry.priority,
            estimatedCost: this.entry.estimatedCost || 0,
            notes: this.entry.notes || "",
            updatedAt: new Date()
          }

          // Upload file if provided
          if (this.entry.quoteFile) {
            this.uploading = true
            try {
              const fileRef = ref(storage, `maintenance-quotes/${Date.now()}_${this.entry.quoteFile.name}`)
              const snapshot = await uploadBytes(fileRef, this.entry.quoteFile)
              const downloadURL = await getDownloadURL(snapshot.ref)
              maintenanceData.quoteFileURL = downloadURL
              maintenanceData.quoteFileName = this.entry.quoteFile.name
              console.log('File uploaded successfully:', downloadURL)
            } catch (uploadError) {
              console.error('Error uploading file:', uploadError)
              this.showErrorDialog('Failed to upload file. Please try again.', 'Upload Error', 'OK')
              return
            } finally {
              this.uploading = false
            }
          }
          
          // Update maintenance data in Firestore
          const docRef = doc(db, 'maintenance', this.entry.id)
          await updateDoc(docRef, maintenanceData)
          
          console.log('Maintenance data updated in Firestore')
          this.showSuccessDialog('Maintenance entry updated successfully!', 'Success!', 'Continue', `/view-maintenance-${this.entry.id}`)
          
        } catch (error) {
          console.error('Error updating maintenance entry:', error)
          this.showErrorDialog('Failed to update maintenance entry. Please try again.', 'Error', 'OK')
        } finally {
          this.saving = false
        }
      }
    }
  }
};
</script>

<style scoped>
.edit-maintenance-page {
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
  text-align: left;
}

/* Form card */
.form-card {
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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

.submit-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .edit-maintenance-page {
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
