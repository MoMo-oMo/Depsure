<template>
  <div class="onboard-units-page">
    <v-container fluid>
      <!-- Visible to all roles; actions are gated by role -->

        <!-- Filters -->
        <v-row class="mb-4">
          <!-- Month filter -->
          <v-col cols="12" md="3" lg="3" class="pa-4">
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
                  label="September / All Dates"
                  append-inner-icon="mdi-calendar-month"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  class="custom-input top-filter month-input"
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
          <v-col cols="12" md="3" lg="3" class="pa-4">
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
              @update:model-value="filterUnits"
            />
          </v-col>

          <!-- Search Unit -->
          <v-col cols="12" md="3" lg="3" class="pa-4">
            <v-text-field
              v-model="searchQuery"
              label="Search Unit"
              prepend-inner-icon="mdi-magnify"
              density="comfortable"
              variant="outlined"
              clearable
              hide-details
              class="custom-input top-filter"
              @input="filterUnits"
            />
          </v-col>

          <!-- All/Flagged toggle -->
          <v-col cols="12" md="3" lg="3" class="pa-4">
            <v-select
              v-model="flaggedFilter"
              :items="flaggedFilterOptions"
              item-title="title"
              item-value="value"
              label="All Units / Flagged Units"
              density="comfortable"
              variant="outlined"
              hide-details
              class="custom-input top-filter"
              @update:model-value="filterUnits"
            />
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

        <!-- Header image with centered title -->
        <v-row class="mb-4">
          <v-col cols="12">
            <v-card class="hero-card" elevation="1">
              <div class="hero-bg" :style="heroBgStyle"></div>
              <div class="hero-center">Onboarded Units</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Units Table -->
        <v-row>
          <v-col cols="12" class="pa-4">
            <v-data-table
              :headers="tableHeaders"
              :items="filteredUnits"
              :search="searchQuery"
              class="custom-header"
              density="comfortable"
              hover
              :loading="loading"
              no-data-text="No units to display"
            >
              <template #item.propertyType="{ item }">
                <v-chip :color="getColor(item.propertyType)" size="small" variant="elevated">
                  {{ getLabel(item.propertyType) }}
                </v-chip>
              </template>
              <template #item.onboardingDate="{ item }">
                {{ formatDate(item.leaseStartDate) }}
              </template>
              <template #item.leaseEndDate="{ item }">
                {{ formatDate(item.leaseEndDate) }}
              </template>
              <template #item.actions="{ item }">
                <div class="actions">
                  <!-- Agency actions -->
                  <template v-if="isAgencyRole">
                    <v-btn
                      :icon="item.isFlagged ? 'mdi-flag' : 'mdi-flag-outline'"
                      :color="item.isFlagged ? 'error' : 'grey-darken-1'"
                      variant="text"
                      size="small"
                      :title="item.isFlagged ? 'Unflag' : 'Flag'"
                      @click="toggleFlag(item)"
                    />
                    <v-btn
                      icon="mdi-wrench"
                      color="black"
                      variant="text"
                      size="small"
                      title="Maintenance"
                      @click="openMaintenance(item)"
                    />
                    <v-btn
                      icon="mdi-calendar-export"
                      color="black"
                      variant="text"
                      size="small"
                      title="Set Vacate Date"
                      @click="setVacateDate(item)"
                    />
                  </template>
                  <!-- View-only actions for Admin/Super Admin -->
                  <v-btn
                    icon="mdi-file-document"
                    color="black"
                    variant="text"
                    size="small"
                    title="Unit Documents"
                    @click="viewDocuments(item)"
                  />
                  <v-btn
                    icon="mdi-clipboard-check"
                    color="black"
                    variant="text"
                    size="small"
                    title="Inspections"
                    @click="viewInspections(item)"
                  />
                </div>
              </template>
            </v-data-table>
          </v-col>
        </v-row>


      
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
const heroBg = 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
import { collection, getDocs, query, where, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { usePropertyType } from '@/composables/usePropertyType'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { PROPERTY_TYPES } from '@/constants/propertyTypes'

const SQUARE_METER_TYPES = [PROPERTY_TYPES.COMMERCIAL, PROPERTY_TYPES.INDUSTRIAL]

export default {
  name: 'OnboardUnitsPage',
  setup() {
    const appStore = useAppStore()
    const { getOptions, getLabel, getColor } = usePropertyType()
    const { showConfirmDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return { appStore, getOptions, getLabel, getColor, showConfirmDialog, logAuditEvent, auditActions, resourceTypes }
  },
  data() {
    return {
      searchQuery: '',
      monthFilter: '',
      monthMenu: false,
      tempMonth: '',
      propertyTypeFilter: null,
      flaggedFilter: 'all',
      loading: false,
      units: [],
      filteredUnits: [],
      // Cache for quick lookups
      noticeUnitIds: new Set(),
      noticeUnitNames: new Set(),
      vacancyUnitIds: new Set(),
      vacancyUnitNames: new Set(),
      headers: [
        { title: 'UNIT NAME', key: 'propertyName', sortable: true },
        { title: 'UNIT NUMBER', key: 'unitNumber', sortable: true },
        { title: 'TYPE', key: 'propertyType', sortable: true, align: 'center' },
        { title: 'ONBOARDING DATE', key: 'onboardingDate', sortable: true, align: 'center' },
        { title: 'LEASE END DATE', key: 'leaseEndDate', sortable: true, align: 'center' },
        { title: 'ACTIONS', key: 'actions', sortable: false, align: 'center' },
      ],
    }
  },
  computed: {
    isAgencyRole() {
      const user = this.appStore.currentUser
      // Agency and Agency-scoped Admins
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
    },
    tableHeaders() { return this.headers },
    propertyTypeFilterOptions() {
      return [ { value: null, title: 'All Types' }, ...this.getOptions() ]
    },
    flaggedFilterOptions() {
      return [ { value: 'all', title: 'All Units' }, { value: 'only', title: 'Flagged Only' } ]
    },
    monthFilterLabel() {
      if (!this.monthFilter) return 'All Dates'
      try {
        const [yy, mm] = String(this.monthFilter).split('-')
        const d = new Date(Number(yy), Number(mm) - 1, 1)
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      } catch { return this.monthFilter }
    },
    heroBgStyle() {
      return { background: `url(${heroBg}) center/cover no-repeat` }
    },
    showSquareMeterageSummary() {
      return SQUARE_METER_TYPES.includes(this.propertyTypeFilter)
    },
    squareMeterageTotal() {
      if (!SQUARE_METER_TYPES.includes(this.propertyTypeFilter)) return 0
      return (this.filteredUnits || []).reduce((sum, unit) => {
        return sum + this.parseSquareMeterage(unit?.squareMeterage)
      }, 0)
    },
    squareMeterageTotalFormatted() {
      if (!this.showSquareMeterageSummary) return ''
      return this.squareMeterageTotal.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    },
    squareMeterageSummaryLabel() {
      if (!SQUARE_METER_TYPES.includes(this.propertyTypeFilter)) return ''
      return this.getLabel(this.propertyTypeFilter) || ''
    }
  },
  methods: {
    onMonthMenuToggle(open) { if (open) this.tempMonth = this.monthFilter || '' },
    applyMonth() { this.monthFilter = this.tempMonth || ''; this.filterUnits(); this.monthMenu = false },
    clearMonth() { this.tempMonth = ''; this.monthFilter = ''; this.filterUnits(); this.monthMenu = false },
    parseSquareMeterage(value) {
      if (value === null || value === undefined || value === '') return 0
      const numeric = typeof value === 'number' ? value : Number(value)
      return Number.isFinite(numeric) && numeric > 0 ? numeric : 0
    },
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    },
    formatDate(v) {
      if (!v) return ''
      try {
        const d = typeof v.toDate === 'function' ? v.toDate() : new Date(v)
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yy = d.getFullYear()
        return `${dd}/${mm}/${yy}`
      } catch { return String(v) }
    },
    filterUnits() {
      const term = (this.searchQuery || '').toLowerCase()
      this.filteredUnits = (this.units || []).filter(u => {
        const textMatch = (
          (u.propertyName || '').toLowerCase().includes(term) ||
          (u.unitNumber || '').toLowerCase().includes(term)
        )

        // Property type filter
        const typeMatch = this.propertyTypeFilter ? u.propertyType === this.propertyTypeFilter : true

        // Month filter based on leaseStartDate (onboarding date)
        let monthMatch = true
        if (this.monthFilter) {
          const d = u.leaseStartDate ? (typeof u.leaseStartDate.toDate === 'function' ? u.leaseStartDate.toDate() : new Date(u.leaseStartDate)) : null
          if (!d) monthMatch = false
          else {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            monthMatch = key === this.monthFilter
          }
        }

        // Flagged filter
        const flaggedMatch = this.flaggedFilter === 'only' ? (u.isFlagged === true || u.isFlagged === 'Yes') : true

        // Exclude units that have an active notice or vacancy
        const unitNameKey = (u.propertyName || u.unitName || '').toString()
        const hasNotice = this.noticeUnitIds.has(u.id) || (unitNameKey && this.noticeUnitNames.has(unitNameKey))
        const hasVacancy = this.vacancyUnitIds.has(u.id) || (unitNameKey && this.vacancyUnitNames.has(unitNameKey))
        const availabilityMatch = !(hasNotice || hasVacancy)

        return textMatch && typeMatch && monthMatch && flaggedMatch && availabilityMatch
      })
    },
    async fetchUnits() {
      this.loading = true
      try {
        const user = this.appStore.currentUser
        let agencyId = null
        if (this.isAgencyRole) {
          if (user?.userType === 'Agency') agencyId = user.uid
          else if (user?.userType === 'Admin' && user?.adminScope === 'agency') agencyId = user.managedAgencyId
        } else {
          agencyId = this.appStore.currentAgency?.id || null
        }

        // Fetch units, notices, and vacancies in parallel for better performance
        const unitsPromise = agencyId
          ? getDocs(query(collection(db, 'units'), where('agencyId', '==', agencyId)))
          : getDocs(collection(db, 'units'))
        const [unitsSnap, noticesSnap, vacanciesSnap] = await Promise.all([
          unitsPromise,
          // Only consider Active notices when excluding from Onboarded Units,
          // and scope by agency when available to avoid cross-agency name collisions
          agencyId
            ? getDocs(query(collection(db, 'notices'), where('status', '==', 'Active'), where('agencyId', '==', agencyId)))
            : getDocs(query(collection(db, 'notices'), where('status', '==', 'Active'))),
          // Scope vacancies by agency when available
          agencyId
            ? getDocs(query(collection(db, 'vacancies'), where('agencyId', '==', agencyId)))
            : getDocs(collection(db, 'vacancies'))
        ])
        
        // Cache notices for quick lookups
        this.noticeUnitIds = new Set()
        this.noticeUnitNames = new Set()
        noticesSnap.docs.forEach(doc => {
          const notice = doc.data()
          if (notice.unitId) this.noticeUnitIds.add(notice.unitId)
          if (notice.unitName) this.noticeUnitNames.add(notice.unitName)
        })
        
        // Cache vacancies for quick lookups
        this.vacancyUnitIds = new Set()
        this.vacancyUnitNames = new Set()
        vacanciesSnap.docs.forEach(doc => {
          const vacancy = doc.data()
          if (vacancy.unitId) this.vacancyUnitIds.add(vacancy.unitId)
          if (vacancy.unitName) this.vacancyUnitNames.add(vacancy.unitName)
        })
        
        const all = unitsSnap.docs.map(d => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            unitNumber: data.unitNumber || '' // Ensure unitNumber is always present
          }
        })
        
        // By default, show only units marked as new occupation if present
        const onboard = all.filter(u => (u.newOccupation || '').toString().toLowerCase() === 'yes')
        this.units = onboard.length ? onboard : all
        this.filterUnits()
      } catch (e) {
        console.error('Error fetching onboard units:', e)
      } finally {
        this.loading = false
      }
    },
    async toggleFlag(item) {
      try {
        const willFlag = !(item.isFlagged === true || item.isFlagged === 'Yes')
        await updateDoc(doc(db, 'units', item.id), { isFlagged: willFlag })
        item.isFlagged = willFlag

        const name = item.propertyName || item.unitName || ''
        if (willFlag) {
          const existingId = await this.findExistingFlagged(item)
          if (!existingId) {
            const flaggedData = {
              agencyId: item.agencyId || this.appStore.currentAgency?.id || '',
              unitId: item.id,
              unitName: name,
              unitNumber: item.unitNumber || item.propertyNumber || '',
              dateFlagged: new Date().toISOString().slice(0,10),
              createdAt: new Date(),
              updatedAt: new Date()
            }
            await addDoc(collection(db, 'flaggedUnits'), flaggedData)
          }
        } else {
          const existingId = await this.findExistingFlagged(item)
          if (existingId) await deleteDoc(doc(db, 'flaggedUnits', existingId))
        }

        this.filterUnits()
      } catch (e) {
        console.error('Toggle flag failed:', e)
      }
    },
    viewProperty(item) {
      this.$router.push({ path: `/view-property-${item.id}` , query: { from: 'onboard' } })
    },
    editProperty(item) {
      // Open Property Details only (hide Documents tab for agency flow)
      this.$router.push({ path: `/edit-property-${item.id}`, query: { from: 'onboard', tab: 'details', lock: 'details' } })
    },
    viewDocuments(item) {
      // Open read-only Documents page for onboard flow
      this.$router.push({ path: `/property-documents-${item.id}`, query: { from: 'onboard' } })
    },
    async viewInspections(item) {
      try {
        // Try to find an existing inspection for this unit
        let foundId = await this.findExistingInspection(item)
        
        if (!foundId) {
          // If no inspection exists, create one first
          const user = this.appStore.currentUser || {}
          const fallbackAgencyId = user?.userType === 'Agency' ? (user.uid || '')
                                  : (user?.userType === 'Admin' && user?.adminScope === 'agency') ? (user.managedAgencyId || '')
                                  : ''
          const agencyId = item.agencyId || this.appStore.currentAgency?.id || fallbackAgencyId || ''
          
          const inspectionData = {
            agencyId,
            unitId: item.id,
            unitName: item.propertyName || item.unitName || '',
            inspectionRequired: 'Yes',
            contactPerson: item.contactPerson || '',
            contactNumber: item.contactNumber || '',
            appointmentMade: 'No',
            inspectionDate: '',
            quotesNeeded: 'No',
            status: 'Pending',
            priority: 'Medium',
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          const ref = await addDoc(collection(db, 'inspections'), inspectionData)
          foundId = ref.id
        }
        
        // Navigate to view inspection page with the inspection ID
        this.$router.push({ path: `/view-inspection-${foundId}`, query: { from: 'onboard' } })
      } catch (e) {
        console.error('Open inspection failed:', e)
      }
    },
    async openMaintenance(item) {
      try {
        let foundId = await this.findExistingMaintenance(item)
        if (!foundId) {
          const user = this.appStore.currentUser || {}
          const fallbackAgencyId = user?.userType === 'Agency' ? (user.uid || '')
                                  : (user?.userType === 'Admin' && user?.adminScope === 'agency') ? (user.managedAgencyId || '')
                                  : ''
          const agencyId = item.agencyId || this.appStore.currentAgency?.id || fallbackAgencyId || ''
          const data = {
            agencyId,
            unitId: item.id,
            unitName: item.propertyName || item.unitName || '',
            unitNumber: item.unitNumber || '',
            noticeGiven: 'No',
            vacateDate: '',
            contactNumber: item.contactNumber || '',
            address: item.address || '',
            status: 'Pending',
            priority: 'Medium',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          const ref = await addDoc(collection(db, 'maintenance'), data)
          foundId = ref.id
        }
        this.$router.push({ path: `/edit-maintenance-${foundId}`, query: { from: 'onboard' } })
      } catch (e) {
        console.error('Open maintenance failed:', e)
      }
    },
    async setVacateDate(item) {
      try {
        const { showPromptDialog, showSuccessDialog, showErrorDialog } = useCustomDialogs()
        
        // Check if unit already has a notice using cached data (instant!)
        const unitName = item.propertyName || item.unitName || ''
        const hasNotice = this.noticeUnitIds.has(item.id) || 
                         (unitName && this.noticeUnitNames.has(unitName))
        
        if (hasNotice) {
          showErrorDialog('Error: Notice has already been added.', 'Notice Exists', 'OK')
          return
        }
        
        // Check if unit already has a vacancy using cached data (instant!)
        const hasVacancy = this.vacancyUnitIds.has(item.id) || 
                          (unitName && this.vacancyUnitNames.has(unitName))
        
        if (hasVacancy) {
          showErrorDialog('Vacancy exists. Wait till it gets added as an active unit.', 'Vacancy Exists', 'OK')
          return
        }
        
        // Show date picker dialog with appropriate label for agency users
        const dialogTitle = this.isAgencyRole ? 'Set Lease End Date' : 'Set Vacate Date'
        const dialogMessage = this.isAgencyRole 
          ? `Set lease end date for ${item.propertyName || item.unitName || 'this unit'}:`
          : `Set vacate date for ${item.propertyName || item.unitName || 'this unit'}:`
        
        const vacateDate = await showPromptDialog({
          title: dialogTitle,
          message: dialogMessage,
          inputType: 'date',
          confirmText: 'Save',
          cancelText: 'Cancel'
        })
        
        if (!vacateDate) return
        
        // Update unit with vacate date and status
        await updateDoc(doc(db, 'units', item.id), {
          vacateDate: vacateDate,
          status: 'Notice Given',
          updatedAt: new Date()
        })
        
        // Auto-create or update notice
        const user = this.appStore.currentUser || {}
        const agencyName = user?.agencyName || item.agencyName || 'Unknown Agency'
        const agentName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Unknown Agent'
        
        // Check if notice already exists for this unit
        const existingNoticeQuery = query(
          collection(db, 'notices'),
          where('unitId', '==', item.id)
        )
        const existingNoticeSnapshot = await getDocs(existingNoticeQuery)
        
        const baseNoticeData = {
          agencyId: item.agencyId || this.appStore.currentAgency?.id || '',
          agencyName: agencyName,
          unitId: item.id,
          unitName: item.propertyName || item.unitName || '',
          propertyName: item.propertyName || '',
          tenantName: item.tenantRef || item.tenantName || 'N/A',
          agentName: agentName,
          vacateDate: vacateDate,
          leaseEndDate: vacateDate, // Lease end date is same as vacate date
          noticeGivenDate: new Date().toISOString().slice(0, 10),
          status: 'Active',
          leaseStartDate: item.leaseStartDate || '',
          propertyType: item.propertyType || 'residential',
          monthsMissedRent: (typeof item.monthsMissed === 'number' ? item.monthsMissed : Number(item.monthsMissed) || 0),
          updatedAt: new Date()
        }
        
        let noticeId = null;
        if (!existingNoticeSnapshot.empty) {
          // Update existing notice
          noticeId = existingNoticeSnapshot.docs[0].id
          await updateDoc(doc(db, 'notices', noticeId), baseNoticeData)
        } else {
          // Create new notice
          const newNoticeData = {
            ...baseNoticeData,
            createdAt: new Date()
          }
          const noticeRef = await addDoc(collection(db, 'notices'), newNoticeData)
          noticeId = noticeRef.id
          
          // Update cache with new notice
          this.noticeUnitIds.add(item.id)
          if (item.propertyName || item.unitName) {
            this.noticeUnitNames.add(item.propertyName || item.unitName)
          }
        }
        
        // Mark the unit with "Notice Given" status and link to notice
        await updateDoc(doc(db, 'units', item.id), {
          status: 'Notice Given',
          noticeId: noticeId,
          vacateDate: vacateDate,
          updatedAt: new Date()
        })
        
        // Update local state and optimistically remove from view
        item.vacateDate = vacateDate
        item.status = 'Notice Given'
        // Ensure immediate removal without waiting for re-fetch
        this.units = (this.units || []).filter(u => u.id !== item.id)
        this.filteredUnits = (this.filteredUnits || []).filter(u => u.id !== item.id)
        this.filterUnits()
        
        // Show success message
        const successDateLabel = this.isAgencyRole ? 'lease end date' : 'vacate date'
        showSuccessDialog(
          `Notice recorded for ${item.propertyName || item.unitName} — ${successDateLabel}: ${new Date(vacateDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
          'Success',
          'OK'
        )
      } catch (e) {
        if (e?.message === 'User cancelled') return
        console.error('Set vacate date failed:', e)
        const { showErrorDialog } = useCustomDialogs()
        const errorMessage = this.isAgencyRole 
          ? 'Failed to set lease end date. Please try again.'
          : 'Failed to set vacate date. Please try again.'
        showErrorDialog(errorMessage, 'Error', 'OK')
      }
    },
    async openVacancy(item) {
      try {
        let foundId = await this.findExistingVacancy(item)
        if (!foundId) {
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
          unitNumber: item.unitNumber || '',
          tenantRef: item.tenantRef || '',
          dateVacated: '',
          leaseStartDate: normalizeDateValue(item.leaseStartDate),
          leaseEndDate: '', // Empty for new tenant
          moveInDate: null,
          propertyManager: item.propertyManager || '',
          contactNumber: item.contactNumber || '',
          newOccupation: item.newOccupation || '',
          contractorRequested: item.contractorRequested || '',
          maintenanceAmount: item.maintenanceAmount || 0,
          monthsMissed: item.monthsMissed || 0,
          paidTowardsFund: 0, // Empty for new tenant
          amountToBePaidOut: 0, // Empty for new tenant
          paidOut: '', // Empty for new tenant
          newTenantRef: '', // Empty for new tenant
          notes: '',
          propertyType: item.propertyType || 'residential',
          createdAt: new Date(),
          updatedAt: new Date()
        }
          const ref = await addDoc(collection(db, 'vacancies'), vacancyData)
          foundId = ref.id
          
          // Update cache with new vacancy
          this.vacancyUnitIds.add(item.id)
          if (item.propertyName || item.unitName) {
            this.vacancyUnitNames.add(item.propertyName || item.unitName)
          }
        }
        this.$router.push({ path: `/edit-vacancy-${foundId}`, query: { from: 'onboard' } })
      } catch (e) {
        console.error('Open vacancy failed:', e)
      }
    },
    async findExistingMaintenance(item) {
      try {
        const name = item.propertyName || item.unitName || ''
        let q1 = query(collection(db, 'maintenance'), where('unitId', '==', item.id))
        let s1 = await getDocs(q1)
        if (!s1.empty) return s1.docs[0].id
        let q2 = query(collection(db, 'maintenance'), where('unitName', '==', name))
        let s2 = await getDocs(q2)
        const m2 = s2.docs.find(d => (d.data()?.agencyId || '') === (item.agencyId || ''))
        if (m2) return m2.id
        return null
      } catch (e) { console.warn('findExistingMaintenance error', e); return null }
    },
    async findExistingVacancy(item) {
      try {
        const name = item.propertyName || item.unitName || ''
        let q1 = query(collection(db, 'vacancies'), where('unitId', '==', item.id))
        let s1 = await getDocs(q1)
        if (!s1.empty) return s1.docs[0].id
        let q2 = query(collection(db, 'vacancies'), where('unitName', '==', name))
        let s2 = await getDocs(q2)
        const v2 = s2.docs.find(d => (d.data()?.agencyId || '') === (item.agencyId || ''))
        if (v2) return v2.id
        return null
      } catch (e) { console.warn('findExistingVacancy error', e); return null }
    },
    async findExistingFlagged(item) {
      try {
        const name = item.propertyName || item.unitName || ''
        const number = item.unitNumber || item.propertyNumber || ''
        
        // First try to find by unitName
        let q = query(collection(db, 'flaggedUnits'), where('unitName', '==', name))
        let snapshot = await getDocs(q)
        
        if (snapshot.empty) return null
        
        // If we have a unit number, try to match by both name and number
        if (number) {
          const match = snapshot.docs.find(d => d.data()?.unitNumber === number)
          if (match) return match.id
        }
        
        // Otherwise return the first match by name
        return snapshot.docs[0].id
      } catch (e) { console.warn('findExistingFlagged error', e); return null }
    },
    async findExistingInspection(item) {
      try {
        const name = item.propertyName || item.unitName || ''
        let q1 = query(collection(db, 'inspections'), where('unitId', '==', item.id))
        let s1 = await getDocs(q1)
        if (!s1.empty) return s1.docs[0].id
        let q2 = query(collection(db, 'inspections'), where('unitName', '==', name))
        let s2 = await getDocs(q2)
        const i2 = s2.docs.find(d => (d.data()?.agencyId || '') === (item.agencyId || ''))
        if (i2) return i2.id
        return null
      } catch (e) { console.warn('findExistingInspection error', e); return null }
    }
  },
  async mounted() {
    document.title = 'Onboard Units - Depsure'
    await this.fetchUnits()
  }
}
</script>

<style scoped>
.onboard-units-page { padding: 20px; min-height: 100vh; }

.hero-card { position: relative; border-radius: 12px; overflow: hidden; min-height: 160px; }
.hero-bg { position: absolute; inset: 0; background-position: center; background-size: cover; background-repeat: no-repeat; }
.hero-center { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center; padding: 0 16px; color: #fff; font-weight: 800; font-size: 1.4rem; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }

.custom-input .v-field { border-radius: 8px; }

/* Month menu styling */
.month-menu { background: #fff; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); padding: 12px; min-width: 260px; }
.month-menu__title { font-weight: 600; margin-bottom: 8px; }
.month-menu__input { width: 100%; padding: 8px 10px; border: 1px solid #d0d0d0; border-radius: 8px; }
.month-menu__input:focus { outline: none; border-color: #000; box-shadow: 0 0 0 2px rgba(0,0,0,0.08); }
.month-menu__actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 10px; }
.square-meter-summary { display: flex; align-items: center; justify-content: space-between; background: #f5f7fa; border: 1px solid #e0e4ea; border-radius: 12px; padding: 16px 20px; }
.square-meter-summary .summary-title { font-weight: 600; color: #0a2f3d; }
.square-meter-summary .summary-value { font-weight: 700; font-size: 1.25rem; color: #0a2f3d; }

.actions { display: inline-flex; align-items: center; gap: 6px; }

/* Dark table header like design */
:deep(.custom-header .v-data-table-header) { background-color: #0a2f3d !important; }
:deep(.custom-header .v-data-table-header th) { background-color: #0a2f3d !important; color: white !important; }
:deep(.custom-header .v-data-table-header .v-data-table-header__content) { color: white !important; }

@media (max-width: 768px) {
  .onboard-units-page { padding: 10px; }
}
</style>
