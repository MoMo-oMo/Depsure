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
                      label="Upload Quote Instructions (PDF only)"
                      variant="outlined"
                      class="custom-input"
                      accept=".pdf"
                      show-size
                      prepend-icon="mdi-file-pdf-box"
                      :loading="uploading"
                      :rules="quoteFileRules"
                      hint="Only PDF files are allowed. Maximum size: 50MB"
                      persistent-hint
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
                  v-if="entry.quoteFileName && entry.quoteFileURL"
                  color="black"
                  variant="elevated"
                  class="view-quote-btn"
                  @click="showQuoteDialog = true"
                >
                  View Quote Instructions
                </v-btn>
                <v-btn
                  v-if="entry.quoteFileName && entry.quoteFileURL"
                  color="error"
                  variant="outlined"
                  class="delete-quote-btn"
                  @click="deleteQuoteFile"
                  :disabled="saving"
                >
                  Delete Quote
                </v-btn>
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

    <!-- Quote Instructions Dialog -->
    <div v-if="showQuoteDialog" class="quote-overlay" @click.self="showQuoteDialog = false">
      <div class="quote-dialog">
        <!-- colored card behind -->
        <div class="quote-dialog-bg"></div>
        <!-- main white card -->
        <div class="quote-dialog-inner">
          <button class="quote-close" @click="showQuoteDialog = false">&times;</button>

          <div class="quote-icon">
            <v-icon>mdi-file-pdf-box</v-icon>
          </div>

          <h2 class="quote-title">Quote Instructions</h2>
          <p class="quote-subtitle">{{ entry.quoteFileName }}</p>
          
          <div v-if="entry.quoteFileURL" class="pdf-container">
            <div class="pdf-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
            <div class="pdf-wrapper" :style="{ transform: `scale(${zoomLevel})` }">
              <iframe
                :src="entry.quoteFileURL"
                width="100%"
                height="400"
                frameborder="0"
                class="pdf-iframe"
              />
            </div>
          </div>
          <div v-else class="no-pdf-message">
            <v-icon color="error" size="48">mdi-file-pdf-box</v-icon>
            <p>PDF file not available</p>
          </div>

          <div class="quote-actions">
            <button class="quote-button secondary" @click="showQuoteDialog = false">
              Close
            </button>
            <button 
              v-if="entry.quoteFileURL"
              class="quote-button primary" 
              @click="openInNewTab"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db, storage } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuditTrail } from '@/composables/useAuditTrail'

