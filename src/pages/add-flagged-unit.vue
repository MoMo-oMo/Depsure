<template>
  <div class="add-flagged-unit-page">
    <v-container fluid>
      <!-- Form Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <!-- Title Section -->
          <div class="title-section">
            <h1 class="page-title">Add Flagged Unit</h1>
          </div>

          <div class="form-card" elevation="0">
            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- Row 0: Agency Selection -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="unit.agencyId"
                    :items="agencies"
                    item-title="agencyName"
                    item-value="id"
                    label="Select Agency"
                    variant="outlined"
                    class="custom-input"
                    :rules="agencyRules"
                    :loading="agenciesLoading"
                    required
                    :disabled="isAgencyUser"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="unit.unitName"
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
              </v-row>

              <!-- Row 0.5: Property Type (read-only) -->
              <v-row v-if="selectedUnitPropertyType">
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="propertyTypeLabel"
                    label="Property Type"
                    variant="outlined"
                    class="custom-input"
                    readonly
                    prepend-inner-icon="mdi-home"
                  />
                </v-col>
              </v-row>

              <!-- Row 1: Tenant Info -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.tenantRef"
                    label="Tenant Reference"
                    variant="outlined"
                    class="custom-input"
                    :rules="tenantRefRules"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.leaseStartDate"
                    label="Lease Start Date"
                    type="date"
                    variant="outlined"
                    class="custom-input"
                    :rules="leaseStartDateRules"
                    required
                  />
                </v-col>
              </v-row>

              <!-- Row 2: Flag Details -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.flagReason"
                    label="Reason Flagged"
                    variant="outlined"
                    class="custom-input"
                    :rules="flagReasonRules"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.dateFlagged"
                    label="Date Flagged"
                    type="date"
                    variant="outlined"
                    class="custom-input"
                    :rules="dateFlaggedRules"
                    required
                  />
                </v-col>
              </v-row>

              <!-- Row 3: Payment Status -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="unit.missedPaymentFlag"
                    :items="['Yes', 'No']"
                    label="Missed Payment Flag"
                    variant="outlined"
                    class="custom-input"
                    :rules="missedPaymentFlagRules"
                    required
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="unit.noticeToVacateGiven"
                    label="Notice To Vacate Given"
                    type="date"
                    variant="outlined"
                    class="custom-input"
                    :rules="noticeToVacateGivenRules"
                    required
                  />
                </v-col>
              </v-row>

              <!-- Row 4: Action Taken -->
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="unit.actionTaken"
                    label="Action Taken"
                    variant="outlined"
                    class="custom-input"
                    :rules="actionTakenRules"
                    :counter="500"
                    maxlength="500"
                    rows="3"
                    required
                  />
                </v-col>
              </v-row>

              <!-- Row 5: Notes -->
              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="unit.notes"
                    label="Additional Notes"
                    variant="outlined"
                    class="custom-input"
                    :rules="notesRules"
                    :counter="500"
                    maxlength="500"
                    rows="3"
                  />
                </v-col>
              </v-row>

              <!-- Action Buttons -->
              <div class="button-container">
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
                  {{ loading ? 'Adding...' : 'Add Flagged Unit' }}
                </v-btn>
              </div>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAppStore } from '@/stores/app'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: "AddFlaggedUnitPage",
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getLabel, resolvePropertyTypeFromUnit } = usePropertyType()
    return { 
      showSuccessDialog, 
      showErrorDialog, 
      logAuditEvent, 
      auditActions, 
      resourceTypes,
      getPropertyTypeLabel: getLabel,
      resolvePropertyTypeFromUnit
    }
  },
  data() {
    return {
      valid: false,
      loading: false,
      agencies: [],
      agenciesLoading: false,
      units: [],
      unitsLoading: false,
      unit: {
        agencyId: '',
        unitName: '',
        tenantRef: '',
        leaseStartDate: '',
        flagReason: '',
        dateFlagged: '',
        missedPaymentFlag: '',
        noticeToVacateGiven: '',
        actionTaken: '',
        notes: ''
      },
      agencyRules: [v => !!v || "Agency selection is required"],
      unitNameRules: [
        v => !!v || "Unit Name is required",
        v => v.length >= 3 || "Unit Name must be at least 3 characters"
      ],
      tenantRefRules: [v => !!v || "Tenant Reference is required"],
      leaseStartDateRules: [v => !!v || "Lease Start Date is required"],
      flagReasonRules: [v => !!v || "Reason Flagged is required"],
      dateFlaggedRules: [v => !!v || "Date Flagged is required"],
      missedPaymentFlagRules: [v => !!v || "Missed Payment Flag is required"],
      noticeToVacateGivenRules: [v => !!v || "Notice To Vacate Given is required"],
      actionTakenRules: [
        v => !!v || "Action Taken is required",
        v => (v ? v.length <= 500 : true) || 'Action Taken cannot exceed 500 characters'
      ],
      notesRules: [
        v => (v ? v.length <= 500 : true) || 'Additional Notes cannot exceed 500 characters'
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
      if (!this.unit.unitName) return null;
      
      // Find the selected unit to get its propertyId
      const selectedUnit = this.units.find(u => u.propertyName === this.unit.unitName);
      if (!selectedUnit) return null;
      
              return selectedUnit.propertyType || 'residential';
    },
    propertyTypeLabel() {
      if (!this.selectedUnitPropertyType) return '';
      return this.getPropertyTypeLabel(this.selectedUnitPropertyType);
    }
  },
  methods: {
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          // Agency users and Agency Admin users can only add flagged units to their own agency
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
            this.unit.agencyId = agencyData.id;
          } else {
            this.agencies = [];
          }
          console.log('Agency user - own agency loaded:', this.agencies);
        } else {
          // Super Admin and Admin users can see all agencies
          const agenciesQuery = query(
            collection(db, 'users'),
            where('userType', '==', 'Agency')
          );
          
          const querySnapshot = await getDocs(agenciesQuery);
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('All agencies fetched:', this.agencies);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
        this.showErrorDialog('Failed to load agencies. Please try again.');
      } finally {
        this.agenciesLoading = false;
      }
    },

    async submitForm() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          // Prepare the flagged unit data
          const flaggedUnitData = {
            ...this.unit,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Add to flaggedUnits collection
          const docRef = await addDoc(collection(db, 'flaggedUnits'), flaggedUnitData);
          
          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.CREATE,
            {
              unitName: this.unit.unitName,
              agencyId: this.unit.agencyId,
              tenantRef: this.unit.tenantRef,
              flagReason: this.unit.flagReason,
              dateFlagged: this.unit.dateFlagged,
              missedPaymentFlag: this.unit.missedPaymentFlag,
              noticeToVacateGiven: this.unit.noticeToVacateGiven,
              actionTaken: this.unit.actionTaken
            },
            this.resourceTypes.UNIT,
            docRef.id
          )
          
          console.log("Flagged unit added successfully with ID:", docRef.id);
          this.showSuccessDialog("Flagged unit added successfully!", "Success!", "Continue", "/flagged-units");
        } catch (error) {
          console.error('Error adding flagged unit:', error);
          this.showErrorDialog('Failed to add flagged unit. Please try again.');
        } finally {
          this.loading = false;
        }
      }
    },

    async fetchUnits(agencyId = null) {
      this.unitsLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        let unitsQuery;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          // Agency users and Agency Admin users can only see units from their own agency
          let targetAgencyId = currentUser.uid; // Default for Agency users
          
          if (userType === 'Admin' && currentUser.adminScope === 'agency') {
            // For Agency Admin users, use their managed agency ID
            targetAgencyId = currentUser.managedAgencyId;
          }
          
          if (targetAgencyId) {
            unitsQuery = query(
              collection(db, 'units'),
              where('agencyId', '==', targetAgencyId)
            );
          } else {
            // No agency ID available, return empty results
            this.units = [];
            return;
          }
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
      this.$router.push("/flagged-units");
    }
  },
  async mounted() {
    document.title = "Add Flagged Unit - Depsure";
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // For agency users and agency admins, fetch their units automatically
    if (this.isAgencyUser) {
      // Ensure agencyId defaults to the correct value
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        
        if (currentUser?.userType === 'Agency') {
          this.unit.agencyId = currentUser.uid || '';
        } else if (currentUser?.userType === 'Admin' && currentUser?.adminScope === 'agency') {
          this.unit.agencyId = currentUser.managedAgencyId || '';
        }
      } catch (_) {}
      await this.fetchUnits();
    }
  },
  watch: {
    'unit.agencyId': {
      handler(newAgencyId) {
        if (this.isAgencyUser) {
          // Agency users automatically get their own units
          this.fetchUnits();
        } else if (newAgencyId) {
          // Super Admin/Admin users get units for selected agency
          this.fetchUnits(newAgencyId);
        } else {
          this.units = [];
          this.unit.unitName = '';
        }
      },
      immediate: false
    }
  }
};
</script>

<style scoped>
.add-flagged-unit-page {
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
  text-align: left;
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
  background-color: white !important;
  color: #000 !important;
}

.button-container {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
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
