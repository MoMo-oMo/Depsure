<template>
  <div class="property-docs-page">
    <v-container fluid>
      <!-- Back -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="goBack"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Property Documents</h1>
          </div>

          <!-- Loading / Error -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular color="primary" indeterminate />
              <p class="mt-4">Loading property documents...</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon color="error" icon="mdi-alert" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Documents (read‑only) -->
          <v-card v-else class="form-card" elevation="0">
            <v-card-text>
              <!-- Search and Date Filter -->
              <div class="doc-search">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="search"
                      class="search-input"
                      clearable
                      density="comfortable"
                      hide-details
                      label="Search documents..."
                      prepend-inner-icon="mdi-magnify"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="dateFilter"
                      class="date-input"
                      clearable
                      density="comfortable"
                      hide-details
                      label="Filter by date..."
                      prepend-inner-icon="mdi-calendar"
                      type="date"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </div>

              <div class="docs-section">
                <h3 class="docs-title">Quotes</h3>
                <div v-if="filteredQuotes.length > 0" class="doc-list">
                  <div
                    v-for="(docItem, idx) in filteredQuotes"
                    :key="'q-' + idx"
                    class="doc-item"
                  >
                    <v-icon
                      class="mr-2"
                      color="primary"
                    >mdi-file-document</v-icon>
                    <span class="doc-name">{{
                      docItem.fileName || "Document"
                    }}</span>
                    <v-btn
                      class="ml-2"
                      color="primary"
                      size="small"
                      variant="outlined"
                      @click="viewDoc(docItem)"
                    >View</v-btn>
                    <a
                      v-if="docItem.fileURL"
                      class="download-link ml-2"
                      :href="docItem.fileURL"
                      target="_blank"
                    >Download</a>
                  </div>
                </div>
                <div v-else class="text-medium-emphasis">
                  No quotes uploaded.
                </div>
              </div>

              <v-divider class="my-6" />

              <div class="docs-section">
                <h3 class="docs-title">Inspections</h3>
                <div v-if="filteredInspections.length > 0" class="doc-list">
                  <div
                    v-for="(docItem, idx) in filteredInspections"
                    :key="'i-' + idx"
                    class="doc-item"
                  >
                    <v-icon
                      class="mr-2"
                      color="success"
                    >mdi-clipboard-check</v-icon>
                    <span class="doc-name">{{
                      docItem.fileName || "Document"
                    }}</span>
                    <v-btn
                      class="ml-2"
                      color="success"
                      size="small"
                      variant="outlined"
                      @click="viewDoc(docItem)"
                    >View</v-btn>
                    <a
                      v-if="docItem.fileURL"
                      class="download-link ml-2"
                      :href="docItem.fileURL"
                      target="_blank"
                    >Download</a>
                  </div>
                </div>
                <div v-else class="text-medium-emphasis">
                  No inspection documents uploaded.
                </div>
              </div>

              <v-divider class="my-6" />

              <div class="docs-section">
                <h3 class="docs-title">Invoices</h3>
                <div v-if="filteredInvoices.length > 0" class="doc-list">
                  <div
                    v-for="(docItem, idx) in filteredInvoices"
                    :key="'inv-' + idx"
                    class="doc-item"
                  >
                    <v-icon
                      class="mr-2"
                      color="success"
                    >mdi-receipt-text</v-icon>
                    <span class="doc-name">{{
                      docItem.fileName || "Document"
                    }}</span>
                    <v-btn
                      class="ml-2"
                      color="success"
                      size="small"
                      variant="outlined"
                      @click="viewDoc(docItem)"
                    >View</v-btn>
                    <a
                      v-if="docItem.fileURL"
                      class="download-link ml-2"
                      :href="docItem.fileURL"
                      target="_blank"
                    >Download</a>
                  </div>
                </div>
                <div v-else class="text-medium-emphasis">
                  No invoices uploaded.
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Document Viewer Dialog -->
    <div
      v-if="showDialog"
      class="document-overlay"
      @click.self="showDialog = false"
    >
      <div class="document-dialog">
        <div class="document-dialog-bg" />
        <div class="document-dialog-inner">
          <button class="document-close" @click="showDialog = false">
            &times;
          </button>

          <h2 class="document-title">{{ currentName || "Document" }}</h2>
          <p class="document-subtitle">Property Documents</p>

          <div v-if="currentURL" class="pdf-container">
            <div class="pdf-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
            <div class="pdf-wrapper" :style="{ transform: `scale(${zoom})` }">
              <iframe
                class="pdf-iframe"
                frameborder="0"
                height="420"
                :src="currentURL"
                width="100%"
              />
            </div>
          </div>
          <div v-else class="no-pdf-message">
            <v-icon color="error" size="48">mdi-file-pdf-box</v-icon>
            <p>PDF file not available</p>
          </div>
          <div class="document-actions">
            <button
              class="document-button secondary"
              @click="showDialog = false"
            >
              Close
            </button>
            <button
              v-if="currentURL"
              class="document-button primary"
              @click="openInNewTab"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { doc, getDoc } from 'firebase/firestore'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'PropertyDocumentsPage',
    data () {
      return {
        loading: true,
        error: null,
        property: {},
        search: '',
        dateFilter: '',
        showDialog: false,
        currentURL: '',
        currentName: '',
        zoom: 1,
      }
    },
    computed: {
      isAgencyContext () {
        const appStore = useAppStore()
        const u = appStore.currentUser
        return (
          u?.userType === 'Agency'
          || (u?.userType === 'Admin' && u?.adminScope === 'agency')
        )
      },
      filteredQuotes () {
        const q = (this.search || '').toLowerCase()
        const list = Array.isArray(this.property?.quotes)
          ? [...this.property.quotes]
          : []
        const sorted = this.sortByNewest(list)

        let filtered = sorted

        // Apply search filter
        if (q) {
          filtered = filtered.filter(d =>
            String(d?.fileName || '')
              .toLowerCase()
              .includes(q),
          )
        }

        // Apply date filter
        if (this.dateFilter) {
          filtered = filtered.filter(d =>
            this.matchesDateFilter(d, this.dateFilter),
          )
        }

        return this.isAgencyContext ? filtered.slice(0, 3) : filtered
      },
      filteredInspections () {
        const q = (this.search || '').toLowerCase()
        const list = Array.isArray(this.property?.inspections)
          ? [...this.property.inspections]
          : []
        const sorted = this.sortByNewest(list)

        let filtered = sorted

        // Apply search filter
        if (q) {
          filtered = filtered.filter(d =>
            String(d?.fileName || '')
              .toLowerCase()
              .includes(q),
          )
        }

        // Apply date filter
        if (this.dateFilter) {
          filtered = filtered.filter(d =>
            this.matchesDateFilter(d, this.dateFilter),
          )
        }

        return this.isAgencyContext ? filtered.slice(0, 3) : filtered
      },
      filteredInvoices () {
        const q = (this.search || '').toLowerCase()
        const list = Array.isArray(this.property?.invoices)
          ? [...this.property.invoices]
          : []
        const sorted = this.sortByNewest(list)

        let filtered = sorted

        // Apply search filter
        if (q) {
          filtered = filtered.filter(d =>
            String(d?.fileName || '')
              .toLowerCase()
              .includes(q),
          )
        }

        // Apply date filter
        if (this.dateFilter) {
          filtered = filtered.filter(d =>
            this.matchesDateFilter(d, this.dateFilter),
          )
        }

        return this.isAgencyContext ? filtered.slice(0, 3) : filtered
      },
    },
    async mounted () {
      await this.loadPropertyData(this.$route.params.id)
    },
    methods: {
      sortByNewest (arr) {
        try {
          const withKeys = (arr || []).map((d, i) => ({
            item: d,
            ts: this.extractTimestamp(d),
            idx: i,
          }))
          // Sort descending by timestamp; fall back to original order when equal
          withKeys.sort((a, b) => {
            if (a.ts === b.ts) return b.idx - a.idx // assume later index is newer
            return (b.ts || 0) - (a.ts || 0)
          })
          return withKeys.map(x => x.item)
        } catch {
          return Array.isArray(arr) ? arr : []
        }
      },
      extractTimestamp (d) {
        try {
          const raw
            = d?.uploadedAt || d?.createdAt || d?.date || d?.timestamp || null
          if (!raw) return 0
          if (raw?.toDate) {
            return raw.toDate().getTime()
          }
          const t = new Date(raw).getTime()
          return Number.isFinite(t) ? t : 0
        } catch {
          return 0
        }
      },
      matchesDateFilter (doc, filterDate) {
        try {
          const docTimestamp = this.extractTimestamp(doc)
          if (!docTimestamp) return false

          const docDate = new Date(docTimestamp)
          const filterDateObj = new Date(filterDate)

          // Compare dates (ignore time)
          const docDateStr = docDate.toISOString().split('T')[0]
          const filterDateStr = filterDateObj.toISOString().split('T')[0]

          return docDateStr === filterDateStr
        } catch {
          return false
        }
      },
      async loadPropertyData (id) {
        this.loading = true
        try {
          const snap = await getDoc(doc(db, 'units', id))
          if (!snap.exists()) {
            this.error = 'Property not found'
            return
          }
          const data = snap.data() || {}
          this.property = { id: snap.id, ...data }
        } catch (error) {
          console.error('Load property failed', error)
          this.error = 'Failed to load property documents'
        } finally {
          this.loading = false
        }
      },
      viewDoc (docItem) {
        this.currentURL = docItem?.fileURL || ''
        this.currentName = docItem?.fileName || 'Document'
        if (this.currentURL) this.showDialog = true
      },
      openInNewTab () {
        if (this.currentURL) window.open(this.currentURL, '_blank')
      },
      zoomIn () {
        if (this.zoom < 2) this.zoom += 0.1
      },
      zoomOut () {
        if (this.zoom > 0.5) this.zoom -= 0.1
      },
      goBack () {
        const from = this.$route?.query?.from
        if (from === 'onboard') this.$router.push('/onboard-units')
        else this.$router.push('/active-units')
      },
    },
  }
