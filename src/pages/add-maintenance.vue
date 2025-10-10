<template>
  <div class="add-maintenance-page">
    <v-container fluid>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Add Maintenance Entry</h1>
          </div>

          <div class="form-card" elevation="0">
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
                      :disabled="isAgencyUser"
                    />
                  </v-col>

                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      v-model="entry.unitName"
                      label="Select Unit"
                      variant="outlined"
                      class="custom-input"
                      :items="units"
                      item-title="propertyName"
                      item-value="propertyName"
                      :rules="unitNameRules"
                      :loading="unitsLoading"
                      clearable
                      hide-no-data
                      auto-select-first
                      required
                    />
                  </v-col>

                  <!-- Property Type (Read-only) -->
                  <v-col cols="12" md="6" v-if="selectedUnitPropertyType">
                    <v-text-field
                      :model-value="propertyTypeLabel"
                      label="Property Type"
                      variant="outlined"
                      class="custom-input"
                      readonly
                      prepend-inner-icon="mdi-home"
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

                  <!-- Project Budget
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="entry.estimatedCost"
                      label="Project Budget (R)"
                      type="number"
                      variant="outlined"
                      class="custom-input"
                      :rules="estimatedCostRules"
                      prefix="R"
                    />
                  </v-col> -->

                  
                </v-row>
              </v-card-text>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                  color="grey"
                  variant="outlined"
                  class="cancel-btn"
                  @click="goBack"
                  :disabled="loading"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  class="submit-btn"
                  :disabled="!valid || loading"
                  :loading="loading"
                  @click="submitForm"
                >
                  {{ loading ? 'Adding...' : 'Add Entry' }}
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
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAppStore } from '@/stores/app'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: "AddMaintenancePage",
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getLabel } = usePropertyType()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes, getLabel }
  },
  data() {
    return {
      valid: false,
      loading: false,
      uploading: false,
      agenciesLoading: false,
      unitsLoading: false,
      agencies: [],
      units: [],
      entry: {
        agencyId: "",
        unitName: "",
        noticeGiven: "No",
        vacateDate: "",
        contactNumber: "",
        address: "",
        quoteFile: null,
        status: "Pending",
        priority: "Medium",
        estimatedCost: 0
      },
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
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
    },
    selectedUnitPropertyType() {
      if (!this.entry.unitName) return null;
      const selectedUnit = this.units.find(unit => unit.propertyName === this.entry.unitName);
      return selectedUnit?.propertyType || null;
    },
    propertyTypeLabel() {
      return this.selectedUnitPropertyType ? this.getLabel(this.selectedUnitPropertyType) : '';
    }
  },
  methods: {
    async submitForm() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          console.log("Adding maintenance entry:", this.entry);
          
          // Get agency name from selected agency
          const selectedAgency = this.agencies.find(agency => agency.id === this.entry.agencyId)
          console.log('Selected agency ID:', this.entry.agencyId)
          console.log('Selected agency object:', selectedAgency)
          console.log('Available agencies:', this.agencies)
          
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
            createdAt: new Date(),
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
          
          // Store maintenance data in Firestore
          const docRef = await addDoc(collection(db, 'maintenance'), maintenanceData)
          
          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.CREATE,
            {
              unitName: this.entry.unitName,
              agencyId: this.entry.agencyId,
              agencyName: selectedAgency ? selectedAgency.agencyName : '',
              status: this.entry.status,
              priority: this.entry.priority,
              estimatedCost: this.entry.estimatedCost,
              hasQuoteFile: !!this.entry.quoteFile
            },
            this.resourceTypes.MAINTENANCE,
            docRef.id
          )
          
          console.log('Maintenance data stored in Firestore')
          this.showSuccessDialog('Maintenance entry added successfully!', 'Success!', 'Continue', '/maintenance')
          
        } catch (error) {
          console.error('Error creating maintenance entry:', error)
          this.showErrorDialog('Failed to create maintenance entry. Please try again.', 'Error', 'OK')
        } finally {
          this.loading = false
        }
      }
    },

    async fetchAgencies() {
      this.agenciesLoading = true
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          // Agency users and Agency Admin users can only add maintenance entries to their own agency
          let agencyData = null;
          
          if (userType === 'Agency') {
            // For Agency users, use their own document
            const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (agencyDoc.exists()) {
              agencyData = {
                id: agencyDoc.id,
                ...agencyDoc.data()
              };
            }
          } else if (userType === 'Admin' && currentUser.adminScope === 'agency') {
            // For Agency Admin users, fetch their managed agency
            if (currentUser.managedAgencyId) {
              const agencyDoc = await getDoc(doc(db, 'users', currentUser.managedAgencyId));
              if (agencyDoc.exists()) {
                agencyData = {
                  id: agencyDoc.id,
                  ...agencyDoc.data()
                };
              }
            }
          }
          
          if (agencyData) {
            this.agencies = [agencyData];
            // Pre-select the agency for agency users and agency admins
            this.entry.agencyId = agencyData.id;
          } else {
            this.agencies = [];
          }
          console.log('Agency user - own agency loaded:', this.agencies);
        } else {
          // Super Admin and Admin users can see all agencies
          const q = query(collection(db, 'users'), where('userType', '==', 'Agency'))
          const querySnapshot = await getDocs(q)
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          console.log('All agencies loaded:', this.agencies.length)
          console.log('Agencies data:', this.agencies)
          // Check if agencies have the correct field names
          if (this.agencies.length > 0) {
            console.log('First agency structure:', this.agencies[0])
            console.log('First agency agencyName:', this.agencies[0].agencyName)
          } else {
            console.log('No agencies found in database')
            // Avoid auto-creating test agencies from this page
          }
        }
      } catch (error) {
        console.error('Error fetching agencies:', error)
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK')
      } finally {
        this.agenciesLoading = false
      }
    },


    async fetchUnits(agencyId = null) {
      this.unitsLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        let unitsQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see units from their own agency
          unitsQuery = query(
            collection(db, 'units'),
            where('agencyId', '==', currentUser.uid)
          );
        } else if (agencyId) {
          // Super Admin/Admin users query units for specific agency
          unitsQuery = query(
            collection(db, 'units'),
            where('agencyId', '==', agencyId)
          );
        } else {
          // Super Admin/Admin users query all units when no agency selected
          unitsQuery = collection(db, 'units');
        }
        
        const querySnapshot = await getDocs(unitsQuery);
        this.units = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Units fetched:', this.units);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
      } catch (error) {
        console.error('Error fetching units:', error);
        this.showErrorDialog('Failed to load units. Please try again.', 'Error', 'OK');
      } finally {
        this.unitsLoading = false;
      }
    },

    goBack() {
      this.$router.push("/maintenance");
    }
  },
  async mounted() {
    // Fetch agencies first
    await this.fetchAgencies()
    
    // For agency users, fetch their units automatically
    if (this.isAgencyUser) {
      await this.fetchUnits();
    }
  },
  watch: {
    'entry.agencyId': {
      handler(newAgencyId) {
        if (this.isAgencyUser) {
          // Agency users automatically get their own units
          this.fetchUnits();
        } else if (newAgencyId) {
          // Super Admin/Admin users get units for selected agency
          this.fetchUnits(newAgencyId);
        } else {
          this.units = [];
          this.entry.unitName = '';
        }
      },
      immediate: false
    }
  }
};
</script>

<style scoped>
.add-maintenance-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f6f7fa;
}

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

.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  padding: 10px !important;
}

.cancel-btn {
  width: 120px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  border: 2px solid #666;
  color: #666;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #333;
  color: #333;
  transform: translateY(-1px);
}

.submit-btn {
  width: 160px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333 !important;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
