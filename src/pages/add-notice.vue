<template>
  <div class="add-notice-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon
            variant="outlined"
            @click="$router.push('/notices')"
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
                      class="custom-input"
                      item-title="agencyName"
                      item-value="id"
                      :disabled="isAgencyUser"
                      :items="agencies"
                      label="Select Agency"
                      :loading="agenciesLoading"
                      required
                      :rules="agencyRules"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      v-model="notice.unitName"
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

                  <!-- Lease Start Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseStartDate"
                      class="custom-input"
                      label="Lease Start Date"
                      required
                      :rules="leaseStartDateRules"
                      type="date"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Lease End Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseEndDate"
                      class="custom-input"
                      label="Lease End Date"
                      required
                      :rules="leaseEndDateRules"
                      type="date"
                      variant="outlined"
                    />
                  </v-col>

                  <!-- Month's Missed Rent -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="notice.monthsMissedRent"
                      class="custom-input"
                      hint="Enter number of months rent was missed"
                      label="Month's Missed Rent"
                      min="0"
                      persistent-hint
                      step="1"
                      type="number"
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
                  variant="outlined"
                  @click="$router.push('/notices')"
                >
                  Cancel
                </v-btn>
                <v-btn
                  class="save-btn"
                  color="black"
                  :disabled="!valid || loading"
                  :loading="loading"
                  variant="elevated"
                  @click="saveNotice"
                >
                  {{ loading ? "Adding..." : "Add Notice" }}
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
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
  } from 'firebase/firestore'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { usePropertyType } from '@/composables/usePropertyType'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'AddNoticePage',
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
        valid: true,
        loading: false,
        agencies: [],
        agenciesLoading: false,
        units: [],
        unitsLoading: false,
        notice: {
          agencyId: '',
          unitName: '',
          leaseStartDate: '',
          leaseEndDate: '',
          monthsMissedRent: 0,
        },
        agencyRules: [v => !!v || 'Agency selection is required'],
        unitNameRules: [
          v => !!v || 'Unit Name is required',
          v => v.length >= 2 || 'Unit Name must be at least 2 characters',
        ],
        leaseStartDateRules: [v => !!v || 'Lease Start Date is required'],
        leaseEndDateRules: [v => !!v || 'Lease End Date is required'],
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
      selectedUnitPropertyType () {
        if (!this.notice.unitName) return null
        const selectedUnit = this.units.find(
          unit => unit.propertyName === this.notice.unitName,
        )
        return selectedUnit?.propertyType || null
      },
      propertyTypeLabel () {
        return this.selectedUnitPropertyType
          ? this.getLabel(this.selectedUnitPropertyType)
          : ''
      },
    },
    watch: {
      'notice.agencyId': {
        handler (newAgencyId) {
          if (this.isAgencyUser) {
            // Agency users automatically get their own units
            this.fetchUnits()
          } else if (newAgencyId) {
            // Super Admin/Admin users get units for selected agency
            this.fetchUnits(newAgencyId)
          } else {
            this.units = []
            this.notice.unitName = ''
          }
        },
        immediate: false,
      },
      'notice.unitName' (unitName) {
        if (!unitName) {
          return
        }
        const selectedUnit = this.units.find(
          unit => unit.propertyName === unitName || unit.unitName === unitName,
        )
        if (selectedUnit) {
          this.notice.leaseStartDate = selectedUnit.leaseStartDate || ''
          this.notice.leaseEndDate = selectedUnit.leaseEndDate || ''
          // Prefill months missed rent from the unit if available
          const mm
            = typeof selectedUnit.monthsMissed === 'number'
              ? selectedUnit.monthsMissed
              : Number(selectedUnit.monthsMissed)
          this.notice.monthsMissedRent = Number.isFinite(mm) ? mm : 0
        }
      },
    },
    async mounted () {
      document.title = 'Add New Notice - Depsure'

      // Fetch agencies first
      await this.fetchAgencies()

      // For agency users, fetch their units automatically
      if (this.isAgencyUser) {
        await this.fetchUnits()
      }
    },
    methods: {
      async isUnitFlagged (unitName) {
        try {
          if (!unitName) return false
          // Check flaggedUnits collection for a matching unit by name
          const flaggedQuery = query(
            collection(db, 'flaggedUnits'),
            where('unitName', '==', unitName),
          )
          const flaggedSnapshot = await getDocs(flaggedQuery)
          return !flaggedSnapshot.empty
        } catch (error) {
          console.error('Failed to check flagged unit status:', error)
          // Fail-safe: don't allow proceeding when we can't verify
          return true
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
            // Agency users and Agency Admin users can only add notices to their own agency
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
              this.notice.agencyId = agencyData.id
            } else {
              this.agencies = []
            }
            console.log('Agency user - own agency loaded:', this.agencies)
          } else {
            // Super Admin and Admin users can see all agencies
            console.log('Fetching agencies...')
            const agenciesQuery = query(
              collection(db, 'users'),
              where('userType', '==', 'Agency'),
            )
            const agenciesSnapshot = await getDocs(agenciesQuery)

            this.agencies = agenciesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            console.log('All agencies loaded:', this.agencies)
          }
        } catch (error) {
          console.error('Error fetching agencies:', error)
        } finally {
          this.agenciesLoading = false
        }
      },

      async saveNotice () {
        if (this.$refs.form.validate()) {
          this.loading = true
          try {
            console.log('Saving notice:', this.notice)

            // Block if unit is flagged
            const flagged = await this.isUnitFlagged(this.notice.unitName)
            if (flagged) {
              this.showErrorDialog(
                'Can\'t move flagged units to notices. Please remove the flag first.',
                'Action Blocked',
                'OK',
              )
              return
            }

            // Prepare notice data for Firestore
            const noticeData = {
              ...this.notice,
              noticeGivenDate: new Date().toISOString().split('T')[0], // Auto-set to today
              vacateDate: this.notice.leaseEndDate, // Same as lease end date
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            console.log('Notice data to save:', noticeData)

            // Add notice to Firestore
            const docRef = await addDoc(collection(db, 'notices'), noticeData)

            // NEW FLOW: Remove from Active Units, store in Notice (don't create vacancy yet)
            let unitId = null
            try {
              // Find the unit by propertyName
              const unitsCol = collection(db, 'units')
              const q = query(
                unitsCol,
                where('propertyName', '==', this.notice.unitName),
              )
              const snap = await getDocs(q)
              if (!snap.empty) {
                const unitDoc = snap.docs[0]
                const unitData = unitDoc.data()
                unitId = unitDoc.id

                // Update the notice with unitId reference
                await updateDoc(doc(db, 'notices', docRef.id), {
                  unitId: unitId,
                  propertyType: unitData.propertyType || 'residential',
                })

                // Mark unit as having a notice (add status field)
                await updateDoc(doc(db, 'units', unitDoc.id), {
                  status: 'Notice Given',
                  noticeId: docRef.id,
                  updatedAt: new Date(),
                  monthsMissed: 0,
                  monthsMissedRent: 0,
                })
              }
            } catch (error) {
              console.error('Error updating unit status:', error)
            }

            // Log the audit event
            await this.logAuditEvent(
              this.auditActions.CREATE,
              {
                unitName: this.notice.unitName,
                agencyId: this.notice.agencyId,
                leaseStartDate: this.notice.leaseStartDate,
                leaseEndDate: this.notice.leaseEndDate,
              },
              this.resourceTypes.NOTICE,
              docRef.id,
            )

            console.log('Notice added successfully with ID:', docRef.id)
            this.showSuccessDialog(
              'Notice added successfully!',
              'Success!',
              'Continue',
              '/notices',
            )
          } catch (error) {
            console.error('Error adding notice:', error)
            this.showErrorDialog(
              `Failed to add notice: ${error.message}`,
              'Error',
              'OK',
            )
          } finally {
            this.loading = false
          }
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

          // Get all vacancies to filter out units that already have vacancies
          const vacanciesQuery = collection(db, 'vacancies')
          const vacanciesSnapshot = await getDocs(vacanciesQuery)
          const vacantUnitIds = new Set()
          const vacantUnitNames = new Set()

          for (const doc of vacanciesSnapshot.docs) {
            const vacancy = doc.data()
            if (vacancy.unitId) {
              vacantUnitIds.add(vacancy.unitId)
            }
            if (vacancy.unitName) {
              vacantUnitNames.add(vacancy.unitName)
            }
          }

          // Get all notices to filter out units that already have notices
          const noticesQuery = collection(db, 'notices')
          const noticesSnapshot = await getDocs(noticesQuery)
          const noticeUnitIds = new Set()
          const noticeUnitNames = new Set()

          for (const doc of noticesSnapshot.docs) {
            const notice = doc.data()
            if (notice.unitId) {
              noticeUnitIds.add(notice.unitId)
            }
            if (notice.unitName) {
              noticeUnitNames.add(notice.unitName)
            }
          }

          // Filter out units that have active vacancies or notices
          this.units = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(unit => {
              // Exclude if unit ID is in vacancies
              if (vacantUnitIds.has(unit.id)) {
                return false
              }
              // Exclude if unit name/propertyName is in vacancies
              if (unit.propertyName && vacantUnitNames.has(unit.propertyName)) {
                return false
              }
              if (unit.unitName && vacantUnitNames.has(unit.unitName)) {
                return false
              }
              // Exclude if unit ID is in notices
              if (noticeUnitIds.has(unit.id)) {
                return false
              }
              // Exclude if unit name/propertyName is in notices
              if (unit.propertyName && noticeUnitNames.has(unit.propertyName)) {
                return false
              }
              if (unit.unitName && noticeUnitNames.has(unit.unitName)) {
                return false
              }
              return true
            })

          console.log(
            'Units fetched (excluding units with vacancies or notices):',
            this.units,
          )
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
    },
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
  text-align: center;
  text-transform: uppercase;
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
  .add-notice-page {
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