</script>

<style scoped>
.property-docs-page {
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
.title-section {
  background: black;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
}
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Document sections - enhanced styling */
.docs-section {
  margin-bottom: 32px;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
}

.docs-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.doc-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.doc-name {
  flex: 1;
  font-weight: 500;
  color: #333;
  margin-left: 8px;
}

/* Download link button styling */
.download-link {
  display: inline-block;
  padding: 6px 16px;
  background-color: #000;
  color: white !important;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #000;
  transition: all 0.3s ease;
  text-align: center;
}

.download-link:hover {
  background-color: #333;
  border-color: #333;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Search and date filter styling */
.doc-search {
  margin: 14px 0 24px 0;
}
.search-input,
.date-input {
  width: 100%;
}
.search-input .v-field,
.date-input .v-field {
  border-radius: 8px;
  transition: all 0.3s ease;
}
.search-input .v-field:focus-within,
.date-input .v-field:focus-within {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

/* Document viewer dialog */
.document-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}
.document-dialog {
  position: relative;
  width: 90vw;
  max-width: 900px;
  min-height: 300px;
}
.document-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  background: #111;
}
.document-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}
.document-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}
.document-title {
  font-size: 2em;
  margin: 8px 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.document-subtitle {
  font-size: 1.1rem;
  margin: 0 0 16px 0;
  color: #6b7280;
}
.pdf-container {
  position: relative;
  margin-top: 8px;
}
.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 6px;
}
.zoom-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #000;
  color: #fff;
  cursor: pointer;
}
.zoom-btn:hover {
  background: #333;
}
.pdf-wrapper {
  transform-origin: top left;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}
.document-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}
.document-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.95rem;
  padding: 10px 16px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}
.document-button.secondary {
  background-color: #6b7280;
}
.document-button.primary {
  background-color: #111827;
}
.document-button:hover {
  opacity: 0.9;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .property-docs-page {
    padding: 10px;
  }
  .form-card {
    padding: 16px;
  }
  .docs-section {
    padding: 16px;
  }
  .doc-item {
    padding: 10px;
  }
}
</style>