export default {
  name: "EditMaintenancePage",
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes }
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
        quoteFile: null,
        quoteFileName: "",
        quoteFileURL: ""
      },
      agencies: [],
      agenciesLoading: false,
      loading: true,
      saving: false,
      uploading: false,
      error: null,
      valid: true,
      showQuoteDialog: false,
      zoomLevel: 1,
      // Validation rules
      agencyRules: [v => !!v || "Agency selection is required"],
      unitNameRules: [v => !!v || "Unit Name is required"],
      noticeGivenRules: [v => !!v || "Notice Given is required"],
      vacateDateRules: [v => !!v || "Vacate Date is required"],
      contactNumberRules: [v => !!v || "Contact Number is required"],
      addressRules: [v => !!v || "Address is required"],
      statusRules: [v => !!v || "Status is required"],
      priorityRules: [v => !!v || "Priority is required"],
      estimatedCostRules: [v => v >= 0 || "Project budget cannot be negative"],
      quoteFileRules: [
        v => !v || v.size <= 50 * 1024 * 1024 || "File size must be less than 50MB",
        v => !v || v.type === 'application/pdf' || "Only PDF files are allowed"
      ]
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
            quoteFile: null,
            quoteFileName: data.quoteFileName || "",
            quoteFileURL: data.quoteFileURL || ""
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
          } else {
            // Keep existing file data if no new file is uploaded
            maintenanceData.quoteFileURL = this.entry.quoteFileURL
            maintenanceData.quoteFileName = this.entry.quoteFileName
          }
          
          // Log the update action before saving
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              maintenanceId: this.entry.id,
              maintenanceType: maintenanceData.maintenanceType,
              updatedFields: Object.keys(maintenanceData),
              updatedData: maintenanceData
            },
            this.resourceTypes.MAINTENANCE,
            this.entry.id
          )
          
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
    },
    
    openInNewTab() {
      if (this.entry.quoteFileURL) {
        window.open(this.entry.quoteFileURL, '_blank');
      }
    },

    async deleteQuoteFile() {
      if (!this.entry.quoteFileName || !this.entry.quoteFileURL) {
        return;
      }

      // Store the file details before deletion for audit logging
      const fileNameToDelete = this.entry.quoteFileName;
      const fileURLToDelete = this.entry.quoteFileURL;

      // Show confirmation dialog
      const confirmed = await this.showConfirmDialog(
        `Are you sure you want to delete "${fileNameToDelete}"?`,
        'Delete Quote File',
        'This action cannot be undone.'
      );

      if (!confirmed) {
        return;
      }

      try {
        // Delete from Firebase Storage
        console.log('Attempting to delete file URL:', fileURLToDelete);
        
        // Extract the file path from the URL
        let filePath;
        
        // Try to extract from Firebase Storage URL
        if (fileURLToDelete.includes('firebasestorage.googleapis.com')) {
          // Firebase Storage URL format
          const urlParts = fileURLToDelete.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const cleanFileName = fileName.split('?')[0];
          filePath = `maintenance-quotes/${cleanFileName}`;
        } else {
          // Fallback: try to extract filename from any URL
          const urlParts = fileURLToDelete.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const cleanFileName = fileName.split('?')[0];
          filePath = `maintenance-quotes/${cleanFileName}`;
        }
        
        console.log('Extracted file path:', filePath);
        
                 // Try to delete the file from Firebase Storage
         try {
           const fileRef = ref(storage, filePath);
           await deleteObject(fileRef);
           console.log('Quote file deleted from storage:', filePath);
         } catch (deleteError) {
           console.log('Failed to delete from storage, but continuing with local cleanup:', deleteError);
           // Continue with local cleanup even if storage delete fails
         }

         // Always clear the file data from the entry and update Firestore
         this.entry.quoteFileName = '';
         this.entry.quoteFileURL = '';

         // Always update the Firestore document to remove file references
         const docRef = doc(db, 'maintenance', this.entry.id);
         await updateDoc(docRef, {
           quoteFileName: '',
           quoteFileURL: '',
           updatedAt: new Date()
         });

         console.log('Firestore document updated successfully');

        // Log the delete action with the original file details
        await this.logAuditEvent(
          this.auditActions.DELETE,
          {
            maintenanceId: this.entry.id,
            fileName: fileNameToDelete,
            fileURL: fileURLToDelete
          },
          this.resourceTypes.MAINTENANCE,
          this.entry.id
        );

        // Reload the entry data to ensure UI is updated
        await this.loadEntryData(this.entry.id);

        this.showSuccessDialog(
          'Quote file has been deleted successfully.',
          'File Deleted',
          'OK'
        );

             } catch (error) {
         console.error('Error deleting quote file:', error);
         console.error('Error details:', {
           code: error.code,
           message: error.message,
           stack: error.stack
         });
         // No error dialog - just log the error and continue
       }
    },

    async showConfirmDialog(message, title, subtitle = '') {
      return new Promise((resolve) => {
        // Create a custom confirmation dialog with exact NotificationDialog styling
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
        `;
        
        dialog.innerHTML = `
          <div style="
            position: relative;
            width: 500px;
            max-width: 90vw;
            min-height: 200px;
          ">
            <!-- colored card behind -->
            <div style="
              position: absolute;
              top: 12px;
              left: 12px;
              width: 96%;
              height: 100%;
              border-radius: 16px;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
              background-color: #e53e3e;
            "></div>
            <!-- main white card -->
            <div style="
              position: relative;
              background: #ffffff;
              border-radius: 16px;
              padding: 32px;
              text-align: center;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
            ">
              <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = false;" style="
                position: absolute;
                top: 16px;
                right: 16px;
                background: transparent;
                border: none;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
                color: #666;
              ">&times;</button>

              <div style="
                position: relative;
                margin: 0 auto 24px auto;
                margin-top: -16%;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #e53e3e;
                animation: fadeInCircle 0.3s ease-out forwards;
              ">
                <i class="mdi mdi-delete" style="
                  font-size: 40px;
                  color: #ffffff;
                "></i>
              </div>
              <style>
                @keyframes fadeInCircle {
                  from {
                    opacity: 0;
                    transform: scale(0.7);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                @keyframes pulse {
                  0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                  }
                  50% {
                    transform: translate(-50%, -50%) scale(1.2);
                  }
                }
                .confirm-dialog-overlay div[style*="background-color: #e53e3e"]::before {
                  content: '';
                  position: absolute;
                  width: 100px;
                  height: 100px;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  border-radius: 50%;
                  opacity: 0.2;
                  animation: pulse 2s ease-in-out infinite;
                  background-color: #e53e3e;
                }
              </style>

              <h2 style="
                font-size: 2em;
                margin: 0 0 12px 0;
                color: #333;
              ">${title}</h2>
              <p style="
                font-size: 1.2em;
                margin: 0 0 32px 0;
                color: #666;
              ">${message}</p>
              
              <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = false;" style="
                  border: none;
                  border-radius: 8px;
                  color: #ffffff;
                  font-size: 1.1em;
                  padding: 12px 24px;
                  cursor: pointer;
                  background-color: #666;
                  transition: opacity 0.3s ease;
                ">Cancel</button>
                <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = true;" style="
                  border: none;
                  border-radius: 8px;
                  color: #ffffff;
                  font-size: 1.1em;
                  padding: 12px 24px;
                  cursor: pointer;
                  background-color: #e53e3e;
                  transition: opacity 0.3s ease;
                ">Delete</button>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Handle the result
        const checkResult = () => {
          if (typeof window.confirmResult !== 'undefined') {
            const result = window.confirmResult;
            delete window.confirmResult;
            resolve(result);
          } else {
            setTimeout(checkResult, 100);
          }
        };
        checkResult();
      });
    },
    
    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel += 0.1;
      }
    },
    
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel -= 0.1;
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

