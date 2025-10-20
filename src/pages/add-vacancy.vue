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
                      :disabled="isAgencyUser"
                    />
                  </v-col>

                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      v-model="vacancy.unitName"
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

                  <!-- Property Type (read-only) -->
                  <v-col v-if="selectedUnitPropertyType" cols="12" md="6">
                    <v-text-field
                      :model-value="propertyTypeLabel"
                      label="Property Type"
                      variant="outlined"
                      class="custom-input"
                      readonly
                      prepend-inner-icon="mdi-home"
                    />
                  </v-col>

                  <!-- Date Vacated (shown as Lease End Date for agents) -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.dateVacated"
                      :label="isAgencyUser ? 'Lease End Date' : 'Date Vacated'"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="dateVacatedRules"
                      required
                    />
                  </v-col>

                  <!-- Move In Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.moveInDate"
                      label="Move In Date (Optional)"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="[]"
                      hint="Set when new tenant is secured"
                      persistent-hint
                    />
                  </v-col>

                  <!-- Lease Start Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.leaseStartDate"
                      label="Lease Start Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="leaseStartDateRules"
                      required
                    />
                  </v-col>

                  <!-- Lease End Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="vacancy.leaseEndDate"
                      label="Lease End Date"
                      variant="outlined"
                      type="date"
                      class="custom-input"
                      :rules="leaseEndDateRules"
                      required
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

                  <!-- Paid Towards Fund -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="vacancy.paidTowardsFund"
                      label="Paid Towards Fund"
                      variant="outlined"
                      type="number"
                      class="custom-input"
                      :rules="paidTowardsFundRules"
                      prefix="R"
                      min="0"
                      step="0.01"
                    />
                  </v-col>

                  <!-- Paid Out -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="vacancy.paidOut"
                      :items="paidOutOptions"
                      label="Paid Out (Yes/No)"
                      variant="outlined"
                      class="custom-input"
                      :rules="paidOutRules"
                      clearable
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
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: 'AddVacancyPage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getLabel } = usePropertyType()
    return { 
      showSuccessDialog, 
      showErrorDialog, 
      logAuditEvent, 
      auditActions, 
      resourceTypes,
      getPropertyTypeLabel: getLabel
    }
  },
  data() {
    return {
      vacancy: {
        agencyId: '',
        unitName: '',
        dateVacated: '',
        moveInDate: '',
        leaseStartDate: '',
        leaseEndDate: '',
        propertyManager: '',
        contactNumber: '',
        paidTowardsFund: 0,
        paidOut: ''
      },
      agencies: [],
      agenciesLoading: false,
      units: [],
      unitsLoading: false,
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
      leaseStartDateRules: [
        v => !!v || 'Lease start date is required'
      ],
      leaseEndDateRules: [
        v => !!v || 'Lease end date is required'
      ],
      propertyManagerRules: [
        v => !!v || 'Property manager is required'
      ],
      contactNumberRules: [
        v => !!v || 'Contact number is required'
      ],
      paidTowardsFundRules: [
        v => v === '' || Number(v) >= 0 || 'Amount must be zero or higher'
      ],
      paidOutRules: [],
      paidOutOptions: ['Yes', 'No'],
      notesRules: []
    }
  },
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
    },
    selectedUnitPropertyType() {
      if (!this.vacancy.unitName) return null;
      
      // Find the selected unit to get its propertyType
      const selectedUnit = this.units.find(u => u.propertyName === this.vacancy.unitName);
      if (!selectedUnit) return null;
      
              return selectedUnit.propertyType || 'residential';
    },
    propertyTypeLabel() {
      if (!this.selectedUnitPropertyType) return '';
      return this.getPropertyTypeLabel(this.selectedUnitPropertyType);
    }
  },
  methods: {
    async saveVacancy() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          console.log('Adding new vacancy:', this.vacancy)
          
          // Prepare vacancy data for Firestore
          // Get property type from the unit
          let propertyType = 'residential'; // default
          try {
            const unitsQuery = query(
              collection(db, 'units'),
              where('unitName', '==', this.vacancy.unitName)
            );
            const unitSnapshot = await getDocs(unitsQuery);
            if (!unitSnapshot.empty) {
              const unitData = unitSnapshot.docs[0].data();
              propertyType = unitData.propertyType || 'residential';
            }
          } catch (error) {
            console.log('Could not resolve property type, using default');
          }
          
          const vacancyData = {
            agencyId: this.vacancy.agencyId,
            unitName: this.vacancy.unitName,
            dateVacated: this.vacancy.dateVacated,
            moveInDate: this.vacancy.moveInDate || null,
            leaseStartDate: this.vacancy.leaseStartDate || null,
            leaseEndDate: this.vacancy.leaseEndDate || null,
            propertyManager: this.vacancy.propertyManager,
            contactNumber: this.vacancy.contactNumber,
            paidTowardsFund: this.normalizeCurrencyInput(this.vacancy.paidTowardsFund),
            paidOut: this.normalizePaidOut(this.vacancy.paidOut),
            notes: this.vacancy.notes || '',
            propertyType: propertyType,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          // Store vacancy data in Firestore
          const docRef = await addDoc(collection(db, 'vacancies'), vacancyData)
          
          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.CREATE,
            {
              unitName: this.vacancy.unitName,
              agencyId: this.vacancy.agencyId,
              dateVacated: this.vacancy.dateVacated,
              moveInDate: this.vacancy.moveInDate,
              leaseStartDate: this.vacancy.leaseStartDate,
              leaseEndDate: this.vacancy.leaseEndDate,
              propertyManager: this.vacancy.propertyManager,
              paidTowardsFund: this.normalizeCurrencyInput(this.vacancy.paidTowardsFund),
              paidOut: this.normalizePaidOut(this.vacancy.paidOut)
            },
            this.resourceTypes.VACANCY,
            docRef.id
          )
          
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
    normalizeCurrencyInput(value) {
      if (value === null || value === undefined || value === '') return 0
      const num = typeof value === 'number' ? value : Number(value)
      return Number.isFinite(num) ? num : 0
    },
    normalizePaidOut(value) {
      if (value === true || value === 'Yes' || value === 'yes') return 'Yes'
      if (value === false || value === 'No' || value === 'no') return 'No'
      return value || ''
    },
    normalizeDateInput(value) {
      if (!value) return ''
      if (typeof value === 'string') return value
      if (value instanceof Date) return value.toISOString().slice(0, 10)
      if (typeof value?.toDate === 'function') {
        try {
          return value.toDate().toISOString().slice(0, 10)
        } catch {
          return ''
        }
      }
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
    },

    async fetchAgencies() {
      this.agenciesLoading = true
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          // Agency users and Agency Admin users can only add vacancy entries to their own agency
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
            this.vacancy.agencyId = agencyData.id;
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
    'vacancy.agencyId': {
      handler(newAgencyId) {
        if (this.isAgencyUser) {
          // Agency users automatically get their own units
          this.fetchUnits();
        } else if (newAgencyId) {
          // Super Admin/Admin users get units for selected agency
          this.fetchUnits(newAgencyId);
        } else {
          this.units = [];
          this.vacancy.unitName = '';
        }
      },
      immediate: false
    },
    'vacancy.unitName'(unitName) {
      if (!unitName) {
        this.vacancy.leaseStartDate = '';
        this.vacancy.leaseEndDate = '';
        this.vacancy.paidTowardsFund = 0;
        this.vacancy.paidOut = '';
        return;
      }
      const selectedUnit = this.units.find(
        unit => unit.propertyName === unitName || unit.unitName === unitName
      );
      if (!selectedUnit) return;
      this.vacancy.leaseStartDate = this.normalizeDateInput(selectedUnit.leaseStartDate);
      this.vacancy.leaseEndDate = this.normalizeDateInput(selectedUnit.leaseEndDate);
      const paidAmount = selectedUnit.paidTowardsFund ?? selectedUnit.paidTowards ?? '';
      this.vacancy.paidTowardsFund = this.normalizeCurrencyInput(paidAmount);
      this.vacancy.paidOut = this.normalizePaidOut(
        selectedUnit.paidOut ?? selectedUnit.hasPaidOut ?? ''
      );
    }
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
.custom-input {
  margin-bottom: 16px;
}

.custom-input .v-field {
  border-radius: 8px;
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
