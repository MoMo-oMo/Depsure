<template>
  <div class="add-inspection-page">
    <v-container fluid>
      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Inspection Entry</h1>
          </div>

          <div class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-card-text>
                <v-row>
                  <!-- Agency Selection -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.agencyId"
                      class="custom-input"
                      item-title="agencyName"
                      item-value="id"
                      :items="agencies"
                      label="Select Agency"
                      :loading="agenciesLoading"
                      :disabled="isAgencyUser"
                      required
                      :rules="agencyRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      v-model="entry.unitName"
                      class="custom-input"
                      item-title="propertyName"
                      item-value="propertyName"
                      :items="units"
                      clearable
                      label="Select Unit"
                      hide-no-data
                      :loading="unitsLoading"
                      auto-select-first
                      :rules="unitNameRules"
                      required
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Property Type (Read-only) -->
                  <v-col v-if="selectedUnitPropertyType" cols="12" md="6">
                    <v-text-field
                      class="custom-input"
                      label="Property Type"
                      :model-value="propertyTypeLabel"
                      prepend-inner-icon="mdi-home"
                      readonly
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Contact Person -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactPerson"
                      class="custom-input"
                      label="Contact Person"
                      required
                      :rules="contactPersonRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Contact Number -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.contactNumber"
                      class="custom-input"
                      label="Contact Number"
                      required
                      :rules="contactNumberRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Appointment Made (Yes/No) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.appointmentMade"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      label="Appointment Made (Yes/No)"
                      required
                      :rules="appointmentMadeRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Inspection Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.inspectionDate"
                      class="custom-input"
                      :disabled="!appointmentMadeIsYes"
                      label="Inspection Date"
                      :placeholder="
                        appointmentMadeIsYes ? '' : 'Not applicable'
                      "
                      :rules="appointmentMadeIsYes ? requiredRule : []"
                      type="date"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Inspection Time (new) -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entry.inspectionTime"
                      class="custom-input"
                      :disabled="!appointmentMadeIsYes"
                      label="Inspection Time"
                      :placeholder="
                        appointmentMadeIsYes ? '' : 'Not applicable'
                      "
                      :rules="appointmentMadeIsYes ? requiredRule : []"
                      type="time"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Quotes Needed (Yes/No) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.quotesNeeded"
                      class="custom-input"
                      :items="['Yes', 'No']"
                      label="Quotes Needed (Yes/No)"
                      required
                      :rules="quotesNeededRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Inspection Status (Admin editable) -->
                  <v-col cols="12" md="6">
                    <template v-if="userType === 'Admin'">
                      <v-select
                        v-model="entry.status"
                        class="custom-input"
                        :items="['Active', 'Pending', 'Completed']"
                        label="Inspection Status"
                        required
                        :rules="statusRules"
                        variant="outlined"
                      />
                    </template>
                    <template v-else>
                      <v-text-field
                        class="custom-input"
                        label="Inspection Status"
                        :model-value="entry.status"
                        readonly
                        variant="outlined"
                      />
                    </template>
                  </v-col>

                  <!-- Priority Level -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="entry.priority"
                      class="custom-input"
                      :items="['Low', 'Medium', 'High', 'Urgent']"
                      label="Priority Level"
                      required
                      :rules="priorityRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Document Upload -->
                  <v-col cols="12" md="6">
                    <v-file-input
                      v-model="entry.inspectionFile"
                      accept=".pdf"
                      class="custom-input"
                      label="Upload Inspection Document (PDF only)"
                      :loading="uploading"
                      hint="Only PDF files are allowed. Maximum size: 50MB"
                      prepend-icon="mdi-file-pdf-box"
                      persistent-hint
                      :rules="inspectionFileRules"
                      show-size
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-card-text>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                  class="cancel-btn"
                  color="grey"
                  :disabled="loading"
                  variant="outlined"
                  @click="goBack"
                >
                  Cancel
                </v-btn>
                <v-btn
                  class="submit-btn"
                  color="black"
                  :disabled="!valid || loading"
                  :loading="loading"
                  variant="elevated"
                  @click="submitForm"
                >
                  {{ loading ? "Adding..." : "Upload Request" }}
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
  import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
  } from 'firebase/firestore'
  import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { usePropertyType } from '@/composables/usePropertyType'
  import { db, storage } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'AddInspectionPage',
    setup () {
      const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
      const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
      const { getLabel } = usePropertyType()
      return {
        showSuccessDialog,
        showErrorDialog,
        logAuditEvent,
        auditActions,
        resourceTypes,
        getLabel,
      }
    },
    data () {
      return {
        valid: false,
        loading: false,
        uploading: false,
        agenciesLoading: false,
        unitsLoading: false,
        agencies: [],
        units: [],
        entry: {
          agencyId: '',
          unitName: '',
          contactPerson: '',
          contactNumber: '',
          appointmentMade: 'No',
          inspectionDate: '',
          inspectionTime: '',
          quotesNeeded: 'No',
          status: 'Pending',
          priority: 'Medium',
          inspectionFile: null,
          inspectionFileName: '',
          inspectionFileURL: '',
        },
        agencyRules: [v => !!v || 'Agency selection is required'],
        unitNameRules: [v => !!v || 'Unit Name is required'],
        contactPersonRules: [v => !!v || 'Contact Person is required'],
        contactNumberRules: [v => !!v || 'Contact Number is required'],
        appointmentMadeRules: [v => !!v || 'Appointment Made is required'],
        inspectionDateRules: [],
        requiredRule: [v => !!v || 'This field is required'],
        quotesNeededRules: [v => !!v || 'Quotes Needed is required'],
        statusRules: [v => !!v || 'Status is required'],
        priorityRules: [v => !!v || 'Priority is required'],
        inspectionFileRules: [
          v =>
            !v
            || v.size <= 50 * 1024 * 1024
            || 'File size must be less than 50MB',
          v =>
            !v || v.type === 'application/pdf' || 'Only PDF files are allowed',
        ],
      }
    },
    computed: {
      isAgencyUser () {
        const appStore = useAppStore()
        const user = appStore.currentUser
        return (
          user?.userType === 'Agency'
          || (user?.userType === 'Admin' && user?.adminScope === 'agency')
        )
      },
      userType () {
        const appStore = useAppStore()
        return appStore.currentUser?.userType
      },
      selectedUnitPropertyType () {
        if (!this.entry.unitName) return null
        const selectedUnit = this.units.find(
          unit => unit.propertyName === this.entry.unitName,
        )
        return selectedUnit?.propertyType || null
      },
      propertyTypeLabel () {
        return this.selectedUnitPropertyType
          ? this.getLabel(this.selectedUnitPropertyType)
          : ''
      },
      appointmentMadeIsYes () {
        return String(this.entry.appointmentMade).toLowerCase() === 'yes'
      },
    },
    watch: {
      'entry.agencyId': {
        handler (newAgencyId) {
          if (newAgencyId) {
            this.fetchUnits(newAgencyId)
          } else {
            this.units = []
            this.entry.unitName = ''
          }
        },
        immediate: false,
      },
    },
    async mounted () {
      await this.fetchAgencies()
    },
    methods: {
      async submitForm () {
        if (this.$refs.form.validate()) {
          this.loading = true
          try {
            console.log('Adding inspection entry:', this.entry)

            // Get agency name from selected agency
            const selectedAgency = this.agencies.find(
              agency => agency.id === this.entry.agencyId,
            )
            console.log('Selected agency ID:', this.entry.agencyId)
            console.log('Selected agency object:', selectedAgency)
            console.log('Available agencies:', this.agencies)

            // Prepare inspection data for Firestore
            const inspectionData = {
              agencyId: this.entry.agencyId,
              agencyName: selectedAgency ? selectedAgency.agencyName : '',
              unitName: this.entry.unitName,
              inspectionRequired: 'Yes',
              contactPerson: this.entry.contactPerson,
              contactNumber: this.entry.contactNumber,
              appointmentMade: this.entry.appointmentMade,
              inspectionDate: this.entry.inspectionDate,
              inspectionTime: this.entry.inspectionTime || '',
              quotesNeeded: this.entry.quotesNeeded,
              status: this.entry.status,
              priority: this.entry.priority,
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            // Upload file if provided
            if (this.entry.inspectionFile) {
              this.uploading = true
              try {
                const fileRef = ref(
                  storage,
                  `inspection-documents/${Date.now()}_${
                    this.entry.inspectionFile.name
                  }`,
                )
                const snapshot = await uploadBytes(
                  fileRef,
                  this.entry.inspectionFile,
                )
                const downloadURL = await getDownloadURL(snapshot.ref)
                inspectionData.inspectionFileURL = downloadURL
                inspectionData.inspectionFileName
                  = this.entry.inspectionFile.name
                console.log('File uploaded successfully:', downloadURL)
              } catch (uploadError) {
                console.error('Error uploading file:', uploadError)
                this.showErrorDialog(
                  'Failed to upload file. Please try again.',
                  'Upload Error',
                  'OK',
                )
                return
              } finally {
                this.uploading = false
              }
            }

            // Store inspection data in Firestore
            const docRef = await addDoc(
              collection(db, 'inspections'),
              inspectionData,
            )

            // Log the audit event
            await this.logAuditEvent(
              this.auditActions.CREATE,
              {
                unitName: this.entry.unitName,
                agencyId: this.entry.agencyId,
                agencyName: selectedAgency ? selectedAgency.agencyName : '',
                inspectionRequired: 'Yes',
                appointmentMade: this.entry.appointmentMade,
                inspectionDate: this.entry.inspectionDate,
                inspectionTime: this.entry.inspectionTime || '',
                status: this.entry.status,
                priority: this.entry.priority,
              },
              this.resourceTypes.INSPECTION,
              docRef.id,
            )

            console.log('Inspection data stored in Firestore')
            this.showSuccessDialog(
              'Inspection entry added successfully!',
              'Success!',
              'Continue',
              '/inspections',
            )
          } catch (error) {
            console.error('Error creating inspection entry:', error)
            this.showErrorDialog(
              'Failed to create inspection entry. Please try again.',
              'Error',
              'OK',
            )
          } finally {
            this.loading = false
          }
        }
      },

      async fetchAgencies () {
        this.agenciesLoading = true
        try {
          const appStore = useAppStore()
          const currentUser = appStore.currentUser
          const userType = currentUser?.userType

          if (
            userType === 'Agency'
            || (userType === 'Admin' && currentUser.adminScope === 'agency')
          ) {
            // Agency users and Agency Admin users can only add inspection entries to their own agency
            let agencyData = null

            if (userType === 'Agency') {
              // For Agency users, use their own document
              const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid))
              if (agencyDoc.exists()) {
                agencyData = {
                  id: agencyDoc.id,
                  ...agencyDoc.data(),
                }
              }
            } else if (
              userType === 'Admin'
              && currentUser.adminScope === 'agency'
              && // For Agency Admin users, fetch their managed agency
              currentUser.managedAgencyId) {
              const agencyDoc = await getDoc(
                doc(db, 'users', currentUser.managedAgencyId),
              )
              if (agencyDoc.exists()) {
                agencyData = {
                  id: agencyDoc.id,
                  ...agencyDoc.data(),
                }
              }
            }

            if (agencyData) {
              this.agencies = [agencyData]
              // Pre-select the agency for agency users and agency admins
              this.entry.agencyId = agencyData.id
            } else {
              this.agencies = []
            }
            console.log('Agency user - own agency loaded:', this.agencies)
          } else {
            // Super Admin and Admin users can see all agencies
            const q = query(
              collection(db, 'users'),
              where('userType', '==', 'Agency'),
            )
            const querySnapshot = await getDocs(q)
            this.agencies = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            console.log('All agencies loaded:', this.agencies.length)
            console.log('Agencies data:', this.agencies)
            // Check if agencies have the correct field names
            if (this.agencies.length > 0) {
              console.log('First agency structure:', this.agencies[0])
              console.log(
                'First agency agencyName:',
                this.agencies[0].agencyName,
              )
            } else {
              console.log('No agencies found in database')
            // Avoid auto-creating test agencies from this page
            }
          }
        } catch (error) {
          console.error('Error fetching agencies:', error)
          this.showErrorDialog(
            'Failed to load agencies. Please try again.',
            'Error',
            'OK',
          )
        } finally {
          this.agenciesLoading = false
        }
      },

      async fetchUnits (agencyId = null) {
        this.unitsLoading = true
        try {
          const appStore = useAppStore()
          const currentUser = appStore.currentUser
          const userType = currentUser?.userType

          let unitsQuery

          if (userType === 'Agency') {
            // Agency users can only see units from their own agency
            unitsQuery = query(
              collection(db, 'units'),
              where('agencyId', '==', currentUser.uid),
            )
          } else if (agencyId) {
            // Super Admin/Admin users query units for specific agency
            unitsQuery = query(
              collection(db, 'units'),
              where('agencyId', '==', agencyId),
            )
          } else {
            // Super Admin/Admin users query all units when no agency selected
            unitsQuery = collection(db, 'units')
          }

          const querySnapshot = await getDocs(unitsQuery)
          this.units = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))

          console.log('Units fetched:', this.units)
          console.log('User type:', userType, 'Agency ID filter:', agencyId)
        } catch (error) {
          console.error('Error fetching units:', error)
          this.showErrorDialog(
            'Failed to load units. Please try again.',
            'Error',
            'OK',
          )
        } finally {
          this.unitsLoading = false
        }
      },

      goBack () {
        this.$router.push('/inspections')
      },
    },
  }
</script>

<style scoped>
.add-inspection-page {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