/* View Quote Button */
.view-quote-btn {
  width: 240px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  margin-right: 12px;
}

.view-quote-btn:hover {
  background-color: #333 !important;
  transform: translateY(-1px);
}

/* Quote Dialog - NotificationDialog Style */
.quote-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.quote-dialog {
  position: relative;
  width: 600px;
  max-width: 90vw;
  min-height: 500px;
}

.quote-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  background-color: #000000;
}

.quote-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.quote-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  color: #666;
}

.quote-close:hover {
  color: #333;
}

.quote-icon {
  position: relative;
  margin: 0 auto 24px auto;
  margin-top: -16%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCircle 0.3s ease-out forwards;
  background-color: #000000;
}

.quote-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.quote-icon::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
  background-color: #000000;
}

@keyframes fadeInCircle {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.quote-title {
  font-size: 2em;
  margin: 0 0 8px 0;
  color: #333;
}

.quote-subtitle {
  font-size: 1.1em;
  margin: 0 0 24px 0;
  color: #666;
  word-break: break-all;
}

.pdf-container {
  width: 100%;
  margin: 0 0 24px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.zoom-btn {
  background-color: #000000;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.zoom-btn:hover {
  background-color: #333;
}

.zoom-level {
  font-weight: 600;
  color: #333;
  min-width: 50px;
  text-align: center;
}

.pdf-wrapper {
  transform-origin: top center;
  transition: transform 0.3s ease;
  overflow: auto;
  max-height: 400px;
}

.pdf-iframe {
  border: none;
  width: 100%;
  height: 400px;
  display: block;
}

.no-pdf-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
  margin: 0 0 24px 0;
}

.no-pdf-message p {
  margin-top: 16px;
  font-size: 1.1rem;
}

.quote-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.quote-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.quote-button.secondary {
  background-color: #666;
}

.quote-button.primary {
  background-color: #000000;
}

.quote-button:hover {
  opacity: 0.9;
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

/* Confirmation Dialog Styles */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.confirm-dialog-header {
  background: #dc3545;
  color: white;
  padding: 20px 24px;
  text-align: center;
}

.confirm-dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.confirm-dialog-subtitle {
  margin: 8px 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.confirm-dialog-content {
  padding: 24px;
  text-align: center;
}

.confirm-dialog-content p {
  margin: 0;
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
}

.confirm-dialog-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
  justify-content: center;
}

.confirm-btn {
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 100px;
}

.confirm-btn.cancel {
  background-color: #6c757d;
  color: white;
}

.confirm-btn.cancel:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.confirm-btn.delete {
  background-color: #dc3545;
  color: white;
}

.confirm-btn.delete:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

/* Responsive adjustments for confirmation dialog */
@media (max-width: 768px) {
  .confirm-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .confirm-dialog-actions {
    flex-direction: column;
  }
  
  .confirm-btn {
    width: 100%;
  }
}
</style>
