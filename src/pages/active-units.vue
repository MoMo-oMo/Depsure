<template>
  <div class="view-agency-page">
    <v-container fluid>
      <!-- Filters and Add Unit Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search properties..."
            prepend-inner-icon="mdi-magnify"
            flat="true"
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterProperties"
          />
        </v-col>

        

      <!-- Month filter -->
      <v-col cols="12" md="2" lg="3" class="pa-4">
        <v-menu
          v-model="monthMenu"
          :close-on-content-click="false"
          transition="fade-transition"
          location="bottom"
          @update:model-value="onMonthMenuToggle"
        >
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              :model-value="monthFilterLabel"
              label="Filter by month"
              append-inner-icon="mdi-calendar-month"
              flat="true"
              density="comfortable"
              variant="outlined"
              hide-details
              dense
              class="custom-input top-filter month-input flex-grow-1"
              readonly
            />
          </template>
          <div class="month-menu">
            <div class="month-menu__title">Pick month</div>
            <input
              type="month"
              :value="tempMonth"
              @input="(e) => { tempMonth = e.target.value }"
              class="month-menu__input"
            />
            <div class="month-menu__actions">
              <v-btn color="black" variant="elevated" size="small" @click="applyMonth">Apply</v-btn>
              <v-btn color="grey" variant="text" size="small" @click="clearMonth">All</v-btn>
            </div>
          </div>
        </v-menu>
      </v-col>

      <!-- Property Type filter -->
      <v-col cols="12" md="2" lg="2" class="pa-4">
        <v-select
          v-model="propertyTypeFilter"
          :items="propertyTypeFilterOptions"
          item-title="title"
          item-value="value"
          label="Property Type"
          prepend-inner-icon="mdi-home"
          density="comfortable"
          variant="outlined"
          hide-details
          class="custom-input top-filter"
          @update:model-value="filterProperties"
        />
      </v-col>

      <!-- Flagged filter -->
      <v-col cols="12" md="2" lg="2" class="pa-4">
        <v-select
          v-model="flaggedFilter"
          :items="flaggedFilterOptions"
          item-title="title"
          item-value="value"
          label="Flagged"
          density="comfortable"
          variant="outlined"
          hide-details
          class="custom-input top-filter"
          @update:model-value="filterProperties"
        />
      </v-col>

        

        <!-- Add Unit Button - Only when Super Admin AND an agency exists and is selected -->
        <v-col cols="12" md="2" lg="2" class="pa-4 d-flex align-center" v-if="isSuperAdmin && agencies.length > 0 && selectedAgency">
          <v-btn
            icon="mdi-plus"
            variant="outlined"
            color="primary"
            @click="addUnit"
            class="back-btn"
          >
            Add Unit
          </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="showSquareMeterageSummary" class="mb-4">
        <v-col cols="12" class="pa-4 pt-0">
          <div class="square-meter-summary">
            <div class="summary-title">
              {{ squareMeterageSummaryLabel }} Total Square Meterage
            </div>
            <div class="summary-value">
              {{ squareMeterageTotalFormatted }} sqm
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Clean Agency Header (static image, centered title) -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="agency-hero-card" elevation="1">
            <div class="agency-hero-bg" :style="agencyHeroBgStyle"></div>
            <div class="agency-hero-center">
              {{ heroTitle }}
            </div>
          </v-card>
        </v-col>
      </v-row>
      <!-- Agency Info Card (only when selected) -->
      <v-row class="mb-6" v-if="false && selectedAgencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <div class="agency-card-bg" :style="agencyCardBgStyle"></div>
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12">
                <div class="agency-content-right">
                <v-card-title class="text-white text-h4 mb-2">
                  {{ selectedAgencyDetails.agencyName }}
                </v-card-title>
                <v-card-text class="text-white">
                  <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.address || 'Address not provided' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-card-account-details" class="mr-2 text-white" />
                      <span>Reg No: {{ selectedAgencyDetails.regNo || 'â€”' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-account" class="mr-2 text-white" />
                      <span>Primary Contact: {{ selectedAgencyDetails.primaryContactName || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-phone" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.contactNumber || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-email" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.email || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-home" class="mr-2 text-white" />
                      <span>{{ activeUnitsCount }} Properties</span>
                    </div>
                  </div>
                  <!-- Description hidden to reduce visual noise over image -->
                  <!-- <v-divider class="my-4 bg-white" /> -->
                </v-card-text>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      

      <!-- Properties Table -->
      <v-row>
        <v-col cols="12" class="px-4 pb-6">
          <div class="table-responsive">
            <v-data-table
              :headers="tableHeaders"
              :items="filteredProperties"
              :search="searchQuery"
              class="custom-header elevation-1"
              density="comfortable"
              hover
              :loading="propertiesLoading"
              :items-per-page="15"
              no-data-text="No data available"
            >
            <!-- Super Admin: Flagged indicator column (click to view flagged entry) -->
            <template v-slot:item.flag="{ item }" v-if="isSuperAdmin">
              <v-btn
                variant="text"
                size="small"
                :color="isUnitFlagged(item) ? 'error' : 'success'"
                :icon="true"
                :disabled="!isUnitFlagged(item)"
                :title="isUnitFlagged(item) ? 'View flagged unit' : 'Not flagged'"
                @click="gotoFlaggedUnit(item)"
              >
                <v-icon>
                  {{ isUnitFlagged(item) ? 'mdi-flag' : 'mdi-flag-outline' }}
                </v-icon>
              </v-btn>
            </template>
            <!-- Missed Rent (Yes + months) column -->
            <template v-slot:item.monthsMissed="{ item }">
              <v-chip
                :color="(item.monthsMissed || 0) > 0 ? 'error' : 'success'"
                size="small"
                variant="tonal"
                :title="(item.monthsMissed || 0) > 0 
                  ? `${item.monthsMissed} ${(item.monthsMissed === 1 ? 'month' : 'months')} missed` 
                  : 'No missed rent'"
              >
                {{ (item.monthsMissed || 0) > 0 
                  ? `Yes - ${item.monthsMissed} ${(item.monthsMissed === 1 ? 'month' : 'months')}` 
                  : 'No' }}
              </v-chip>
            </template>
            <template v-slot:item.propertyType="{ item }">
              <v-chip 
                :color="getColor(item.propertyType)" 
                size="small"
                variant="elevated"
              >
                {{ getLabel(item.propertyType) }}
              </v-chip>
            </template>
            <!-- Truncate long property names for alignment -->
            <template v-slot:item.propertyName="{ item }">
              <span class="truncate-cell" :title="item.propertyName">{{ item.propertyName }}</span>
            </template>
            <template v-slot:item.unitNumber="{ item }">
              <span class="truncate-cell" :title="item.unitNumber">{{ item.unitNumber }}</span>
            </template>

            <template v-slot:item.paidOut="{ item }">
              <v-chip :color="item.paidOut === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.paidOut }}
              </v-chip>
            </template>
            <template v-slot:item.maintenanceAmount="{ item }">
              <span class="font-weight-medium">
                R{{ item.maintenanceAmount.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.paidTowardsFund="{ item }">
              <span class="font-weight-medium">
                R{{ item.paidTowardsFund.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.amountToBePaidOut="{ item }">
              <span class="font-weight-medium">
                R{{ item.amountToBePaidOut.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.leaseStartDate="{ item }">
              <span>{{ formatDate(item.leaseStartDate) }}</span>
            </template>
            <template v-slot:item.leaseEndDate="{ item }">
              <span>{{ formatDate(item.leaseEndDate) }}</span>
            </template>
            <template v-slot:item.actions="{ item }">
            <div class ="v-data-table_actions-cell">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="black"
                @click="viewProperty(item)"
                class="action-btn"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="black"
                @click="editProperty(item)"
                class="action-btn"
              />
              <!-- <v-btn
                :title="'Move to Vacancies'"
                icon="mdi-arrow-right-bold-box"
                size="small"
                variant="text"
                color="black"
                @click="moveToVacancies(item)"
                class="action-btn"
              /> -->
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteProperty(item)"
                class="action-btn"
              />
              </div>
            </template>
            </v-data-table>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
const heroBg = 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
import { collection, getDocs, query, where, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'
import { PROPERTY_TYPES } from '@/constants/propertyTypes'

const SQUARE_METER_TYPES = [PROPERTY_TYPES.COMMERCIAL, PROPERTY_TYPES.INDUSTRIAL]

export default {
  name: "ActiveUnitsPage",
  setup() {
    const appStore = useAppStore()
    const { showConfirmDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getOptions, getLabel, getColor } = usePropertyType()
    return { appStore, showConfirmDialog, logAuditEvent, auditActions, resourceTypes, getOptions, getLabel, getColor }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: '',
      monthMenu: false,
      tempMonth: '',
      propertyTypeFilter: null,
      flaggedFilter: 'all',
      filteredProperties: [],
      selectedAgency: null,
      agencies: [],
      agenciesLoading: false,
      properties: [],
      propertiesLoading: false,
      // Maps for quick flagged lookup (store flagged docId for navigation)
      flaggedUnitMap: {}, // by unitId -> flaggedDocId
      flaggedUnitNamesMap: {}, // by unitName (lowercased) -> flaggedDocId
      headers: [
        { title: "TENANT REF", key: "tenantRef", sortable: true },
        { title: "UNIT NO.", key: "unitNumber", sortable: true },
        { title: "PROPERTY NAME", key: "propertyName", sortable: true },
        { title: "TYPE", key: "propertyType", sortable: true, align: "center" },
        { title: "LEASE STARTING DATE", key: "leaseStartDate", sortable: true, align: "center" },

        { title: "ACTIONS", key: "actions", sortable: false, align: "center" },
      ],
    };
  },
  computed: {
    agencyHeroBgStyle() {
      return { background: `url(${heroBg}) center/cover no-repeat` }
    },
    heroTitle() {
      return 'Active Units'
    },
    monthFilterLabel() {
      if (!this.monthFilter) return 'All Months'
      try {
        const [yy, mm] = String(this.monthFilter).split('-')
        const d = new Date(Number(yy), Number(mm) - 1, 1)
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      } catch {
        return this.monthFilter
      }
    },
    agencyCardBgStyle() {
      const url = this.selectedAgencyDetails?.profileImageUrl || this.selectedAgencyDetails?.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
      return {
        background: `url(${url}) center/cover no-repeat`
      }
    },
    hasCurrentAgency() {
      const appStore = useAppStore();
      return !!appStore.currentAgency;
    },
    globalAgencyId() {
      const appStore = useAppStore();
      return appStore.currentAgency?.id || null;
    },
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.id === this.selectedAgency) || null;
    },
    activeUnitsCount() {
      // When an agency is selected or for agency users, properties array is scoped accordingly
      return Array.isArray(this.properties) ? this.properties.length : 0;
    },
    isAgencyUser() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
    },
    isSuperAdmin() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Super Admin';
    },
    // Build table headers dynamically to include Flag column for Super Admin
    tableHeaders() {
      const base = [...this.headers];
      if (this.isSuperAdmin) {
        // Insert the flagged column at the start
        return [
          { title: 'FLAGGED', key: 'flag', sortable: false, align: 'center' },
          ...base
        ];
      }
      return base;
    },
    propertyTypeFilterOptions() {
      return [
        { value: null, title: 'All Types' },
        ...this.getOptions()
      ];
    },
    flaggedFilterOptions() {
      return [
        { value: 'all', title: 'All' },
        { value: 'only', title: 'Only Flagged' }
      ];
    },
    showSquareMeterageSummary() {
      return SQUARE_METER_TYPES.includes(this.propertyTypeFilter)
    },
    squareMeterageTotal() {
      if (!SQUARE_METER_TYPES.includes(this.propertyTypeFilter)) return 0
      return (this.filteredProperties || []).reduce((sum, property) => {
        return sum + this.parseSquareMeterage(property?.squareMeterage)
      }, 0)
    },
    squareMeterageSummaryLabel() {
      if (!SQUARE_METER_TYPES.includes(this.propertyTypeFilter)) return ''
      return this.getLabel(this.propertyTypeFilter) || ''
    },
    squareMeterageTotalFormatted() {
      if (!this.showSquareMeterageSummary) return ''
      return this.squareMeterageTotal.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    }
  },
  methods: {
    onMonthMenuToggle(open) {
      if (open) {
        this.tempMonth = this.monthFilter || ''
      }
    },
    applyMonth() {
      this.monthFilter = this.tempMonth || ''
      this.filterProperties()
      this.monthMenu = false
    },
    clearMonth() {
      this.tempMonth = ''
      this.monthFilter = ''
      this.filterProperties()
      this.monthMenu = false
    },
    parseSquareMeterage(value) {
      if (value === null || value === undefined || value === '') return 0
      const numeric = typeof value === 'number' ? value : Number(value)
      return Number.isFinite(numeric) && numeric > 0 ? numeric : 0
    },
    openMonthPicker() {
      const el = this.$refs.monthInput?.$el?.querySelector('input');
      if (el) {
        if (typeof el.showPicker === 'function') el.showPicker();
        else el.focus();
      }
    },
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },
    formatDate(v) {
      if (!v) return ''
      try {
        const d = typeof v.toDate === 'function' ? v.toDate() : new Date(v)
        if (isNaN(d.getTime())) return String(v)
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yy = d.getFullYear()
        return `${dd}/${mm}/${yy}`
      } catch { return String(v) }
    },
    filterProperties() {
      this.filteredProperties = this.properties.filter((property) => {
        const textMatch =
          property.tenantRef
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.propertyName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.newOccupation
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.contractorRequested
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.paidOut
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        // Property Type filter
        let propertyTypeMatch = true;
        if (this.propertyTypeFilter) {
          propertyTypeMatch = property.propertyType === this.propertyTypeFilter;
        }

        // Month filter - now filtering by createdAt date
        let monthMatch = true;
        if (this.monthFilter) {
          // Handle Firestore Timestamp objects
          let propertyDate;
          if (property.createdAt && property.createdAt.toDate) {
            // Firestore Timestamp object
            propertyDate = property.createdAt.toDate();
          } else if (property.createdAt) {
            // Regular Date object or date string
            propertyDate = new Date(property.createdAt);
          } else {
            // No createdAt date, skip this property
            return textMatch && propertyTypeMatch;
          }
          
          const filterDate = new Date(this.monthFilter + "-01");
          const propertyMonth = `${propertyDate.getFullYear()}-${String(
            propertyDate.getMonth() + 1
          ).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(
            filterDate.getMonth() + 1
          ).padStart(2, "0")}`;

          monthMatch = propertyMonth === filterMonth;
        }

        // Flagged filter
        let flaggedMatch = true;
        if (this.flaggedFilter === 'only') {
          flaggedMatch = this.isUnitFlagged(property);
        }

        // NEW FLOW: Exclude units with "Notice Given" status (they should appear in Notices page)
        const notNoticeGiven = property.status !== 'Notice Given';

        return textMatch && propertyTypeMatch && monthMatch && flaggedMatch && notNoticeGiven;
      });
    },
    isUnitFlagged(item) {
      // Prefer ID-based match; fallback to name-based
      if (item?.id && this.flaggedUnitMap[item.id]) return true;
      // Check boolean flag on unit, if present
      if (item?.isFlagged === true || item?.isFlagged === 'Yes') return true;
      const name = (item?.unitName || item?.propertyName || '').toLowerCase();
      if (name && this.flaggedUnitNamesMap[name]) return true;
      return false;
    },
    getFlaggedDocIdForUnit(item) {
      if (!item) return null;
      if (item.id && this.flaggedUnitMap[item.id]) return this.flaggedUnitMap[item.id];
      const name = (item.unitName || item.propertyName || '').toLowerCase();
      if (name && this.flaggedUnitNamesMap[name]) return this.flaggedUnitNamesMap[name];
      return null;
    },
    gotoFlaggedUnit(item) {
      const flaggedId = this.getFlaggedDocIdForUnit(item);
      if (!flaggedId) return;
      this.$router.push(`/view-flagged-unit-${flaggedId}`);
    },
    viewProperty(property) {
      console.log("Viewing property:", property);
      this.$router.push(`/view-property-${property.id}`);
    },
    editProperty(property) {
      console.log("Editing property:", property);
      this.$router.push(`/edit-property-${property.id}`);
    },
    async deleteProperty(item) {
      try {
        await this.showConfirmDialog({
          title: 'Delete Unit?',
          message: `Are you sure you want to delete ${item.propertyName || item.unitName || 'this unit'}? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
        
        // Create archived unit data
        const archivedUnitData = {
          ...item,
          originalId: item.id,
          archivedAt: new Date(),
          archivedBy: this.appStore.currentUser?.uid || 'unknown',
          archivedByUserType: this.appStore.currentUser?.userType || 'unknown'
        }
        
        // Remove the id field so Firestore generates a new one
        delete archivedUnitData.id
        
        // Add to archivedUnits collection
        const archivedRef = collection(db, 'archivedUnits')
        await addDoc(archivedRef, archivedUnitData)

        // Cascade: remove related docs (flaggedUnits, maintenance, inspections)
        const unitNameKey = item.propertyName || item.unitName || ''
        const deletes = []
        try {
          // Flagged Units by unitName
          if (unitNameKey) {
            const fq1 = query(collection(db, 'flaggedUnits'), where('unitName', '==', unitNameKey))
            const fqs1 = await getDocs(fq1)
            fqs1.forEach(d => deletes.push(deleteDoc(d.ref)))
          }
          // Flagged Units by unitId (if schema supports it)
          if (item.id) {
            const fq2 = query(collection(db, 'flaggedUnits'), where('unitId', '==', item.id))
            const fqs2 = await getDocs(fq2)
            fqs2.forEach(d => deletes.push(deleteDoc(d.ref)))
          }
          // Flagged Units by unitNumber (if captured)
          if (item.unitNumber) {
            const fq3 = query(collection(db, 'flaggedUnits'), where('unitNumber', '==', item.unitNumber))
            const fqs3 = await getDocs(fq3)
            fqs3.forEach(d => deletes.push(deleteDoc(d.ref)))
          }
          // Maintenance by unitName
          if (unitNameKey) {
            const mq = query(collection(db, 'maintenance'), where('unitName', '==', unitNameKey))
            const ms = await getDocs(mq)
            ms.forEach(d => deletes.push(deleteDoc(d.ref)))
          }
          // Inspections by unitName
          if (unitNameKey) {
            const iq = query(collection(db, 'inspections'), where('unitName', '==', unitNameKey))
            const is = await getDocs(iq)
            is.forEach(d => deletes.push(deleteDoc(d.ref)))
          }
        } catch (cascadeErr) {
          console.error('Error preparing cascade deletes:', cascadeErr)
        }

        // Log archive action
        await this.logAuditEvent(
          this.auditActions.ARCHIVE,
          {
            unitId: item.id,
            unitName: item.propertyName || item.unitName,
            tenantRef: item.tenantRef,
            agencyId: item.agencyId
          },
          this.resourceTypes.UNIT,
          item.id
        )
        
        // Delete from original units collection
        const unitRef = doc(db, 'units', item.id)
        await deleteDoc(unitRef)

        // Execute related deletions
        if (deletes.length) {
          try {
            await Promise.allSettled(deletes)
          } catch (err) {
            console.error('Some related records could not be deleted:', err)
          }
        }
        
        // Remove from local arrays
        this.properties = this.properties.filter(prop => prop.id !== item.id)
        this.filteredProperties = this.filteredProperties.filter(prop => prop.id !== item.id)
        
        // Show success message (archived in background, but user sees "deleted")
        this.$nextTick(() => {
          console.log('Unit deleted successfully')
        })
        
      } catch (error) {
        if (error.message !== 'User cancelled') {
          console.error('Error archiving unit:', error)
        }
      }
    },
    async moveToVacancies(item) {
      try {
        await this.showConfirmDialog({
          title: 'Move to Vacancies?',
          message: `Move ${item.propertyName || item.unitName || 'this unit'} to Vacancies and remove it from Active Units?`,
          confirmText: 'Move',
          cancelText: 'Cancel',
          color: '#000000'
        })

        // Check if vacancy already exists
        const existingVacancyQuery = query(
          collection(db, 'vacancies'),
          where('unitName', '==', item.propertyName || item.unitName)
        );
        const existingVacancySnapshot = await getDocs(existingVacancyQuery);
        
        if (!existingVacancySnapshot.empty) {
          this.showErrorDialog('A vacancy already exists for this unit.', 'Already Exists', 'OK');
          return;
        }
        
        // Create vacancy entry
        const normalizeDateValue = (value) => {
          if (!value) return ''
          if (typeof value === 'string') return value
          if (value instanceof Date) return value.toISOString().slice(0, 10)
          if (value?.toDate) {
            try {
              return value.toDate().toISOString().slice(0, 10)
            } catch {
              return ''
            }
          }
          const parsed = new Date(value)
          return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
        }
        const normalizeCurrency = (value) => {
          if (value === null || value === undefined || value === '') return 0
          const num = typeof value === 'number' ? value : Number(value)
          return Number.isFinite(num) ? num : 0
        }
        const normalizePaidOut = (value) => {
          if (value === true || value === 'Yes' || value === 'yes') return 'Yes'
          if (value === false || value === 'No' || value === 'no') return 'No'
          return value || ''
        }

        const vacancyData = {
          agencyId: item.agencyId || this.appStore.currentAgency?.id || '',
          unitId: item.id,
          unitName: item.propertyName || item.unitName || '',
          dateVacated: new Date().toISOString().slice(0, 10),
          leaseStartDate: normalizeDateValue(item.leaseStartDate),
          leaseEndDate: normalizeDateValue(item.leaseEndDate),
          moveInDate: null,
          propertyManager: item.propertyManager || '',
          contactNumber: item.contactNumber || '',
          paidTowardsFund: normalizeCurrency(item.paidTowardsFund),
          paidOut: normalizePaidOut(item.paidOut),
          notes: '',
          propertyType: item.propertyType || 'residential',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await addDoc(collection(db, 'vacancies'), vacancyData)

        // Archive the unit (don't hard delete)
        const archivedUnitData = {
          ...item,
          originalId: item.id,
          archivedAt: new Date(),
          archivedBy: this.appStore.currentUser?.uid || 'unknown',
          archivedByUserType: this.appStore.currentUser?.userType || 'unknown',
          archivedReason: 'Moved to vacancies'
        }
        delete archivedUnitData.id
        await addDoc(collection(db, 'archivedUnits'), archivedUnitData)
        
        // Remove from active units
        await deleteDoc(doc(db, 'units', item.id))
        
        // Log audit event
        await this.logAuditEvent(
          this.auditActions.UPDATE,
          {
            unitId: item.id,
            unitName: item.propertyName || item.unitName,
            agencyId: item.agencyId,
            transitionedToVacancy: true,
            archived: true,
            vacancy: {
              dateVacated: vacancyData.dateVacated,
              newTenantFound: 'No'
            }
          },
          this.resourceTypes.UNIT,
          item.id
        )

        this.properties = this.properties.filter(prop => prop.id !== item.id)
        this.filteredProperties = this.filteredProperties.filter(prop => prop.id !== item.id)
        
        this.showSuccessDialog(`${item.propertyName || item.unitName} has been moved to Vacancies!`, 'Success!', 'OK')
      } catch (error) {
        if (error.message !== 'User cancelled') {
          console.error('Error moving unit to vacancies:', error)
        }
      }
    },
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          // Agency users and Agency Admin users can only see their own agency
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
            this.selectedAgency = agencyData.id;
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
      } finally {
        this.agenciesLoading = false;
      }
    },

    async fetchProperties(agencyId = null) {
      this.propertiesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        let unitsQuery;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          // Agency users and Agency Admin users can only see their own units
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
            this.properties = [];
            this.filterProperties();
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
        
        // Fetch all vacancies to exclude units with active vacancies
        const vacanciesQuery = collection(db, 'vacancies');
        const vacanciesSnapshot = await getDocs(vacanciesQuery);
        
        // Create a Set of unit IDs and unit names that have active vacancies
        const vacantUnitIds = new Set();
        const vacantUnitNames = new Set();
        
        vacanciesSnapshot.docs.forEach(doc => {
          const vacancy = doc.data();
          if (vacancy.unitId) {
            vacantUnitIds.add(vacancy.unitId);
          }
          if (vacancy.unitName) {
            vacantUnitNames.add(vacancy.unitName);
          }
        });
        
        // Filter out units that have active vacancies
        this.properties = querySnapshot.docs
          .map(doc => {
            const data = doc.data()
            return {
              ...data,
              id: doc.id,
              unitNumber: data.unitNumber || '',
              monthsMissed: (typeof data.monthsMissed === 'number' ? data.monthsMissed : 0)
            }
          })
          .filter(unit => {
            // Exclude if unit ID is in vacancies
            if (vacantUnitIds.has(unit.id)) {
              return false;
            }
            // Exclude if unit name/propertyName is in vacancies
            if (unit.propertyName && vacantUnitNames.has(unit.propertyName)) {
              return false;
            }
            if (unit.unitName && vacantUnitNames.has(unit.unitName)) {
              return false;
            }
            return true;
          });
        
        // If Super Admin, also refresh flagged units map for the same scope
        if (this.isSuperAdmin) {
          await this.fetchFlaggedUnits(agencyId);
        }

        // Apply initial filtering
        this.filterProperties();
        console.log('Properties fetched:', this.properties);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        this.propertiesLoading = false;
      }
    },

    async fetchFlaggedUnits(agencyId = null) {
      try {
        let flaggedQuery;
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;

        if (userType === 'Agency') {
          // Agencies don't need flags here; return early
          this.flaggedUnitMap = {};
          this.flaggedUnitNamesMap = {};
          return;
        }

        if (agencyId) {
          flaggedQuery = query(
            collection(db, 'flaggedUnits'),
            where('agencyId', '==', agencyId)
          );
        } else {
          flaggedQuery = collection(db, 'flaggedUnits');
        }

        const snapshot = await getDocs(flaggedQuery);
        const byId = {};
        const byName = {};
        snapshot.docs.forEach(d => {
          const data = d.data();
          const flaggedDocId = d.id;
          if (data?.unitId) byId[data.unitId] = flaggedDocId;
          const name = (data?.unitName || '').toLowerCase();
          if (name) byName[name] = flaggedDocId;
        });
        this.flaggedUnitMap = byId;
        this.flaggedUnitNamesMap = byName;
      } catch (error) {
        console.error('Error fetching flagged units map:', error);
        this.flaggedUnitMap = {};
        this.flaggedUnitNamesMap = {};
      }
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }
      
      if (agencyId) {
        // Fetch properties for selected agency
        this.fetchProperties(agencyId);
        if (this.isSuperAdmin) this.fetchFlaggedUnits(agencyId);
      } else {
        // Fetch all properties when no agency is selected
        this.fetchProperties();
        if (this.isSuperAdmin) this.fetchFlaggedUnits();
      }
    },
    
    addUnit() {
      console.log("Adding new unit");
      this.$router.push('/add-unit');
    },
  },
  watch: {
    // React to global agency scope changes
    globalAgencyId: {
      immediate: false,
      handler(newId, oldId) {
        if (newId !== oldId) {
          this.selectedAgency = newId || null;
          if (this.isAgencyUser) {
            this.fetchProperties();
          } else {
            this.fetchProperties(newId || undefined);
            if (this.isSuperAdmin) this.fetchFlaggedUnits(newId || undefined);
          }
        }
      }
    }
  },
  async mounted() {
    document.title = "Active Units - Depsure";
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch properties based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own units
      await this.fetchProperties();
    } else {
      // Super Admin/Admin users: if a global agency is selected, scope to it
      if (this.globalAgencyId) {
        this.selectedAgency = this.globalAgencyId;
        await this.fetchProperties(this.globalAgencyId);
        if (this.isSuperAdmin) await this.fetchFlaggedUnits(this.globalAgencyId);
      } else {
        // Otherwise load all
        await this.fetchProperties();
        if (this.isSuperAdmin) await this.fetchFlaggedUnits(this.selectedAgency);
      }
    }
  },
};
</script>

<style scoped>
.view-agency-page {
  padding: 20px;
  min-height: 100vh;
 
}

/* Back button styling to match system buttons */
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

/* Table card styling - less curved */
.table-card {
  border-radius: 6px !important;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  margin-top: 8px;
}

:deep(.v-data-table) {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.v-data-table__wrapper) {
  border-radius: 12px;
  min-height: 400px;
}


/* Kill all internal padding on the card shell; v-card-title / v-card-text have their own spacing */
.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0;
  position: relative;
}

/* Background image layer */
.agency-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Remove row/column gutters so the image sits flush with the top/edges */
.no-gutters {
  --v-gutter-x: 0;
  --v-gutter-y: 0;
  margin: 0 !important;
}

/* Make the image fill its column completely with no top padding */
.agency-logo-black {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Right-side details */
.agency-details-black {
  margin-bottom: 16px;
}

/* Dark right-to-left gradient overlay behind info */
.agency-info-card-black::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to left, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.0) 100%);
  pointer-events: none;
}
.agency-info-card-black .no-gutters,
.agency-info-card-black .v-row {
  position: relative;
  z-index: 1;
}

/* Content aligned to the right dark area */
.agency-content-right {
  margin-left: auto;
  width: min(720px, 55%);
  padding: 16px 16px 24px;
  text-align: left;
}

.detail-item-black {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #ffffff;
}

.agency-description-black {
  font-size: 1rem;
  line-height: 1.6;
  color: #e0e0e0;
  margin: 0;
}

/* Hero card styles */
.agency-hero-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 220px;
}

.agency-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.agency-hero-gradient { position:absolute; inset:0; background: linear-gradient(to left, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0)); }
.agency-hero-content {
  position: relative;
  z-index: 1;
  padding: 16px;
}
.agency-hero-center { position: absolute; inset: 0; z-index: 2; display:flex; align-items:center; justify-content:center; padding:0 16px; color:#fff; font-weight:800; font-size:1.6rem; text-align:center; letter-spacing:.3px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
.agency-hero-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 8px; }
.agency-hero-details .detail-item-black { color: #ffffff; }

/* Search field styling to match agency page */
.custom-input .v-field {
  border-radius: 8px;
}

.search-field {
  max-width: 300px;
}

/* Truncate long table cell values without breaking layout */
.truncate-cell {
  display: inline-block;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  font-weight: 500;
  color: #333;
}

/* Better chip styling in table */
:deep(.v-chip) {
  font-weight: 600 !important;
  letter-spacing: 0.3px;
  padding: 4px 12px !important;
  height: 28px !important;
}

/* Loading state styling */
:deep(.v-data-table-progress) {
  background: linear-gradient(90deg, #000 0%, #333 50%, #000 100%);
  height: 3px !important;
}

/* Pagination styling */
:deep(.v-data-table-footer) {
  padding: 16px !important;
  background-color: #fafbfc !important;
  border-top: 2px solid #e9ecef !important;
}

/* Avoid month input truncation */
.month-input :deep(input) {
  min-width: 160px;
}

/* Custom month menu styling */
.month-menu {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  padding: 12px;
  min-width: 260px;
}
.month-menu__title {
  font-weight: 600;
  margin-bottom: 8px;
}
.month-menu__input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
}
.month-menu__input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.08);
}
.month-menu__actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
.square-meter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fa;
  border: 1px solid #e0e4ea;
  border-radius: 12px;
  padding: 16px 20px;
}
.square-meter-summary .summary-title {
  font-weight: 600;
  color: #0a2f3d;
}
.square-meter-summary .summary-value {
  font-weight: 700;
  font-size: 1.25rem;
  color: #0a2f3d;
}

/* Action Button Styling */
.action-btn {
  margin: 0 2px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 36px;
  min-height: 36px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: rgba(0, 0, 0, 0.04);
}

/* Clean agency name-only header */
.agency-name-card { border-radius: 10px; border: 1px solid #e9e9e9; background: #fff; }
.agency-name-text { text-align: center; font-weight: 700; font-size: 1.25rem; padding: 12px 16px; color: #111; }

/* Static hero with image, centered title (no overlay) */
.agency-hero-card { position: relative; border-radius: 12px; overflow: hidden; min-height: 180px; }
.agency-hero-bg { position: absolute; inset: 0; background-position: center; background-size: cover; background-repeat: no-repeat; }
.agency-hero-center { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 0 16px; color: #fff; font-weight: 800; font-size: 1.6rem; text-align: center; letter-spacing: 0.3px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }

/* Custom table header styling - black headers */
:deep(.custom-header .v-data-table-header) {
  background-color: #000000 !important;
}

:deep(.custom-header .v-data-table-header th) {
  background-color: #000000 !important;
  color: white !important;
  font-weight: 700 !important;
  padding: 18px 16px !important;
  font-size: 0.875rem !important;
  letter-spacing: 0.5px !important;
  border-bottom: 2px solid #333 !important;
}

:deep(.custom-header .v-data-table-header .v-data-table-header__content) {
  color: white !important;
  font-weight: 700 !important;
}

:deep(.custom-header .v-data-table__td) {
  padding: 16px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  font-size: 0.9rem !important;
}

:deep(.custom-header tbody tr:hover) {
  background-color: #f8f9fa !important;
  cursor: pointer;
}

:deep(.custom-header tbody tr) {
  transition: background-color 0.2s ease;
}

:deep(.custom-header tbody tr:nth-child(even)) {
  background-color: #fafbfc;
}

:deep(.custom-header tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
}

/* Action buttons alignment */
.v-data-table_actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-agency-page {
    padding: 10px;
  }
  
  .search-field {
    max-width: 100%;
  }
  
  .back-btn {
    width: 140px;
    height: 40px;
  }
  
  .action-btn {
    font-size: 0.7rem;
    padding: 6px 8px;
  }
  
  .agency-info-card-black {
    text-align: center;
  }

  .agency-content-right {
    width: 100%;
  }

  /* Full-bleed image on mobile as well */
  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px; /* give it a nice visible height when stacked */
    object-fit: cover;
  }
}
</style>
