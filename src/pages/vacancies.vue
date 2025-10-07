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
                <v-btn icon="mdi-eye" size="small" variant="text" color="black" @click="viewVacancy(item)" class="action-btn" />
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
  
</template>

<script>
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { usePropertyType } from '@/composables/usePropertyType'
const heroBg = 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'

export default {
  name: 'ViewVacancies',
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    const { getLabel, getColor, resolvePropertyTypeFromUnit } = usePropertyType()
    return {
      showErrorDialog,
      getPropertyTypeLabel: getLabel,
      getPropertyTypeColor: getColor,
      resolvePropertyTypeFromUnit
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
      headers: [
        { title: 'UNIT NAME', key: 'unitName', sortable: true },
        { title: 'DATE VACATED', key: 'dateVacated', sortable: true, align: 'center' },
        { title: 'PROPERTY TYPE', key: 'propertyType', sortable: true, align: 'center' },
        { title: 'ACTIONS', key: 'actions', sortable: false, align: 'center' }
      ]
    }
  },
  computed: {
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
</style>

