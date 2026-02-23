<template>
  <div class="view-agency-page">
    <v-container fluid>
      <!-- Filters -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col class="pa-4" cols="12" lg="3" md="3">
          <v-text-field
            v-model="searchQuery"
            clearable
            dense
            class="custom-input top-filter"
            density="comfortable"
            flat
            hide-details
            label="Search Unit"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @input="filterUnits"
          />
        </v-col>

        <!-- Agency Select removed for header consistency -->

        <!-- Property Type Filter -->
        <v-col class="pa-4" cols="12" lg="2" md="2">
          <v-select
            v-model="propertyTypeFilter"
            class="custom-input top-filter"
            density="comfortable"
            hide-details
            item-title="title"
            item-value="value"
            :items="propertyTypeFilterOptions"
            label="Property Type"
            variant="outlined"
            @update:model-value="filterUnits"
          />
        </v-col>

        <!-- Month filter -->
        <v-col class="pa-4" cols="12" lg="3" md="2">
          <v-menu
            v-model="monthMenu"
            :close-on-content-click="false"
            location="bottom"
            transition="fade-transition"
            @update:model-value="onMonthMenuToggle"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                append-inner-icon="mdi-calendar-month"
                dense
                density="comfortable"
                class="custom-input top-filter month-input flex-grow-1"
                flat
                hide-details
                label="Filter by month"
                :model-value="monthFilterLabel"
                readonly
                variant="outlined"
              />
            </template>
            <div class="month-menu">
              <div class="month-menu__title">Pick month</div>
              <input
                class="month-menu__input"
                type="month"
                :value="tempMonth"
                @input="
                  (e) => {
                    tempMonth = e.target.value;
                  }
                "
              >
              <div class="month-menu__actions">
                <v-btn
                  color="black"
                  size="small"
                  variant="elevated"
                  @click="applyMonth"
                >Apply</v-btn>
                <v-btn
                  color="grey"
                  size="small"
                  variant="text"
                  @click="clearMonth"
                >All</v-btn>
              </div>
            </div>
          </v-menu>
        </v-col>

        <!-- Export to Excel Button -->
        <v-col
          class="pa-4 d-flex align-center justify-end"
          cols="12"
          lg="3"
          md="3"
        >
          <v-btn
            class="back-btn"
            :loading="exportLoading"
            style="margin-right: 45%"
            @click="exportFlaggedUnitsXLSX"
          >
            {{ exportLoading ? "Exporting..." : "Export to Excel" }}
          </v-btn>
        </v-col>
      </v-row>

      <!-- Clean Agency Header (image, centered title, no overlay) -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="agency-hero-card" elevation="1">
            <div class="agency-hero-bg" :style="agencyHeroBgStyle" />
            <div class="agency-hero-center">
              {{ heroTitle }}
            </div>
          </v-card>
        </v-col>
      </v-row>
      <!-- Agency Info Card (only when selected) -->
      <v-row v-if="false && selectedAgencyDetails" class="mb-6">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <!-- Background image layer -->
            <div class="agency-card-bg" :style="agencyCardBgStyle" />
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12">
                <div class="agency-content-right">
                  <v-card-title class="text-white text-h4 mb-2">
                    {{ selectedAgencyDetails.agencyName }}
                  </v-card-title>
                  <v-card-text class="text-white">
                    <div class="agency-details-black">
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-map-marker" />
                        <span>{{
                          selectedAgencyDetails.address ||
                            "Address not provided"
                        }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon
                          class="mr-2 text-white"
                          icon="mdi-card-account-details"
                        />
                        <span>Reg No:
                          {{ selectedAgencyDetails.regNo || "â€”" }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-account" />
                        <span>Primary Contact:
                          {{
                            selectedAgencyDetails.primaryContactName || "N/A"
                          }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-phone" />
                        <span>{{
                          selectedAgencyDetails.contactNumber || "N/A"
                        }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-email" />
                        <span>{{ selectedAgencyDetails.email || "N/A" }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon class="mr-2 text-white" icon="mdi-home" />
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

      <!-- Flagged Units Table -->
      <v-row>
        <v-col class="pa-4" cols="12">
          <v-data-table
            class="custom-header"
            density="comfortable"
            :headers="headers"
            hover
            :items="filteredUnits"
            :loading="unitsLoading"
            no-data-text="No data available"
            :search="searchQuery"
          >
            <!-- Months Missed -->
            <template #item.monthsMissed="{ item }">
              <v-chip
                :color="(item.monthsMissed || 0) > 0 ? 'error' : 'success'"
                size="small"
                text-color="white"
                variant="elevated"
              >
                <template v-if="(item.monthsMissed || 0) > 0">
                  {{ item.monthsMissed }} {{ item.monthsMissed === 1 ? 'month' : 'months' }}
                </template>
                <template v-else>
                  0 months
                </template>
              </v-chip>
            </template>
            <!-- Centered Action Buttons -->
            <template #item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  class="action-btn"
                  color="black"
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewUnit(item)"
                />
                <v-btn
                  v-if="!isSuperAdmin"
                  class="action-btn"
                  color="black"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="editUnit(item)"
                />
                <v-btn
                  class="action-btn"
                  color="primary"
                  icon="mdi-restore"
                  size="small"
                  title="Move To Active Units"
                  variant="text"
                  @click="moveUnitToActive(item)"
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
  import { Workbook } from 'exceljs'
  import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    updateDoc,
    where,
  } from 'firebase/firestore'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { usePropertyType } from '@/composables/usePropertyType'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'
  const heroBg
    = 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'

  export default {
    name: 'FlaggedUnitsPage',
    setup () {
      const { showConfirmDialog, showSuccessDialog, showErrorDialog }
        = useCustomDialogs()
      const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
      const { getLabel, getColor, getOptions, resolvePropertyTypeFromUnit }
        = usePropertyType()
      return {
        showConfirmDialog,
        showSuccessDialog,
        showErrorDialog,
        logAuditEvent,
        auditActions,
        resourceTypes,
        getPropertyTypeLabel: getLabel,
        getPropertyTypeColor: getColor,
        resolvePropertyTypeFromUnit,
      }
    },
    data () {
      return {
        searchQuery: '',
        monthFilter: '',
        monthMenu: false,
        tempMonth: '',
        selectedAgency: null,
        propertyTypeFilter: null,
        filteredUnits: [],
        agencies: [],
        agenciesLoading: false,
        units: [],
        unitsLoading: false,
        exportLoading: false,
        flaggedUnsubscribe: null,
        activeUnitsCount: 0,
        headers: [
          { title: 'UNIT NAME', key: 'unitName', sortable: true },
          { title: 'UNIT NUMBER', key: 'unitNumber', sortable: true },
          { title: 'DATE FLAGGED', key: 'dateFlagged', sortable: true },
          { title: 'MONTHS MISSED', key: 'monthsMissed', sortable: true, align: 'center' },
          { title: 'ACTIONS', key: 'actions', sortable: false, align: 'center' },
        ],
      }
    },
    computed: {
      agencyHeroBgStyle () {
        return { background: `url(${heroBg}) center/cover no-repeat` }
      },
      heroTitle () {
        return 'Flagged Units'
      },
      monthFilterLabel () {
        if (!this.monthFilter) return 'All Months'
        try {
          const [yy, mm] = String(this.monthFilter).split('-')
          const d = new Date(Number(yy), Number(mm) - 1, 1)
          return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        } catch {
          return this.monthFilter
        }
      },
      agencyCardBgStyle () {
        const url
          = this.selectedAgencyDetails?.profileImageUrl
            || this.selectedAgencyDetails?.profileImage
            || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
        return {
          background: `url(${url}) center/cover no-repeat`,
        }
      },
      hasCurrentAgency () {
        const appStore = useAppStore()
        return !!appStore.currentAgency
      },
      selectedAgencyDetails () {
        return this.agencies.find(a => a.id === this.selectedAgency) || null
      },
      isAgencyUser () {
        const appStore = useAppStore()
        const user = appStore.currentUser
        return (
          user?.userType === 'Agency'
          || (user?.userType === 'Admin' && user?.adminScope === 'agency')
        )
      },
      isSuperAdmin () {
        const appStore = useAppStore()
        const userType = appStore.currentUser?.userType
        console.log(
          'Flagged Units - User Type:',
          userType,
          'Is Super Admin:',
          userType === 'Super Admin',
        )
        return userType === 'Super Admin'
      },
      propertyTypeFilterOptions () {
        const { getOptions } = usePropertyType()
        return [{ value: null, title: 'All Types' }, ...getOptions()]
      },
    },
    async mounted () {
      document.title = 'Flagged Units - Depsure'

      // Fetch agencies first
      await this.fetchAgencies()

      // Fetch flagged units based on user role and selected agency
      if (this.isAgencyUser) {
        // Agency users will automatically get their own flagged units
        await this.fetchFlaggedUnits()
        await this.refreshActiveUnitsCount()
      } else {
        const appStore = useAppStore()
        const globalId = appStore.currentAgency?.id || null
        if (globalId) {
          this.selectedAgency = globalId
          await this.fetchFlaggedUnits(globalId)
          await this.refreshActiveUnitsCount(globalId)
        } else {
          // Super Admin/Admin users: no agency selected, show empty state
          this.units = []
          this.filteredUnits = []
        }
      }
    },
    unmounted () {
      if (this.flaggedUnsubscribe) {
        try {
          this.flaggedUnsubscribe()
        } catch {}
        this.flaggedUnsubscribe = null
      }
    },
    methods: {
      normalizeMonthsValue (value) {
        if (value === null || value === undefined || value === '') return 0
        const num = Number(value)
        if (!Number.isFinite(num) || num < 0) return 0
        return Math.round(num)
      },
      onMonthMenuToggle (open) {
        if (open) {
          this.tempMonth = this.monthFilter || ''
        }
      },
      openMonthMenu () {
        this.tempMonth = this.monthFilter || ''
        this.monthMenu = true
      },
      applyMonth () {
        this.monthFilter = this.tempMonth || ''
        this.filterUnits()
        this.monthMenu = false
      },
      clearMonth () {
        this.tempMonth = ''
        this.monthFilter = ''
        this.filterUnits()
        this.monthMenu = false
      },
      openMonthPicker () {
        const el = this.$refs.monthInput?.$el?.querySelector('input')
        if (el) {
          if (typeof el.showPicker === 'function') el.showPicker()
          else el.focus()
        }
      },
      async refreshActiveUnitsCount (agencyId = null) {
        try {
          const appStore = useAppStore()
          const currentUser = appStore.currentUser
          const userType = currentUser?.userType
          let unitsQuery
          if (userType === 'Agency') {
            unitsQuery = query(
              collection(db, 'units'),
              where('agencyId', '==', currentUser.uid),
            )
          } else if (agencyId) {
            unitsQuery = query(
              collection(db, 'units'),
              where('agencyId', '==', agencyId),
            )
          } else {
            this.activeUnitsCount = 0
            return
          }
          const snap = await getDocs(unitsQuery)
          this.activeUnitsCount = snap.size
        } catch (error) {
          console.error('Error counting active units:', error)
          this.activeUnitsCount = 0
        }
      },
      getCurrentMonth () {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}`
      },
      filterUnits () {
        this.filteredUnits = this.units.filter(unit => {
          const searchValue = this.searchQuery.toLowerCase()
          const textMatch
            = (unit.unitName || '')
              .toLowerCase()
              .includes(searchValue)
              || (unit.unitNumber || '')
                .toLowerCase()
                .includes(searchValue)
              || (unit.dateFlagged || '')
                .toLowerCase()
                .includes(searchValue)
              || String(
                unit.monthsMissed ?? unit.monthsMissedRent ?? '',
              )
                .toLowerCase()
                .includes(searchValue)

          // Agency filtering is already done in fetchFlaggedUnits() - no need to do it again here
          // (this allows old flagged units without agencyId to show up)
          let monthMatch = true
          let propertyTypeMatch = true

          if (this.propertyTypeFilter) {
            propertyTypeMatch = unit.propertyType === this.propertyTypeFilter
          }

          if (this.monthFilter) {
            // Handle Firestore Timestamp objects
            let unitDate
            if (unit.createdAt && unit.createdAt.toDate) {
              // Firestore Timestamp object
              unitDate = unit.createdAt.toDate()
            } else if (unit.createdAt) {
              // Regular Date object or date string
              unitDate = new Date(unit.createdAt)
            } else {
              // No createdAt date, skip this unit
              return textMatch && propertyTypeMatch
            }

            const filterDate = new Date(this.monthFilter + '-01')
            const unitMonth = `${unitDate.getFullYear()}-${String(
              unitDate.getMonth() + 1,
            ).padStart(2, '0')}`
            const filterMonth = `${filterDate.getFullYear()}-${String(
              filterDate.getMonth() + 1,
            ).padStart(2, '0')}`
            monthMatch = unitMonth === filterMonth
          }

          return textMatch && monthMatch && propertyTypeMatch
        })
        console.log(
          `filterUnits: ${this.filteredUnits.length} units after applying filters`,
        )
      },
      viewUnit (unit) {
        console.log('Viewing flagged unit:', unit)
        this.$router.push(`/view-flagged-unit-${unit.id}`)
      },
      editUnit (unit) {
        this.$router.push(`/edit-flagged-unit-${unit.id}`)
      },
      async moveUnitToActive (unit) {
        try {
          await this.showConfirmDialog({
            title: 'Move unit to active?',
            message: `Move ${unit.unitName || 'this unit'} back to Active Units?`,
            confirmText: 'Move',
            cancelText: 'Cancel',
            color: '#000000',
          })
        } catch {
          return
        }
        try {
          // Delete flagged unit document
          await deleteDoc(doc(db, 'flaggedUnits', unit.id))

          // Also unflag the actual unit in the units collection
          try {
            // Try to find the unit by unitId first
            if (unit.unitId) {
              await updateDoc(doc(db, 'units', unit.unitId), {
                isFlagged: false,
              })
              console.log('Unit unflagged by unitId:', unit.unitId)
            } else {
              // If no unitId, try to find by propertyName/unitName
              const unitName = unit.unitName || ''
              if (unitName) {
                const unitsQuery = query(
                  collection(db, 'units'),
                  where('propertyName', '==', unitName),
                  where('agencyId', '==', unit.agencyId),
                )
                const unitsSnapshot = await getDocs(unitsQuery)

                if (!unitsSnapshot.empty) {
                  const unitDoc = unitsSnapshot.docs[0]
                  await updateDoc(doc(db, 'units', unitDoc.id), {
                    isFlagged: false,
                  })
                  console.log('Unit unflagged by propertyName:', unitName)
                }
              }
            }
          } catch (unflagError) {
            console.warn(
              'Could not unflag unit in units collection:',
              unflagError,
            )
          // Continue even if unflagging fails
          }

          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.DELETE,
            {
              unitName: unit.unitName,
              unitNumber: unit.unitNumber,
              dateFlagged: unit.dateFlagged,
            },
            this.resourceTypes.UNIT,
            unit.id,
          )

          // Remove from local array
          const index = this.units.findIndex(u => u.id === unit.id)
          if (index !== -1) {
            this.units.splice(index, 1)
            this.filterUnits()
            this.showSuccessDialog(
              `${unit.unitName || 'Unit'} moved to Active Units successfully.`,
              'Success!',
              'Continue',
            )
          }
        } catch (error) {
          console.error('Error deleting flagged unit:', error)
          this.showErrorDialog(
            'Failed to delete flagged unit. Please try again.',
          )
        }
      },
      async exportFlaggedUnitsXLSX () {
        this.exportLoading = true
        try {
          try {
            await this.logAuditEvent(
              this.auditActions.EXPORT,
              {
                exportType: 'XLSX',
                recordCount: this.filteredUnits.length,
                filters: {
                  searchQuery: this.searchQuery,
                  propertyType: this.propertyTypeFilter,
                  month: this.monthFilter,
                },
              },
              this.resourceTypes.UNIT,
              null,
            )
          } catch {}

          const columns = [
            { header: 'UNIT NAME', key: 'unitName' },
            { header: 'UNIT NUMBER', key: 'unitNumber' },
            { header: 'DATE FLAGGED', key: 'dateFlagged' },
            { header: 'MONTHS MISSED', key: 'monthsMissed' },
            { header: 'PROPERTY TYPE', key: 'propertyType' },
          ]

          const rows = (this.filteredUnits || []).map(u => ({
            unitName: u.unitName || '',
            unitNumber: u.unitNumber || '',
            dateFlagged: this.formatCsvDate(u.createdAt || u.dateFlagged),
            monthsMissed: u.monthsMissed ?? 0,
            propertyType:
              this.getPropertyTypeLabel?.(u.propertyType) || u.propertyType || '',
          }))

          const wb = new Workbook()
          const ws = wb.addWorksheet('Flagged Units')
          ws.columns = columns.map(c => ({
            header: c.header,
            key: c.key,
            width: 22,
          }))
          for (const r of rows) ws.addRow(r)

          const headerRow = ws.getRow(1)
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
          headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF000000' },
          }
          headerRow.height = 20

          ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
          const lastCol = String.fromCharCode(64 + columns.length)
          ws.autoFilter = { from: 'A1', to: lastCol + '1' }

          // Auto-fit widths within bounds
          for (const [idx, col] of columns.entries()) {
            const lengths = rows.map(r => {
              const val = r[col.key]
              if (val == null) return 0
              if (typeof val === 'string')
                return val.split('\n').reduce((m, s) => Math.max(m, s.length), 0)
              return String(val).length
            })
            const headerLen = col.header.length
            const maxLen = Math.max(headerLen, ...lengths)
            const minW = 14
            const maxW = 40
            ws.getColumn(idx + 1).width = Math.min(
              Math.max(maxLen + 2, minW),
              maxW,
            )
          }

          const filename = `flagged-units-${
            new Date().toISOString().split('T')[0]
          }.xlsx`
          const buffer = await wb.xlsx.writeBuffer()
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.append(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Export flagged units failed', error)
          this.showErrorDialog?.(
            'Failed to export flagged units. Please try again.',
            'Error',
            'OK',
          )
        } finally {
          this.exportLoading = false
        }
      },
      formatCsvDate (val) {
        if (!val) return ''
        const d
          = typeof val?.toDate === 'function' ? val.toDate() : new Date(val)
        if (isNaN(d)) return ''
        const pad = n => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
            // Agency users and Agency Admin users can only see their own agency
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
              this.selectedAgency = agencyData.id
              await this.refreshActiveUnitsCount(this.selectedAgency)
            } else {
              this.agencies = []
            }
            console.log('Agency user - own agency loaded:', this.agencies)
          } else {
            // Super Admin and Admin users can see all agencies
            const agenciesQuery = query(
              collection(db, 'users'),
              where('userType', '==', 'Agency'),
            )

            const querySnapshot = await getDocs(agenciesQuery)
            this.agencies = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            console.log('All agencies fetched:', this.agencies)
          }
        } catch (error) {
          console.error('Error fetching agencies:', error)
        } finally {
          this.agenciesLoading = false
        }
      },

      async fetchFlaggedUnits (agencyId = null) {
        // Clean up previous listener
        if (this.flaggedUnsubscribe) {
          try {
            this.flaggedUnsubscribe()
          } catch {}
          this.flaggedUnsubscribe = null
        }
        this.unitsLoading = true
        try {
          const appStore = useAppStore()
          const currentUser = appStore.currentUser
          const userType = currentUser?.userType

          // For non-agency users, only fetch flagged units if an agency is selected
          if (userType !== 'Agency' && !agencyId) {
            // No agency selected, return empty results
            this.units = []
            this.filteredUnits = []
            this.unitsLoading = false
            return
          }

          // Fetch flagged units (filtered by agency if specified)
          let unitsQuery = collection(db, 'flaggedUnits')

          // Live subscribe to flagged units
          this.flaggedUnsubscribe = onSnapshot(
            unitsQuery,
            async querySnapshot => {
              try {
                let unitsData = querySnapshot.docs.map(d => ({
                  id: d.id,
                  ...d.data(),
                }))

                // Filter by agency - need to check both flagged unit's agencyId and the actual unit's agencyId
                const targetAgencyId
                  = userType === 'Agency' ? currentUser.uid : agencyId

                if (targetAgencyId) {
                  console.log(
                    'Filtering flagged units for agency:',
                    targetAgencyId,
                  )
                  const filtered = []

                  for (const unit of unitsData) {
                    let shouldInclude = false

                    // Check 1: If flagged unit has agencyId, use that
                    if (unit.agencyId && unit.agencyId === targetAgencyId) {
                      shouldInclude = true
                      console.log(
                        '✓ Flagged unit matched by agencyId:',
                        unit.unitName,
                      )
                    }

                    // Check 2: Look up the actual unit to check agency
                    if (!shouldInclude && unit.unitId) {
                      try {
                        const unitDoc = await getDoc(
                          doc(db, 'units', unit.unitId),
                        )
                        if (unitDoc.exists()) {
                          const unitData = unitDoc.data()
                          if (unitData?.agencyId === targetAgencyId) {
                            shouldInclude = true
                            console.log(
                              '✓ Flagged unit matched by unitId lookup:',
                              unit.unitName,
                            )
                          }
                        }
                      } catch (error) {
                        console.warn(
                          'Error checking unit agencyId by unitId:',
                          error,
                        )
                      }
                    }

                    // Check 3: Try to find by unit name
                    if (!shouldInclude && unit.unitName) {
                      try {
                        const uq = query(
                          collection(db, 'units'),
                          where('propertyName', '==', unit.unitName),
                        )
                        const uSnap = await getDocs(uq)
                        if (!uSnap.empty) {
                          // Check if any of the matched units belong to this agency
                          const matchedUnit = uSnap.docs.find(
                            d => d.data()?.agencyId === targetAgencyId,
                          )
                          if (matchedUnit) {
                            shouldInclude = true
                            console.log(
                              '✓ Flagged unit matched by unitName lookup:',
                              unit.unitName,
                            )
                          }
                        }
                      } catch (error) {
                        console.warn('Error checking unit by name:', error)
                      }
                    }

                    if (shouldInclude) {
                      filtered.push(unit)
                    }
                  }

                  console.log(
                    `Filtered ${filtered.length} flagged units for agency ${targetAgencyId}`,
                  )
                  unitsData = filtered
                }

                // Resolve property types for each flagged unit (async)
                const enriched = await Promise.all(
                  unitsData.map(async unit => {
                    try {
                      const monthsMissed = this.normalizeMonthsValue(
                        unit.monthsMissed
                          ?? unit.monthsMissedRent
                        ?? unit.monthsMissedMonths
                          ?? 0,
                      )
                      if (unit.unitId) {
                        const propertyType
                          = await this.resolvePropertyTypeFromUnit(unit.unitId)
                        return {
                          ...unit,
                          propertyType,
                          monthsMissed,
                          monthsMissedRent: monthsMissed,
                        }
                      } else if (unit.unitName) {
                        const uq = query(
                          collection(db, 'units'),
                          where('propertyName', '==', unit.unitName),
                        )
                        const uSnap = await getDocs(uq)
                        if (!uSnap.empty) {
                          const unitDoc = uSnap.docs[0]
                          const propertyType
                            = await this.resolvePropertyTypeFromUnit(unitDoc.id)
                          return {
                            ...unit,
                            propertyType,
                            monthsMissed,
                            monthsMissedRent: monthsMissed,
                          }
                        }
                      }
                      return {
                        ...unit,
                        propertyType: 'residential',
                        monthsMissed,
                        monthsMissedRent: monthsMissed,
                      }
                    } catch (error) {
                      console.error(
                        `Error resolving property type for unit ${unit.id}:`,
                        error,
                      )
                      const monthsMissed = this.normalizeMonthsValue(
                        unit.monthsMissed
                          ?? unit.monthsMissedRent
                        ?? unit.monthsMissedMonths
                          ?? 0,
                      )
                      return {
                        ...unit,
                        propertyType: 'residential',
                        monthsMissed,
                        monthsMissedRent: monthsMissed,
                      }
                    }
                  }),
                )
                this.units = enriched
                this.filterUnits()
              } finally {
                this.unitsLoading = false
              }
            },
          )
          console.log('Subscribed to flagged units')
        } catch (error) {
          console.error('Error fetching flagged units:', error)
          this.unitsLoading = false
        } finally {
        // Listener controls loading state on first snapshot
        }
      },

      onAgencyChange (agencyId) {
        console.log('Agency changed to:', agencyId)
        if (this.isAgencyUser) {
          // Agency users can't change agency selection
          return
        }

        if (agencyId) {
          // Fetch flagged units for selected agency
          this.fetchFlaggedUnits(agencyId)
          this.refreshActiveUnitsCount(agencyId)
        } else {
          // Fetch all flagged units when no agency is selected
          this.fetchFlaggedUnits()
          this.refreshActiveUnitsCount()
        }
      },
    },
  }
</script>

<style scoped>
/* Reuse styles from previous pages */

.view-agency-page {
  padding: 20px;
  min-height: 100vh;
}

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

.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0;
  position: relative;
  min-height: 220px;
}

/* New absolute background layer so image always shows */
.agency-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.no-gutters {
  --v-gutter-x: 0;
  --v-gutter-y: 0;
  margin: 0 !important;
}

.agency-logo-black {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agency-details-black {
  margin-bottom: 16px;
}

/* Dark right-to-left gradient overlay so info sits on dark side */
.agency-info-card-black::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.85) 45%,
    rgba(0, 0, 0, 0) 100%
  );
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

.custom-input .v-field {
  border-radius: 8px;
}

.action-btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.action-btn {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:deep(.custom-header .v-data-table-header) {
  background-color: #000000 !important;
}

:deep(.custom-header .v-data-table-header th) {
  background-color: #000000 !important;
  color: white !important;
}

:deep(.custom-header .v-data-table-header .v-data-table-header__content) {
  color: white !important;
}

/* Month input UX tweaks */
.month-input {
  min-width: 220px;
}
:deep(.month-input .v-field-label) {
  white-space: nowrap;
}

/* Clean agency name-only hero with image (no overlay) */
.agency-hero-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 180px;
}
.agency-hero-bg {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.agency-hero-center {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  color: #fff;
  font-weight: 800;
  font-size: 1.6rem;
  text-align: center;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* Custom month menu styling */
.month-menu {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}
.month-menu__actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .view-agency-page {
    padding: 10px;
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

  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px;
    object-fit: cover;
  }
}
</style>
