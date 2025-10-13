<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      <!-- Filters and Action Buttons -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3">
          <v-text-field
            v-model="searchQuery"
            label="Search vacancy entries..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterVacancies"
          />
        </v-col>

        <!-- Property Type Filter -->
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
            @update:model-value="filterVacancies"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="2" lg="3">
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
                label="Filter by creation month"
                append-inner-icon="mdi-calendar-month"
                flat
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
              <input type="month" :value="tempMonth" @input="(e)=>{ tempMonth = e.target.value }" class="month-menu__input" />
              <div class="month-menu__actions">
                <v-btn color="black" variant="elevated" size="small" @click="applyMonth">Apply</v-btn>
                <v-btn color="grey" variant="text" size="small" @click="clearMonth">All</v-btn>
              </div>
            </div>
          </v-menu>
        </v-col>

        <!-- Add Vacancy Button - Only visible to Agency users -->
        <v-col cols="12" md="2" lg="2" class="d-flex align-center" v-if="isAgencyUser">
          <v-btn @click="addVacancy" class="back-btn">Add Vacancy</v-btn>
        </v-col>

        <!-- Export to Excel Button -->
        <v-col class="d-flex align-center justify-end" cols="12" lg="2" md="3">
          <v-btn class="back-btn mb-4 mx-4" :loading="exportLoading" @click="exportVacanciesXLSX">
            {{ exportLoading ? 'Exporting...' : 'Export to Excel' }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Clean Agency Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="agency-hero-card" elevation="1">
            <div class="agency-hero-bg" :style="agencyHeroBgStyle"></div>
            <div class="agency-hero-center">{{ heroTitle }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Vacancy Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredVacancies"
            :loading="vacanciesLoading"
            class="custom-header"
            density="comfortable"
            hover
            no-data-text="No data available"
          >
            <template #item.dateVacated="{ item }">
              {{ formatDate(item.dateVacated) }}
            </template>

            <template #item.propertyType="{ item }">
              <v-chip :color="getPropertyTypeColor(item.propertyType)" size="small" variant="outlined">
                {{ getPropertyTypeLabel(item.propertyType) }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn icon="mdi-eye" size="small" variant="text" color="black" @click="viewVacancy(item)" class="action-btn" title="View Vacancy" />
                <!-- Move to Active Units -->
                <v-btn 
                  icon="mdi-arrow-left-bold-box" 
                  size="small" 
                  variant="text" 
                  color="black" 
                  @click="openMoveToActive(item)" 
                  class="action-btn" 
                  title="Move to Active Units" 
                />
                <v-btn 
                  v-if="userType === 'Admin' || userType === 'Super Admin'"
                  icon="mdi-delete" 
                  size="small" 
                  variant="text" 
                  color="error" 
                  @click="deleteVacancy(item)" 
                  class="action-btn" 
                  title="Delete Vacancy"
                />
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <!-- Move to Active Units Modal (Forgot Password dialog style) -->
      <div v-if="moveToActive.open" class="notification-overlay" @click.self="closeMoveToActive">
        <div class="notification-dialog">
          <div class="notification-dialog-bg info"></div>
          <div class="notification-dialog-inner">
            <button class="notification-close" @click="closeMoveToActive">&times;</button>

            <div class="notification-icon info">
              <v-icon color="white" size="40">mdi-home</v-icon>
            </div>

            <h2 class="notification-title">Move to Active Units</h2>
            <p class="notification-message">Enter the new lease details before moving this unit back to Active.</p>

            <v-form ref="moveForm" v-model="moveToActive.valid" lazy-validation>
              <v-row class="tight-grid">
                <v-col cols="12" md="6">
                  <v-text-field :model-value="moveToActive.unitName" label="Unit Name" variant="outlined" class="custom-input" density="compact" readonly />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field :model-value="moveToActive.unitNumber" label="Unit Number" variant="outlined" class="custom-input" density="compact" readonly />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field :model-value="getPropertyTypeLabel(moveToActive.propertyType)" label="Unit Type" variant="outlined" class="custom-input" density="compact" readonly />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="moveToActive.leaseStartDate" label="Lease Start Date" type="date" variant="outlined" class="custom-input" density="compact" :rules="[v=>!!v||'Required']" required />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="moveToActive.tenantRef" label="New Tenant Reference" variant="outlined" class="custom-input" density="compact" :rules="[v=>!!v||'Required']" required />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="moveToActive.notes" label="Notes (optional)" variant="outlined" class="custom-input pl-3 pr-3" density="compact" rows="2" />
                </v-col>
                <v-col cols="12" v-if="moveToActive.error">
                  <div class="error-message">
                    <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                    {{ moveToActive.error }}
                  </div>
                </v-col>
              </v-row>
            </v-form>

            <div class="button-container">
              <button class="notification-button info" @click="submitMoveToActive" :disabled="!moveToActive.valid || moveToActive.loading">
                {{ moveToActive.loading ? 'Saving...' : 'Submit' }}
              </button>
              <button class="notification-button secondary" @click="closeMoveToActive" :disabled="moveToActive.loading">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </div>
  
</template>

<script>
import { Workbook } from 'exceljs'
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebaseConfig'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { useAppStore } from '@/stores/app'
import { usePropertyType } from '@/composables/usePropertyType'
const heroBg = 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'

export default {
  name: 'ViewVacancies',
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    const { getLabel, getColor, resolvePropertyTypeFromUnit } = usePropertyType()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    return {
      showErrorDialog,
      getPropertyTypeLabel: getLabel,
      getPropertyTypeColor: getColor,
      resolvePropertyTypeFromUnit,
      logAuditEvent,
      auditActions,
      resourceTypes
    }
  },
  data() {
    return {
      searchQuery: '',
      monthFilter: '',
      monthMenu: false,
      tempMonth: '',
      selectedAgency: null,
      propertyTypeFilter: null,
      filteredVacancies: [],
      vacancies: [],
      agencies: [],
      agenciesLoading: false,
      vacanciesLoading: false,
      exportLoading: false,
      moveToActive: {
        open: false,
        loading: false,
        valid: false,
        error: '',
        vacancyId: null,
        unitId: null,
        unitName: '',
        unitNumber: '',
        propertyType: 'residential',
        leaseStartDate: '',
        tenantRef: '',
        notes: ''
      },
      headers: [
        { title: 'UNIT NAME', key: 'unitName', sortable: true },
        { title: 'DATE VACATED', key: 'dateVacated', sortable: true, align: 'center' },
        { title: 'PROPERTY TYPE', key: 'propertyType', sortable: true, align: 'center' },
        { title: 'ACTIONS', key: 'actions', sortable: false, align: 'center' }
      ]
    }
  },
  computed: {
    userType() {
      const appStore = useAppStore()
      return appStore.currentUser?.userType
    },
    agencyHeroBgStyle() { return { background: `url(${heroBg}) center/cover no-repeat` } },
    heroTitle() { return this.selectedAgencyDetails?.agencyName || 'Vacancies' },
    monthFilterLabel() {
      if (!this.monthFilter) return 'All Months'
      try {
        const [yy, mm] = String(this.monthFilter).split('-')
        const d = new Date(Number(yy), Number(mm) - 1, 1)
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      } catch { return this.monthFilter }
    },
    selectedAgencyDetails() { return this.agencies.find(a => a.id === this.selectedAgency) || null },
    isAgencyUser() {
      const appStore = useAppStore()
      const user = appStore.currentUser
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
    },
    propertyTypeFilterOptions() {
      const { getOptions } = usePropertyType()
      return [ { value: null, title: 'All Types' }, ...getOptions() ]
    }
  },
  methods: {
    onMonthMenuToggle(open) { if (open) this.tempMonth = this.monthFilter || '' },
    applyMonth() { this.monthFilter = this.tempMonth || ''; this.filterVacancies(); this.monthMenu = false },
    clearMonth() { this.tempMonth = ''; this.monthFilter = ''; this.filterVacancies(); this.monthMenu = false },
    formatDate(val) {
      if (!val) return 'N/A'
      const d = typeof val?.toDate === 'function' ? val.toDate() : new Date(val)
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    },
    filterVacancies() {
      const q = (this.searchQuery || '').toLowerCase()
      this.filteredVacancies = this.vacancies.filter(v => {
        const textMatch = (v.unitName || '').toLowerCase().includes(q) || (v.notes || '').toLowerCase().includes(q)
        let agencyMatch = true, monthMatch = true, typeMatch = true
        if (this.selectedAgency) agencyMatch = v.agencyId === this.selectedAgency
        if (this.propertyTypeFilter) typeMatch = v.propertyType === this.propertyTypeFilter
        if (this.monthFilter) {
          const vd = new Date(v.dateVacated)
          const fd = new Date(this.monthFilter + '-01')
          monthMatch = vd.getMonth() === fd.getMonth() && vd.getFullYear() === fd.getFullYear()
        }
        return textMatch && agencyMatch && monthMatch && typeMatch
      })
    },
    addVacancy() { this.$router.push('/add-vacancy') },
    viewVacancy(item) { this.$router.push(`/view-vacancy-${item.id}`) },
    async openMoveToActive(item) {
      try {
        this.moveToActive.error = ''
        this.moveToActive.loading = true
        this.moveToActive.open = true
        this.moveToActive.vacancyId = item.id
        this.moveToActive.unitId = item.unitId || null
        this.moveToActive.unitName = item.unitName || ''
        this.moveToActive.propertyType = item.propertyType || 'residential'
        this.moveToActive.unitNumber = ''

        // Load archived unit details to get unit number/type if missing
        let archivedDoc = null
        if (item.unitId) {
          const q1 = query(collection(db, 'archivedUnits'), where('originalId', '==', item.unitId))
          const s1 = await getDocs(q1)
          if (!s1.empty) archivedDoc = s1.docs[0]
        }
        if (!archivedDoc && item.unitName) {
          const q2 = query(collection(db, 'archivedUnits'), where('propertyName', '==', item.unitName))
          const s2 = await getDocs(q2)
          if (!s2.empty) archivedDoc = s2.docs[0]
        }
        if (archivedDoc) {
          const data = archivedDoc.data() || {}
          this.moveToActive.unitNumber = data.unitNumber || data.propertyNumber || ''
          if (!item.propertyType) this.moveToActive.propertyType = data.propertyType || 'residential'
          if (!this.moveToActive.unitId && data.originalId) this.moveToActive.unitId = data.originalId
        }
      } catch (e) {
        console.error('Open move to active failed', e)
        this.moveToActive.error = 'Failed to load unit details. You can still proceed.'
      } finally {
        this.moveToActive.loading = false
      }
    },
    closeMoveToActive() { this.moveToActive.open = false; this.moveToActive.loading = false; this.moveToActive.error = '' },
    async submitMoveToActive() {
      const form = this.$refs.moveForm
      if (form && typeof form.validate === 'function') {
        const ok = form.validate()
        if (!ok) return
      }
      this.moveToActive.error = ''
      this.moveToActive.loading = true
      try {
        const name = this.moveToActive.unitName
        const originalId = this.moveToActive.unitId || null

        // Overlap guard: block if an active unit already exists with same originalId or name
        let overlap = false
        try {
          if (originalId) {
            const existing = await getDoc(doc(db, 'units', originalId))
            overlap = existing.exists()
          }
          if (!overlap && name) {
            const qx = query(collection(db, 'units'), where('propertyName', '==', name))
            const sx = await getDocs(qx)
            overlap = !sx.empty
          }
        } catch {}
        if (overlap) {
          this.moveToActive.error = 'This unit already has an active/overlapping lease. Adjust dates or close the existing lease first.'
          this.moveToActive.loading = false
          return
        }

        // Find archived unit doc for data source and for cleanup
        let archivedDoc = null
        if (originalId) {
          const q1 = query(collection(db, 'archivedUnits'), where('originalId', '==', originalId))
          const s1 = await getDocs(q1)
          if (!s1.empty) archivedDoc = s1.docs[0]
        }
        if (!archivedDoc) {
          const q2 = query(collection(db, 'archivedUnits'), where('propertyName', '==', name))
          const s2 = await getDocs(q2)
          if (!s2.empty) archivedDoc = s2.docs[0]
        }
        const archivedData = archivedDoc ? archivedDoc.data() : {}

        // Prepare unit payload (preserve name/number/type; set new lease fields)
        const unitPayload = {
          ...(archivedData || {}),
          propertyName: name,
          unitNumber: this.moveToActive.unitNumber || archivedData?.unitNumber || archivedData?.propertyNumber || '',
          propertyType: this.moveToActive.propertyType || archivedData?.propertyType || 'residential',
          leaseStartDate: this.moveToActive.leaseStartDate,
          tenantRef: this.moveToActive.tenantRef,
          status: 'Active',
          updatedAt: new Date()
        }
        // Remove archive-only fields
        delete unitPayload.originalId; delete unitPayload.archivedAt; delete unitPayload.archivedBy; delete unitPayload.archivedByUserType; delete unitPayload.archivedReason

        // Restore to units with original ID if available to retain document links
        const unitRef = originalId ? doc(db, 'units', originalId) : doc(collection(db, 'units'))
        await setDoc(unitRef, unitPayload)

        // Clean up: delete vacancy; delete archivedUnits doc (documents remain under unit id path)
        if (this.moveToActive.vacancyId) await deleteDoc(doc(db, 'vacancies', this.moveToActive.vacancyId))
        if (archivedDoc) await deleteDoc(doc(db, 'archivedUnits', archivedDoc.id))

        // Update UI: remove from local list
        const idx = this.vacancies.findIndex(v => v.id === this.moveToActive.vacancyId)
        if (idx > -1) { this.vacancies.splice(idx, 1); this.filterVacancies() }

        this.showSuccessMessage?.('Unit moved to Active with new lease details.')
        this.closeMoveToActive()
      } catch (e) {
        console.error('Move to Active failed', e)
        this.moveToActive.error = 'Failed to move unit. Please try again.'
      } finally {
        this.moveToActive.loading = false
      }
    },
    async deleteVacancy(item) {
      try {
        const { showConfirmDialog } = useCustomDialogs()
        await showConfirmDialog({
          title: 'Delete Vacancy?',
          message: `Are you sure you want to delete the vacancy for ${item.unitName}? The unit will remain in Deleted Units (Archive). Documents will stay linked.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
        // Simply delete the vacancy; keep the unit in archivedUnits for document retention
        await deleteDoc(doc(db, 'vacancies', item.id))
        
        // Remove from local array
        const index = this.vacancies.findIndex(v => v.id === item.id)
        if (index > -1) {
          this.vacancies.splice(index, 1)
          this.filterVacancies()
        }
        
        // Show success message
        this.showSuccessMessage?.('Vacancy deleted. Unit remains in Deleted Units (Archive).')
      } catch (error) {
        if (error.message !== 'User cancelled') {
          console.error('Error deleting vacancy:', error)
          this.showErrorDialog?.('Failed to delete vacancy. Please try again.', 'Error', 'OK')
        }
      }
    },
    async fetchAgencies() {
      this.agenciesLoading = true
      try {
        const appStore = useAppStore(); const user = appStore.currentUser; const ut = user?.userType
        if (ut === 'Agency' || (ut === 'Admin' && user?.adminScope === 'agency')) {
          let agencyData = null
          const id = ut === 'Agency' ? user.uid : user.managedAgencyId
          if (id) {
            const snap = await getDoc(doc(db, 'users', id))
            if (snap.exists()) agencyData = { id: snap.id, ...snap.data() }
          }
          if (agencyData) { this.agencies = [agencyData]; this.selectedAgency = agencyData.id } else { this.agencies = [] }
        } else {
          const snap = await getDocs(query(collection(db, 'users'), where('userType', '==', 'Agency')))
          this.agencies = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        }
      } catch (e) { console.error('Fetch agencies failed', e) } finally { this.agenciesLoading = false }
    },
    async fetchVacancies(agencyId = null) {
      this.vacanciesLoading = true
      try {
        const appStore = useAppStore(); const user = appStore.currentUser; const ut = user?.userType
        let qRef
        if (ut === 'Agency' || (ut === 'Admin' && user?.adminScope === 'agency')) {
          const target = ut === 'Agency' ? user.uid : user.managedAgencyId
          qRef = target ? query(collection(db, 'vacancies'), where('agencyId', '==', target)) : null
        } else {
          qRef = agencyId ? query(collection(db, 'vacancies'), where('agencyId', '==', agencyId)) : collection(db, 'vacancies')
        }
        if (!qRef) { this.vacancies = []; this.filteredVacancies = []; return }
        const snap = await getDocs(qRef)
        const list = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() }))
        // Resolve property types if missing
        this.vacancies = await Promise.all(list.map(async v => {
          try {
            if (v.propertyType) return v
            if (v.unitId) {
              const pt = await this.resolvePropertyTypeFromUnit(v.unitId); return { ...v, propertyType: pt }
            }
            return { ...v, propertyType: 'residential' }
          } catch { return { ...v, propertyType: 'residential' } }
        }))
        this.filterVacancies()
      } catch (e) {
        console.error('Fetch vacancies failed', e); this.showErrorDialog('Failed to load vacancies. Please try again.', 'Error', 'OK')
      } finally { this.vacanciesLoading = false }
    },

    async exportVacanciesXLSX() {
      this.exportLoading = true
      try {
        // Log export event
        try {
          await this.logAuditEvent(
            this.auditActions.EXPORT,
            {
              exportType: 'XLSX',
              recordCount: this.filteredVacancies.length,
              filters: {
                searchQuery: this.searchQuery,
                propertyType: this.propertyTypeFilter,
                month: this.monthFilter
              }
            },
            this.resourceTypes.VACANCY,
            null
          )
        } catch (_) {}

        const columns = [
          { header: 'UNIT NAME', key: 'unitName' },
          { header: 'DATE VACATED', key: 'dateVacated' },
          { header: 'PROPERTY TYPE', key: 'propertyType' },
          { header: 'NOTES', key: 'notes' }
        ]

        const rows = (this.filteredVacancies || []).map(v => ({
          unitName: v.unitName || '',
          dateVacated: this.formatCsvDate(v.dateVacated),
          propertyType: this.getPropertyTypeLabel?.(v.propertyType) || v.propertyType || '',
          notes: (v.notes || '').toString()
        }))

        const wb = new Workbook()
        const ws = wb.addWorksheet('Vacancies')
        ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.key === 'notes' ? 45 : 22 }))
        rows.forEach(r => ws.addRow(r))

        const headerRow = ws.getRow(1)
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } }
        headerRow.height = 20

        ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        const lastCol = String.fromCharCode(64 + columns.length)
        ws.autoFilter = { from: 'A1', to: lastCol + '1' }

        ws.getColumn('notes').alignment = { wrapText: true, vertical: 'top' }
        ws.eachRow((row, n) => { if (n !== 1) row.alignment = { vertical: 'top' } })

        // Auto-fit widths within bounds
        columns.forEach((col, idx) => {
          const lengths = rows.map(r => {
            const val = r[col.key]
            if (val == null) return 0
            if (typeof val === 'string') return val.split('\n').reduce((m, s) => Math.max(m, s.length), 0)
            return String(val).length
          })
          const headerLen = col.header.length
          const maxLen = Math.max(headerLen, ...lengths)
          const minW = col.key === 'notes' ? 30 : 14
          const maxW = col.key === 'notes' ? 70 : 40
          ws.getColumn(idx + 1).width = Math.min(Math.max(maxLen + 2, minW), maxW)
        })

        const filename = `vacancies-${new Date().toISOString().split('T')[0]}.xlsx`
        const buffer = await wb.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        console.error('Export vacancies failed', e)
        this.showErrorDialog?.('Failed to export vacancies. Please try again.', 'Error', 'OK')
      } finally {
        this.exportLoading = false
      }
    },

    // Reuseable compact CSV-friendly date format
    formatCsvDate(val) {
      if (!val) return ''
      const d = typeof val?.toDate === 'function' ? val.toDate() : new Date(val)
      if (isNaN(d)) return ''
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }
  },
  async mounted() {
    await this.fetchAgencies()
    if (this.isAgencyUser) { await this.fetchVacancies() } else {
      const appStore = useAppStore(); const id = appStore.currentAgency?.id || null
      if (id) { this.selectedAgency = id; await this.fetchVacancies(id) } else { await this.fetchVacancies() }
    }
  }
}
</script>

<style scoped>
.view-vacancy-page { padding:20px; min-height:100vh; }
.back-btn { font-weight:500; text-transform:none; border-radius:8px; background-color:black !important; color:white !important; border:2px solid black !important; width:160px; height:44px; }
.agency-hero-card { position: relative; border-radius: 12px; overflow: hidden; min-height: 180px; }
.agency-hero-bg { position: absolute; inset: 0; background-position: center; background-size: cover; background-repeat: no-repeat; }
.agency-hero-center { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center; padding: 0 16px; color: #fff; font-weight: 800; font-size: 1.6rem; text-align: center; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }
.custom-input .v-field { border-radius:8px; }
.action-btn-container { display:flex; justify-content:center; align-items:center; gap:4px; }
.action-btn { font-size:0.75rem; font-weight:500; text-transform:none; border-radius:6px; }
:deep(.custom-header .v-data-table-header) { background:#000; color:white; }
.month-menu { background:#fff; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.15); padding:12px; min-width:260px; }
.month-menu__title { font-weight:600; margin-bottom:8px; }
.month-menu__input { width:100%; padding:8px 10px; border:1px solid #d0d0d0; border-radius:8px; }
.month-menu__actions { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }

/* Forgot Password dialog styling reused */
.notification-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100000; }
.notification-dialog { position: relative; width: 560px; max-width: 90vw; min-height: 200px; }
.notification-dialog-bg { position: absolute; top: 12px; left: 12px; width: 96%; height: 100%; border-radius: 16px; box-shadow: 0 6px 24px rgba(0,0,0,0.15); }
.notification-dialog-bg.info { background-color: #000000; }
.notification-dialog-inner { position: relative; background: #ffffff; border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,0.15); }
.notification-close { position: absolute; top: 16px; right: 16px; background: transparent; border: none; font-size: 24px; cursor: pointer; line-height: 1; }
.notification-icon { position: relative; margin: 0 auto 16px auto; margin-top: -12%; width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: fadeInCircle 0.3s ease-out forwards; }
.notification-icon.info { background-color: #000000; }
.notification-icon .v-icon { font-size: 36px; color: #ffffff; }
.notification-icon::before { content: ''; position: absolute; width: 100px; height: 100px; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; opacity: 0.2; animation: pulse 2s ease-in-out infinite; }
.notification-icon.info::before { background-color: #000000; }
.notification-title { font-size: 1.6em; margin: 0 0 8px 0; }
.notification-message { font-size: 1em; margin: 0 0 16px 0; color: #666; }
@keyframes fadeInCircle { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
@keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.2); } }
.button-container { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 8px; }
.notification-button { border: none; border-radius: 8px; color: #ffffff; font-size: 1em; padding: 8px 20px; cursor: pointer; transition: all 0.3s ease; min-width: 160px; }
.notification-button.info { background-color: #000000; }
.notification-button.secondary { background-color: #ffffff; color: #000000; border: 2px solid #000000; }
.notification-button:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.notification-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.error-message { display:flex; align-items:center; justify-content:center; background-color:#fed7d7; color:#c53030; padding:10px 12px; border-radius:8px; margin-top:8px; }
.tight-grid { --v-gutter-x: 0px; --v-gutter-y: 4px; margin: 0 !important; }
.tight-grid > .v-col { padding: 0 !important; }
.custom-input { margin-bottom: 6px; }
.custom-input :deep(.v-input__details) { display: none; }

@media (max-width: 600px) {
  .notification-dialog { width: 95vw; margin: 0 10px; }
  .notification-button { width: 100%; }
}
</style>

