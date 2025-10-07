<template>
  <div class="property-docs-page">
    <v-container fluid>
      <!-- Back -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="goBack"
            class="back-btn"
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
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading property documents...</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Documents (read‑only) -->
          <v-card v-else class="form-card" elevation="0">
            <v-card-text>
              <!-- Centered search -->
              <div class="doc-search">
                <v-text-field
                  v-model="search"
                  label="Search documents..."
                  prepend-inner-icon="mdi-magnify"
                  density="comfortable"
                  variant="outlined"
                  clearable
                  hide-details
                  class="search-input"
                />
              </div>

              <div class="docs-section">
                <h3 class="docs-title">Quotes</h3>
                <div v-if="filteredQuotes.length" class="doc-list">
                  <div v-for="(docItem, idx) in filteredQuotes" :key="'q-'+idx" class="doc-item">
                    <v-icon color="primary" class="mr-2">mdi-file-document</v-icon>
                    <span class="doc-name">{{ docItem.fileName || 'Document' }}</span>
                    <v-btn size="small" variant="outlined" color="primary" class="ml-2" @click="viewDoc(docItem)">View</v-btn>
                    <a v-if="docItem.fileURL" class="ml-2" :href="docItem.fileURL" target="_blank">Download</a>
                  </div>
                </div>
                <div v-else class="text-medium-emphasis">No quotes uploaded.</div>
              </div>

              <v-divider class="my-6" />

              <div class="docs-section">
                <h3 class="docs-title">Inspections</h3>
                <div v-if="filteredInspections.length" class="doc-list">
                  <div v-for="(docItem, idx) in filteredInspections" :key="'i-'+idx" class="doc-item">
                    <v-icon color="success" class="mr-2">mdi-clipboard-check</v-icon>
                    <span class="doc-name">{{ docItem.fileName || 'Document' }}</span>
                    <v-btn size="small" variant="outlined" color="success" class="ml-2" @click="viewDoc(docItem)">View</v-btn>
                    <a v-if="docItem.fileURL" class="ml-2" :href="docItem.fileURL" target="_blank">Download</a>
                  </div>
                </div>
                <div v-else class="text-medium-emphasis">No inspection documents uploaded.</div>
              </div>

              <v-divider class="my-6" />

              <div class="docs-section">
                <h3 class="docs-title">Invoices</h3>
                <div v-if="filteredInvoices.length" class="doc-list">
                  <div v-for="(docItem, idx) in filteredInvoices" :key="'inv-'+idx" class="doc-item">
                    <v-icon color="success" class="mr-2">mdi-receipt</v-icon>
                    <span class="doc-name">{{ docItem.fileName || 'Document' }}</span>
                    <v-btn size="small" variant="outlined" color="success" class="ml-2" @click="viewDoc(docItem)">View</v-btn>
                    <a v-if="docItem.fileURL" class="ml-2" :href="docItem.fileURL" target="_blank">Download</a>
                  </div>
                </div>
                <div v-else class="text-medium-emphasis">No invoices uploaded.</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Document Viewer Dialog -->
    <div v-if="showDialog" class="document-overlay" @click.self="showDialog = false">
      <div class="document-dialog">
        <div class="document-dialog-bg"></div>
        <div class="document-dialog-inner">
          <button class="document-close" @click="showDialog = false">&times;</button>

          <h2 class="document-title">{{ currentName || 'Document' }}</h2>
          <p class="document-subtitle">Property Documents</p>
          
          <div v-if="currentURL" class="pdf-container">
            <div class="pdf-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
            <div class="pdf-wrapper" :style="{ transform: `scale(${zoom})` }">
              <iframe :src="currentURL" width="100%" height="420" frameborder="0" class="pdf-iframe" />
            </div>
          </div>
          <div v-else class="no-pdf-message">
            <v-icon color="error" size="48">mdi-file-pdf-box</v-icon>
            <p>PDF file not available</p>
          </div>
          <div class="document-actions">
            <button class="document-button secondary" @click="showDialog = false">Close</button>
            <button v-if="currentURL" class="document-button primary" @click="openInNewTab">Open in New Tab</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'PropertyDocumentsPage',
  data() {
    return {
      loading: true,
      error: null,
      property: {},
      search: '',
      showDialog: false,
      currentURL: '',
      currentName: '',
      zoom: 1
    }
  },
  computed: {
    filteredQuotes() {
      const q = (this.search || '').toLowerCase()
      const list = Array.isArray(this.property?.quotes) ? this.property.quotes : []
      if (!q) return list
      return list.filter(d => String(d?.fileName || '').toLowerCase().includes(q))
    },
    filteredInspections() {
      const q = (this.search || '').toLowerCase()
      const list = Array.isArray(this.property?.inspections) ? this.property.inspections : []
      if (!q) return list
      return list.filter(d => String(d?.fileName || '').toLowerCase().includes(q))
    },
    filteredInvoices() {
      const q = (this.search || '').toLowerCase()
      const list = Array.isArray(this.property?.invoices) ? this.property.invoices : []
      if (!q) return list
      return list.filter(d => String(d?.fileName || '').toLowerCase().includes(q))
    }
  },
  methods: {
    async loadPropertyData(id) {
      this.loading = true
      try {
        const snap = await getDoc(doc(db, 'units', id))
        if (!snap.exists()) { this.error = 'Property not found'; return }
        const data = snap.data() || {}
        this.property = { id: snap.id, ...data }
      } catch (e) {
        console.error('Load property failed', e)
        this.error = 'Failed to load property documents'
      } finally { this.loading = false }
    },
    viewDoc(docItem) {
      this.currentURL = docItem?.fileURL || ''
      this.currentName = docItem?.fileName || 'Document'
      if (this.currentURL) this.showDialog = true
    },
    openInNewTab() { if (this.currentURL) window.open(this.currentURL, '_blank') },
    zoomIn() { if (this.zoom < 2) this.zoom += 0.1 },
    zoomOut() { if (this.zoom > 0.5) this.zoom -= 0.1 },
    goBack() {
      const from = this.$route?.query?.from
      if (from === 'onboard') this.$router.push('/onboard-units')
      else this.$router.push('/active-units')
    }
  },
  async mounted() { await this.loadPropertyData(this.$route.params.id) }
}
</script>

