<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn icon="mdi-arrow-left" variant="outlined" color="primary" @click="goBack" class="back-btn">Back</v-btn>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section"><h1 class="page-title">View Vacancy Details</h1></div>
          <v-card class="content-card" elevation="0">
            <div v-if="loading" class="loading-container">
              <v-progress-circular indeterminate color="black" size="64"></v-progress-circular>
              <p class="loading-text">Loading vacancy details...</p>
            </div>
            <div v-else-if="error" class="error-container">
              <v-icon color="error" size="64">mdi-alert-circle</v-icon>
              <h3 class="error-title">Error Loading Vacancy</h3>
              <p class="error-message">{{ error }}</p>
              <v-btn @click="loadVacancy" color="black" variant="elevated">Try Again</v-btn>
            </div>
            <template v-else-if="vacancy">
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="vacancy.unitName" label="Unit Name/Address" variant="outlined" readonly class="custom-input" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="formatDate(vacancy.dateVacated)" label="Date Vacated" variant="outlined" readonly class="custom-input" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field :model-value="formatDate(vacancy.leaseStartDate, 'Not specified')" label="Lease Start Date" variant="outlined" readonly class="custom-input" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="formatDate(vacancy.leaseEndDate, 'Not specified')" label="Lease End Date" variant="outlined" readonly class="custom-input" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field :model-value="vacancy.propertyType || 'residential'" label="Property Type" variant="outlined" readonly class="custom-input" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="vacancy.monthsMissed" label="Months Missed Rent" variant="outlined" readonly class="custom-input" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field :model-value="formatDate(vacancy.createdAt, 'Not specified')" label="Created At" variant="outlined" readonly class="custom-input" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="formatDate(vacancy.updatedAt, 'Not specified')" label="Updated At" variant="outlined" readonly class="custom-input" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field :model-value="formatCurrency(vacancy.paidTowardsFund)" label="Paid Towards Fund" variant="outlined" readonly class="custom-input" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="formatPaidOut(vacancy.paidOut)" label="Paid Out (Yes/No)" variant="outlined" readonly class="custom-input" />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn color="grey" variant="outlined" @click="goBack">Close</v-btn>
              </v-card-actions>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'

export default {
  name: 'ViewVacancyPage',
  data() {
    return { vacancy: null, loading: true, error: null }
  },
  methods: {
    goBack() {
      try {
        const appStore = useAppStore();
        const user = appStore.currentUser;
        const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
        if (isAgency) { 
          this.$router.push('/onboard-units'); 
          return 
        }
      } catch(_) {}
      const from = this.$route?.query?.from
      if (from === 'onboard') {
        this.$router.push('/onboard-units')
      } else {
        this.$router.push('/vacancies')
      }
    },
    async loadVacancy() {
      this.loading = true; this.error = null
      try {
        const ref = doc(db, 'vacancies', this.$route.params.id)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          this.vacancy = this.normalizeVacancyData(data, snap.id)
        } else {
          this.error = 'Vacancy not found'
        }
      } catch (e) { this.error = 'Failed to load vacancy' } finally { this.loading = false }
    },
    toDateValue(val) {
      if (!val) return null
      try {
        if (typeof val?.toDate === 'function') return val.toDate()
        const date = new Date(val)
        return Number.isNaN(date.getTime()) ? null : date
      } catch {
        return null
      }
    },
    toNumber(val, fallback = 0) {
      if (val === null || val === undefined || val === '') return fallback
      const num = typeof val === 'number' ? val : Number(val)
      return Number.isFinite(num) ? num : fallback
    },
    formatDate(val, fallback = 'N/A') {
      const date = this.toDateValue(val)
      if (date) return date.toISOString().slice(0, 10)
      if (typeof val === 'string' && val) return val
      return fallback
    },
    formatCurrency(val) {
      const amount = this.toNumber(val, 0)
      return `R${amount.toLocaleString()}`
    },
    formatPaidOut(val) {
      if (val === true || val === 'Yes' || val === 'yes') return 'Yes'
      if (val === false || val === 'No' || val === 'no') return 'No'
      return String(val || 'Not specified')
    },
    normalizeVacancyData(data, id) {
      const base = {
        id,
        ...data,
        unitName: data?.unitName || 'Not specified',
        dateVacated: this.toDateValue(data?.dateVacated) || data?.dateVacated || null,
        leaseStartDate: this.toDateValue(data?.leaseStartDate) || data?.leaseStartDate || null,
        leaseEndDate: this.toDateValue(data?.leaseEndDate) || data?.leaseEndDate || null,
        createdAt: this.toDateValue(data?.createdAt) || data?.createdAt || null,
        updatedAt: this.toDateValue(data?.updatedAt) || data?.updatedAt || null,
        paidTowardsFund: this.toNumber(data?.paidTowardsFund, 0),
        paidOut: data?.paidOut ?? '',
        propertyType: data?.propertyType || 'residential',
        monthsMissed: this.toNumber(data?.monthsMissed, 0),
      }
      return base
    }
  },
  mounted() { this.loadVacancy() }
}
</script>

<style scoped>
.view-vacancy-page { padding:20px; min-height:100vh; }
.back-btn { font-weight:500; text-transform:none; border-radius:8px; background-color:black !important; color:white !important; border:2px solid black !important; width:160px; height:44px; }
.title-section { background:black; color:white; padding:0.75rem; border-radius:12px 12px 0 0; }
.page-title { font-size:1.25rem; font-weight:600; color:white; margin:0; text-align:center; text-transform:uppercase; }
.content-card { background:white; border-radius:0 0 12px 12px; }
.custom-input .v-field { border-radius:8px; }
.loading-container, .error-container { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; }
.error-title { margin:6px 0 }
</style>
