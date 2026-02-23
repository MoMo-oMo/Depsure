<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="goBack"
          >Back</v-btn>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section"><h1 class="page-title">View Vacancy Details</h1></div>
          <v-card class="content-card" elevation="0">
            <div v-if="loading" class="loading-container">
              <v-progress-circular color="black" indeterminate size="64" />
              <p class="loading-text">Loading vacancy details...</p>
            </div>
            <div v-else-if="error" class="error-container">
              <v-icon color="error" size="64">mdi-alert-circle</v-icon>
              <h3 class="error-title">Error Loading Vacancy</h3>
              <p class="error-message">{{ error }}</p>
              <v-btn color="black" variant="elevated" @click="loadVacancy">Try Again</v-btn>
            </div>
            <template v-else-if="vacancy">
              <v-tabs
                v-model="activeTab"
                class="vacancy-tabs"
                color="primary"
              >
                <v-tab class="tab-label tab--details" value="details">
                  Vacancy Details
                </v-tab>
                <v-tab class="tab-label tab--documents" value="documents">
                  Documents
                </v-tab>
              </v-tabs>

              <v-window v-model="activeTab">
                <v-window-item value="details">
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Unit Name/Address"
                          :model-value="vacancy.unitName"
                          readonly
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Date Vacated"
                          :model-value="formatDate(vacancy.dateVacated)"
                          readonly
                          variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Lease Start Date"
                          :model-value="formatDate(vacancy.leaseStartDate, 'Not specified')"
                          readonly
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Lease End Date"
                          :model-value="formatDate(vacancy.leaseEndDate, 'Not specified')"
                          readonly
                          variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Property Type"
                          :model-value="vacancy.propertyType || 'residential'"
                          readonly
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Months Missed Rent"
                          :model-value="vacancy.monthsMissed"
                          readonly
                          variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Maintenance Amount"
                          :model-value="formatCurrency(vacancy.maintenanceAmount)"
                          readonly
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Paid Out Amount"
                          :model-value="formatCurrency(vacancy.paidOutAmount)"
                          readonly
                          variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Created At"
                          :model-value="formatDate(vacancy.createdAt, 'Not specified')"
                          readonly
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Updated At"
                          :model-value="formatDate(vacancy.updatedAt, 'Not specified')"
                          readonly
                          variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Paid Towards Fund"
                          :model-value="formatCurrency(vacancy.paidTowardsFund)"
                          readonly
                          variant="outlined"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          class="custom-input"
                          label="Paid Out (Yes/No)"
                          :model-value="formatPaidOut(vacancy.paidOut)"
                          readonly
                          variant="outlined"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-window-item>

                <v-window-item value="documents">
                  <v-card-text class="documents-tab">
                    <div v-if="documentsLoading" class="documents-loading">
                      <v-progress-circular color="black" indeterminate />
                      <p class="text-medium-emphasis mt-3">
                        Loading supporting documents…
                      </p>
                    </div>
                    <div v-else-if="documentsError" class="documents-error">
                      <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
                      <span>{{ documentsError }}</span>
                    </div>
                    <div v-else>
                      <h3 class="documents-title">Supporting Documents</h3>
                      <div
                        v-if="documentsLoaded && !unitDocumentId"
                        class="documents-empty text-medium-emphasis mb-4"
                      >
                        No unit is linked to this vacancy yet, so documents are
                        not available.
                      </div>

                      <div v-else>
                        <div class="doc-filters">
                          <v-text-field
                            v-model="docFilterSearch"
                            class="custom-input doc-search"
                            clearable
                            density="comfortable"
                            hide-details
                            label="Search documents..."
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                          />
                          <v-text-field
                            v-model="docFilterMonth"
                            class="custom-input doc-month-input"
                            clearable
                            density="comfortable"
                            hide-details
                            label="Month"
                            type="month"
                            variant="outlined"
                          />
                        </div>

                        <div class="documents-section">
                          <div class="document-category category-quotes">
                            <div class="category-header">
                              <h4 class="category-title">
                                <v-icon
                                  class="mr-2"
                                  color="primary"
                                >mdi-file-pdf-box</v-icon>
                                Quotes
                              </h4>
                            </div>
                            <div
                              v-if="filteredQuotes.length > 0"
                              class="document-list"
                            >
                              <div
                                v-for="(docItem, index) in filteredQuotes"
                                :key="docItem.fileURL || docItem.name || index"
                                class="document-item"
                              >
                                <v-icon
                                  class="mr-2"
                                  color="primary"
                                >mdi-file-pdf-box</v-icon>
                                <span class="document-name">{{
                                  docItem.fileName ||
                                    docItem.name ||
                                    "Document"
                                }}</span>
                                <v-btn
                                  class="view-btn"
                                  color="primary"
                                  :disabled="!docItem.fileURL"
                                  size="small"
                                  variant="outlined"
                                  @click="openDocument(docItem)"
                                >
                                  View
                                </v-btn>
                              </div>
                            </div>
                            <div v-else class="no-documents">
                              <v-icon
                                class="mr-2"
                                color="grey"
                              >mdi-file-pdf-box</v-icon>
                              No quotes available.
                            </div>
                          </div>

                          <div class="document-category category-inspections">
                            <div class="category-header">
                              <h4 class="category-title">
                                <v-icon
                                  class="mr-2"
                                  color="warning"
                                >mdi-clipboard-check</v-icon>
                                Inspections
                              </h4>
                            </div>
                            <div
                              v-if="filteredInspections.length > 0"
                              class="document-list"
                            >
                              <div
                                v-for="(docItem, index) in filteredInspections"
                                :key="docItem.fileURL || docItem.name || index"
                                class="document-item"
                              >
                                <v-icon
                                  class="mr-2"
                                  color="warning"
                                >mdi-clipboard-check</v-icon>
                                <span class="document-name">{{
                                  docItem.fileName ||
                                    docItem.name ||
                                    "Document"
                                }}</span>
                                <v-btn
                                  class="view-btn"
                                  color="warning"
                                  :disabled="!docItem.fileURL"
                                  size="small"
                                  variant="outlined"
                                  @click="openDocument(docItem)"
                                >
                                  View
                                </v-btn>
                              </div>
                            </div>
                            <div v-else class="no-documents">
                              <v-icon
                                class="mr-2"
                                color="grey"
                              >mdi-clipboard-check</v-icon>
                              No inspections available.
                            </div>
                          </div>

                          <div class="document-category category-invoices">
                            <div class="category-header">
                              <h4 class="category-title">
                                <v-icon
                                  class="mr-2"
                                  color="success"
                                >mdi-receipt</v-icon>
                                Invoices
                              </h4>
                            </div>
                            <div
                              v-if="filteredInvoices.length > 0"
                              class="document-list"
                            >
                              <div
                                v-for="(docItem, index) in filteredInvoices"
                                :key="docItem.fileURL || docItem.name || index"
                                class="document-item"
                              >
                                <v-icon
                                  class="mr-2"
                                  color="success"
                                >mdi-receipt</v-icon>
                                <span class="document-name">{{
                                  docItem.fileName ||
                                    docItem.name ||
                                    "Document"
                                }}</span>
                                <v-btn
                                  class="view-btn"
                                  color="success"
                                  :disabled="!docItem.fileURL"
                                  size="small"
                                  variant="outlined"
                                  @click="openDocument(docItem)"
                                >
                                  View
                                </v-btn>
                              </div>
                            </div>
                            <div v-else class="no-documents">
                              <v-icon
                                class="mr-2"
                                color="grey"
                              >mdi-receipt</v-icon>
                              No invoices available.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-window-item>
              </v-window>
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
  import { doc, getDoc } from 'firebase/firestore'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'ViewVacancyPage',
    data () {
      return {
        vacancy: null,
        loading: true,
        error: null,
        unitDocumentId: '',
        activeTab: 'details',
        documentsLoaded: false,
        documentsLoading: false,
        documentsError: null,
        documents: {
          quotes: [],
          inspections: [],
          invoices: [],
        },
        docFilterSearch: '',
        docFilterMonth: '',
      }
    },
    computed: {
      filteredQuotes () {
        return this.filterDocumentsList(this.documents.quotes)
      },
      filteredInspections () {
        return this.filterDocumentsList(this.documents.inspections)
      },
      filteredInvoices () {
        return this.filterDocumentsList(this.documents.invoices)
      },
    },
    watch: {
      unitDocumentId (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.loadDocuments(true)
        }
      },
      activeTab (newVal) {
        if (newVal === 'documents') {
          this.loadDocuments()
        }
      },
    },
    mounted () {
      try {
        const initialTab = this.$route?.query?.tab
        if (initialTab === 'documents' || initialTab === 'details') {
          this.activeTab = initialTab
        }
      } catch {}
      this.loadVacancy()
    },
    methods: {
      async loadDocuments (force = false) {
        if (!this.unitDocumentId) {
          this.documents = { quotes: [], inspections: [], invoices: [] }
          this.documentsLoaded = false
          return
        }
        if (this.documentsLoading) return
        if (this.documentsLoaded && !force) return
        this.documentsLoading = true
        this.documentsError = null
        try {
          const snap = await getDoc(doc(db, 'units', this.unitDocumentId))
          if (snap.exists()) {
            const data = snap.data() || {}
            this.documents = {
              quotes: Array.isArray(data.quotes) ? data.quotes : [],
              inspections: Array.isArray(data.inspections)
                ? data.inspections
                : [],
              invoices: Array.isArray(data.invoices) ? data.invoices : [],
            }
            this.documentsLoaded = true
          } else {
            this.documents = { quotes: [], inspections: [], invoices: [] }
            this.documentsLoaded = true
            this.documentsError = 'No documents found for this unit.'
          }
        } catch (error) {
          console.error('Failed to load supporting documents', error)
          this.documentsError = 'Failed to load supporting documents.'
        } finally {
          this.documentsLoading = false
        }
      },
      resolveDocumentDate (entry) {
        if (!entry) return null
        const raw
          = entry.uploadedAt || entry.createdAt || entry.date || entry.timestamp
        if (!raw) return null
        try {
          if (typeof raw.toDate === 'function') return raw.toDate()
          return new Date(raw)
        } catch {
          return null
        }
      },
      monthKey (date) {
        if (!date || Number.isNaN(date.getTime())) return ''
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0',
        )}`
      },
      filterDocumentsList (list) {
        if (!Array.isArray(list) || list.length === 0) return []
        const hasFilter = this.docFilterSearch || this.docFilterMonth
        if (hasFilter) {
          const term = (this.docFilterSearch || '').toLowerCase()
          const month = this.docFilterMonth || ''
          return list.filter(item => {
            const name = String(item?.fileName || item?.name || '').toLowerCase()
            const date = this.resolveDocumentDate(item)
            const matchesTerm = term ? name.includes(term) : true
            const matchesMonth = month ? this.monthKey(date) === month : true
            return matchesTerm && matchesMonth
          })
        }
        const sorted = [...list].sort((a, b) => {
          const dateA = this.resolveDocumentDate(a)
          const dateB = this.resolveDocumentDate(b)
          if (!dateA && !dateB) return 0
          if (!dateA) return 1
          if (!dateB) return -1
          return dateB.getTime() - dateA.getTime()
        })
        return sorted.slice(0, 3)
      },
      formatDocumentDate (entry) {
        const date = this.resolveDocumentDate(entry)
        if (!date) return ''
        return date.toISOString().slice(0, 10)
      },
      openDocument (entry) {
        const url = entry?.fileURL || entry?.url
        if (!url) return
        window.open(url, '_blank')
      },
      goBack () {
        try {
          const appStore = useAppStore()
          const user = appStore.currentUser
          const isAgency = user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency')
          if (isAgency) {
            this.$router.push('/onboard-units')
            return
          }
        } catch {}
        const from = this.$route?.query?.from
        if (from === 'onboard') {
          this.$router.push('/onboard-units')
        } else {
          this.$router.push('/vacancies')
        }
      },
      async loadVacancy () {
        this.loading = true; this.error = null
        try {
          const ref = doc(db, 'vacancies', this.$route.params.id)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const data = snap.data()
            this.vacancy = this.normalizeVacancyData(data, snap.id)
            this.documentsLoaded = false
            this.documents = { quotes: [], inspections: [], invoices: [] }
            this.unitDocumentId = this.vacancy?.unitId || ''
            if (!this.unitDocumentId) {
              await this.resolveUnitForDocuments(this.vacancy)
            }
          } else {
            this.error = 'Vacancy not found'
          }
        } catch {
          this.error = 'Failed to load vacancy'
        } finally {
          this.loading = false
        }
      },
      toDateValue (val) {
        if (!val) return null
        try {
          if (typeof val?.toDate === 'function') return val.toDate()
          const date = new Date(val)
          return Number.isNaN(date.getTime()) ? null : date
        } catch {
          return null
        }
      },
      toNumber (val, fallback = 0) {
        if (val === null || val === undefined || val === '') return fallback
        const num = typeof val === 'number' ? val : Number(val)
        return Number.isFinite(num) ? num : fallback
      },
      formatDate (val, fallback = 'N/A') {
        const date = this.toDateValue(val)
        if (date) return date.toISOString().slice(0, 10)
        if (typeof val === 'string' && val) return val
        return fallback
      },
      formatCurrency (val) {
        const amount = this.toNumber(val, 0)
        return `R${amount.toLocaleString()}`
      },
      formatPaidOut (val) {
        if (val === true || val === 'Yes' || val === 'yes') return 'Yes'
        if (val === false || val === 'No' || val === 'no') return 'No'
        return String(val || 'Not specified')
      },
      normalizeVacancyData (data, id) {
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
          maintenanceAmount: this.toNumber(data?.maintenanceAmount, 0),
          paidOutAmount: this.toNumber(data?.paidOutAmount, 0),
        }
        return base
      },
      async resolveUnitForDocuments (vacancy) {
        try {
          if (!vacancy) return
          const candidates = [
            vacancy.unitName,
            vacancy.propertyName,
            vacancy.unitNumber,
          ]
            .map(value =>
              typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '',
            )
            .filter(Boolean)
          if (candidates.length === 0) {
            this.unitDocumentId = ''
            return
          }
          const { collection, query, where, getDocs } = await import(
            'firebase/firestore',
          )
          for (const candidate of candidates) {
            const q = query(collection(db, 'units'), where('unitName', '==', candidate))
            const snap = await getDocs(q)
            if (!snap.empty) {
              this.unitDocumentId = snap.docs[0].id
              this.loadDocuments(true)
              return
            }
            const alt = query(
              collection(db, 'units'),
              where('propertyName', '==', candidate),
            )
            const altSnap = await getDocs(alt)
            if (!altSnap.empty) {
              this.unitDocumentId = altSnap.docs[0].id
              this.loadDocuments(true)
              return
            }
          }
          this.unitDocumentId = ''
          this.documentsLoaded = false
          this.documents = { quotes: [], inspections: [], invoices: [] }
        } catch (error) {
          console.warn('Failed to resolve vacancy documents', error)
          this.unitDocumentId = ''
          this.documentsLoaded = false
          this.documents = { quotes: [], inspections: [], invoices: [] }
        }
      },
    },
  }
</script>

<style scoped>
.view-vacancy-page { padding:20px; min-height:100vh; }
.back-btn { font-weight:500; text-transform:none; border-radius:8px; background-color:black !important; color:white !important; border:2px solid black !important; width:160px; height:44px; }
.title-section { background:black; color:white; padding:0.75rem; border-radius:12px 12px 0 0; }
.page-title { font-size:1.25rem; font-weight:600; color:white; margin:0; text-align:center; text-transform:uppercase; }
.content-card { background:white; border-radius:0 0 12px 12px; }
.custom-input .v-field { border-radius:8px; }
.vacancy-tabs {
  border-bottom: 1px solid #e9ecef;
}
.vacancy-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 600;
}
.vacancy-tabs :deep(.v-tab--selected) {
  color: #000000 !important;
}
.documents-tab {
  padding: 24px 16px;
}
.documents-title {
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
  color: #333;
  margin-bottom: 24px;
}
.documents-loading,
.documents-error,
.documents-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
  margin-top: 32px;
}
.documents-loading {
  flex-direction: column;
}
.documents-error {
  color: #b91c1c;
  font-weight: 500;
}
.doc-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.doc-filters .doc-search,
.doc-filters .doc-month {
  flex: 1 1 260px;
}

.documents-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.document-category {
  padding: 18px;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.category-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.document-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.document-name {
  flex: 1;
  font-weight: 500;
  color: #333;
  margin-left: 8px;
}

.view-btn {
  margin-left: 12px;
}

.no-documents {
  display: flex;
  align-items: center;
  gap: 8px;
  font-style: italic;
  color: #6b7280;
}
.loading-container, .error-container { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; }
.error-title { margin:6px 0 }
</style>