<style scoped>
.property-docs-page { padding: 20px; min-height: 100vh; }
.back-btn { font-weight: 500; text-transform: none; border-radius: 8px; transition: all 0.3s ease; background-color: black !important; color: white !important; border: 2px solid black !important; width: 160px; height: 44px; }
.back-btn:hover { background-color: #333 !important; border-color: #333 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); }
.title-section { background: black; color: white; padding: 0.75rem; border-radius: 12px 12px 0 0; }
.page-title { font-size: 1.25rem; font-weight: 600; color: white; margin: 0; text-align: center; text-transform: uppercase; }
.form-card { background: white; border-radius: 0 0 12px 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }
.docs-section { margin: 10px 0 20px 0; }
.docs-title { font-weight: 700; margin: 0 0 8px 0; }
.doc-list { display: flex; flex-direction: column; gap: 8px; }
.doc-item { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border: 1px solid #eee; border-radius: 8px; }
.doc-name { font-weight: 500; }
/* Centered search styling */
.doc-search { display: flex; justify-content: center; margin: 14px 0 18px 0; }
.search-input { max-width: 520px; width: 100%; }
.document-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100000; }
.document-dialog { position: relative; width: 90vw; max-width: 900px; min-height: 300px; }
.document-dialog-bg { position: absolute; top: 12px; left: 12px; width: 96%; height: 100%; border-radius: 16px; box-shadow: 0 6px 24px rgba(0,0,0,0.15); background: #111; }
.document-dialog-inner { position: relative; background: #ffffff; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,0.15); }
.document-close { position: absolute; top: 12px; right: 12px; background: transparent; border: none; font-size: 24px; cursor: pointer; line-height: 1; }
.document-title { font-size: 2em; margin: 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
.document-subtitle { font-size: 1.1rem; margin: 0 0 16px 0; color: #6b7280; }
.pdf-container { position: relative; margin-top: 8px; }
.pdf-controls { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px; }
.zoom-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #ddd; background: #000; color: #fff; }
.pdf-wrapper { transform-origin: top left; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
.document-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
.document-button { border: none; border-radius: 8px; color: #ffffff; font-size: 0.95rem; padding: 10px 16px; cursor: pointer; }
.document-button.secondary { background-color: #6b7280; }
.document-button.primary { background-color: #111827; }
</style>

