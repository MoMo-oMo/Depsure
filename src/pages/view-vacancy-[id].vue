<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn icon="mdi-arrow-left" variant="outlined" color="primary" @click="$router.push('/vacancies')" class="back-btn">Back</v-btn>
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
                    <v-text-field :model-value="vacancy.createdAt ? formatDate(vacancy.createdAt) : 'Not specified'" label="Created At" variant="outlined" readonly class="custom-input" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field :model-value="vacancy.updatedAt ? formatDate(vacancy.updatedAt) : 'Not specified'" label="Updated At" variant="outlined" readonly class="custom-input" />
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn color="grey" variant="outlined" @click="$router.push('/vacancies')">Close</v-btn>
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

export default {
  name: 'ViewVacancyPage',
  data() {
    return { vacancy: null, loading: true, error: null }
  },
  methods: {
    async loadVacancy() {
      this.loading = true; this.error = null
      try {
        const ref = doc(db, 'vacancies', this.$route.params.id)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const d = snap.data()
          this.vacancy = {
            id: snap.id,
            ...d,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : d.createdAt,
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : d.updatedAt
          }
        } else {
          this.error = 'Vacancy not found'
        }
      } catch (e) { this.error = 'Failed to load vacancy' } finally { this.loading = false }
    },
    formatDate(val) { try { const d = typeof val?.toDate === 'function' ? val.toDate() : new Date(val); return d.toLocaleString() } catch { return String(val || 'N/A') } }
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
