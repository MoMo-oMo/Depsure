<template>
  <div class="view-property-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/archived-units')"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Archived Property Details</h1>
          </div>

          <!-- Property Information Card -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular color="primary" indeterminate />
              <p class="mt-4">Loading archived property details...</p>
            </v-card-text>
          </v-card>

          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon color="error" icon="mdi-alert" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <div v-else class="form-card" elevation="0">
            <!-- Tabs -->
            <v-tabs v-model="activeTab" class="property-tabs" color="primary">
              <v-tab
                class="tab-label tab--details"
                value="details"
              >Property Details</v-tab>
              <v-tab
                class="tab-label tab--archive"
                value="archive"
              >Archive Information</v-tab>
              <v-tab
                class="tab-label tab--documents"
                value="documents"
              >Documents</v-tab>
            </v-tabs>

            <!-- Property Details Tab -->
            <v-window v-model="activeTab">
              <v-window-item value="details">
                <v-card-text>
                  <v-row>
                    <!-- Tenant Reference -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Tenant Reference"
                        :model-value="property.tenantRef"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Property Name -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Property Name"
                        :model-value="property.propertyName"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Property Type -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Property Type"
                        :model-value="propertyTypeLabel"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- New Occupation -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="New Occupation Yes/No"
                        :model-value="property.newOccupation"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Lease Starting Date -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Lease Starting Date"
                        :model-value="property.leaseStartDate"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Lease End Date -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Lease End Date"
                        :model-value="property.leaseEndDate"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Months Missed Rent Payment -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Months Missed Rent Payment"
                        :model-value="property.monthsMissed"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Maintenance Amount -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Maintenance Amount"
                        :model-value="`R${property.maintenanceAmount?.toLocaleString()}`"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Contractor Requested -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Contractor Requested"
                        :model-value="property.contractorRequested"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Paid Towards Fund -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Paid Towards Fund"
                        :model-value="`R${property.paidTowardsFund?.toLocaleString()}`"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Amount to be Paid Out -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Amount to be Paid Out (Inc Interest)"
                        :model-value="`R${property.amountToBePaidOut?.toLocaleString()}`"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Paid Out -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Paid Out Yes/No"
                        :model-value="property.paidOut"
                        readonly
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-window-item>

              <!-- Archive Information Tab -->
              <v-window-item value="archive">
                <v-card-text>
                  <v-row>
                    <!-- Archived Date -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Archived Date"
                        :model-value="formatDate(property.archivedAt)"
                        readonly
                        variant="outlined"
                      />
                    </v-col>

                    <!-- Archived By -->
                    <v-col cols="12" md="6">
                      <v-text-field
                        class="custom-input"
                        label="Archived By"
                        :model-value="property.archivedByUserType || 'Unknown'"
                        readonly
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>

                  <!-- Restore Button -->
                  <v-row class="mt-6">
                    <v-col class="text-center" cols="12">
                      <v-btn
                        class="restore-btn"
                        color="success"
                        :loading="restoring"
                        prepend-icon="mdi-restore"
                        size="large"
                        variant="outlined"
                        @click="restoreUnit"
                      >
                        Restore Unit
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-window-item>

              <!-- Documents Tab -->
              <v-window-item value="documents">
                <v-card-text>
                  <div class="documents-section">
                    <h3 class="documents-title">Property Documents</h3>

                    <!-- Quotes Section -->
                    <div class="document-category">
                      <h4 class="category-title">
                        <v-icon
                          class="mr-2"
                          color="primary"
                        >mdi-file-pdf-box</v-icon>
                        Quotes
                      </h4>
                      <div class="doc-filter-row">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="quotesSearchQuery"
                              class="search-input"
                              clearable
                              density="compact"
                              hide-details
                              label="Search quotes..."
                              prepend-inner-icon="mdi-magnify"
                              variant="outlined"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-select
                              v-model="selectedQuotesMonth"
                              class="doc-month-select"
                              density="compact"
                              hide-details
                              :items="['Latest', ...quoteMonthOptions]"
                              label="Month"
                              variant="outlined"
                            />
                          </v-col>
                        </v-row>
                      </div>
                      <div
                        v-if="filteredQuotes.length > 0"
                        class="document-list"
                      >
                        <div
                          v-for="(quote, index) in filteredQuotes"
                          :key="index"
                          class="document-item"
                        >
                          <v-icon
                            class="mr-2"
                            color="primary"
                          >mdi-file-pdf-box</v-icon>
                          <span class="document-name">{{
                            quote.fileName
                          }}</span>
                          <v-btn
                            class="view-btn"
                            color="primary"
                            size="small"
                            variant="outlined"
                            @click="viewDocument(quote.fileURL, quote.fileName)"
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
                        No quotes uploaded
                      </div>
                    </div>

                    <!-- Inspections Section -->
                    <div class="document-category">
                      <h4 class="category-title">
                        <v-icon
                          class="mr-2"
                          color="warning"
                        >mdi-clipboard-check</v-icon>
                        Inspections
                      </h4>
                      <div class="doc-filter-row">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="inspectionsSearchQuery"
                              class="search-input"
                              clearable
                              density="compact"
                              hide-details
                              label="Search inspections..."
                              prepend-inner-icon="mdi-magnify"
                              variant="outlined"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-select
                              v-model="selectedInspectionsMonth"
                              class="doc-month-select"
                              density="compact"
                              hide-details
                              :items="['Latest', ...inspectionMonthOptions]"
                              label="Month"
                              variant="outlined"
                            />
                          </v-col>
                        </v-row>
                      </div>
                      <div
                        v-if="filteredInspections.length > 0"
                        class="document-list"
                      >
                        <div
                          v-for="(inspection, index) in filteredInspections"
                          :key="index"
                          class="document-item"
                        >
                          <v-icon
                            class="mr-2"
                            color="warning"
                          >mdi-clipboard-check</v-icon>
                          <span class="document-name">{{
                            inspection.fileName
                          }}</span>
                          <v-btn
                            class="view-btn"
                            color="warning"
                            size="small"
                            variant="outlined"
                            @click="
                              viewDocument(
                                inspection.fileURL,
                                inspection.fileName
                              )
                            "
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
                        No inspections uploaded
                      </div>
                    </div>

                    <!-- Invoices Section -->
                    <div class="document-category">
                      <h4 class="category-title">
                        <v-icon
                          class="mr-2"
                          color="success"
                        >mdi-receipt</v-icon>
                        Invoices
                      </h4>
                      <div class="doc-filter-row">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="invoicesSearchQuery"
                              class="search-input"
                              clearable
                              density="compact"
                              hide-details
                              label="Search invoices..."
                              prepend-inner-icon="mdi-magnify"
                              variant="outlined"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-select
                              v-model="selectedInvoicesMonth"
                              class="doc-month-select"
                              density="compact"
                              hide-details
                              :items="['Latest', ...invoiceMonthOptions]"
                              label="Month"
                              variant="outlined"
                            />
                          </v-col>
                        </v-row>
                      </div>
                      <div
                        v-if="filteredInvoices.length > 0"
                        class="document-list"
                      >
                        <div
                          v-for="(invoice, index) in filteredInvoices"
                          :key="index"
                          class="document-item"
                        >
                          <v-icon
                            class="mr-2"
                            color="success"
                          >mdi-receipt</v-icon>
                          <span class="document-name">{{
                            invoice.fileName
                          }}</span>
                          <v-btn
                            class="view-btn"
                            color="success"
                            size="small"
                            variant="outlined"
                            @click="
                              viewDocument(invoice.fileURL, invoice.fileName)
                            "
                          >
                            View
                          </v-btn>
                        </div>
                      </div>
                      <div v-else class="no-documents">
                        <v-icon class="mr-2" color="grey">mdi-receipt</v-icon>
                        No invoices uploaded
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-window-item>
            </v-window>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Document Viewer Dialog -->
    <div
      v-if="showDocumentDialog"
      class="document-overlay"
      @click.self="showDocumentDialog = false"
    >
      <div class="document-dialog">
        <!-- colored card behind -->
        <div class="document-dialog-bg" />
        <!-- main white card -->
        <div class="document-dialog-inner">
          <button class="document-close" @click="showDocumentDialog = false">
            &times;
          </button>

          <div class="document-icon">
            <v-icon>mdi-file-pdf-box</v-icon>
          </div>

          <h2 class="document-title">Document Viewer</h2>
          <p class="document-subtitle">{{ currentDocumentName }}</p>

          <div v-if="currentDocumentURL" class="pdf-container">
            <div class="pdf-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
            <div
              class="pdf-wrapper"
              :style="{ transform: `scale(${zoomLevel})` }"
            >
              <iframe
                class="pdf-iframe"
                frameborder="0"
                height="400"
                :src="currentDocumentURL"
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
              @click="showDocumentDialog = false"
            >
              Close
            </button>
            <button
              v-if="currentDocumentURL"
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
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
  } from 'firebase/firestore'
  import { useAuditTrail } from '@/composables/useAuditTrail'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { useNotification } from '@/composables/useNotification'
  import { usePropertyType } from '@/composables/usePropertyType'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'ViewArchivedPropertyPage',
    setup () {
      const appStore = useAppStore()
      const { showConfirmDialog } = useCustomDialogs()
      const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
      const { getLabel } = usePropertyType()
      const { showSuccess, showError } = useNotification()
      return {
        appStore,
        showConfirmDialog,
        logAuditEvent,
        auditActions,
        resourceTypes,
        getLabel,
        showSuccess,
        showError,
      }
    },
    data () {
      return {
        property: {
          id: 1,
          tenantRef: 'T001',
          propertyName: '123 Main Street, Cape Town',
          propertyType: '',
          newOccupation: 'Yes',
          leaseStartDate: '2024-01-15',
          leaseEndDate: '2025-01-15',
          monthsMissed: 2,
          maintenanceAmount: 15_000,
          contractorRequested: 'Yes',
          paidTowardsFund: 5000,
          amountToBePaidOut: 25_000,
          paidOut: 'No',
          quotes: [],
          inspections: [],
          invoices: [],
        },
        loading: true,
        error: null,
        activeTab: 'details',
        showDocumentDialog: false,
        currentDocumentURL: '',
        currentDocumentName: '',
        zoomLevel: 1,
        // Document search queries for each section
        quotesSearchQuery: '',
        inspectionsSearchQuery: '',
        invoicesSearchQuery: '',
        // Document month filters
        selectedQuotesMonth: 'Latest',
        selectedInspectionsMonth: 'Latest',
        selectedInvoicesMonth: 'Latest',
        restoring: false,
      }
    },
    computed: {
      propertyTypeLabel () {
        return this.getLabel(this.property.propertyType) || 'Unknown'
      },
      // Month option lists per doc type (YYYY-MM strings, newest first)
      quoteMonthOptions () {
        return this.buildMonthOptions(this.property?.quotes)
      },
      inspectionMonthOptions () {
        return this.buildMonthOptions(this.property?.inspections)
      },
      invoiceMonthOptions () {
        return this.buildMonthOptions(this.property?.invoices)
      },
      // Filtered docs based on individual search query and month filter, limited to 3 most recent
      filteredQuotes () {
        let filtered = this.filterDocsByMonth(
          this.property?.quotes,
          this.selectedQuotesMonth,
        )

        // Apply search filter
        if (this.quotesSearchQuery) {
          const query = this.quotesSearchQuery.toLowerCase()
          filtered = filtered.filter(doc =>
            String(doc?.fileName || '')
              .toLowerCase()
              .includes(query),
          )
        }

        return this.getMostRecentDocuments(filtered, 3)
      },
      filteredInspections () {
        let filtered = this.filterDocsByMonth(
          this.property?.inspections,
          this.selectedInspectionsMonth,
        )

        // Apply search filter
        if (this.inspectionsSearchQuery) {
          const query = this.inspectionsSearchQuery.toLowerCase()
          filtered = filtered.filter(doc =>
            String(doc?.fileName || '')
              .toLowerCase()
              .includes(query),
          )
        }

        return this.getMostRecentDocuments(filtered, 3)
      },
      filteredInvoices () {
        let filtered = this.filterDocsByMonth(
          this.property?.invoices,
          this.selectedInvoicesMonth,
        )

        // Apply search filter
        if (this.invoicesSearchQuery) {
          const query = this.invoicesSearchQuery.toLowerCase()
          filtered = filtered.filter(doc =>
            String(doc?.fileName || '')
              .toLowerCase()
              .includes(query),
          )
        }

        return this.getMostRecentDocuments(filtered, 3)
      },
      unitId () {
        return this.$route.params.id
      },
    },
    mounted () {
      console.log('ViewArchivedPropertyPage mounted')
      // Set the page title for the app bar
      document.title = 'Archived Property Details - Depsure'

      // Get property ID from route params
      const propertyId = this.$route.params.id
      console.log('Property ID from route:', propertyId)
      if (propertyId) {
        // Load property data based on ID
        console.log('Loading archived property with ID:', propertyId)
        this.loadPropertyData(propertyId)
      } else {
        console.log('No property ID found in route params')
      }
    },
    methods: {
      // Build a descending list of distinct YYYY-MM keys from uploadedAt
      buildMonthOptions (list) {
        if (!Array.isArray(list)) return []
        const keys = new Set()
        for (const doc of list) {
          const key = this.getMonthKey(doc?.uploadedAt)
          if (key) keys.add(key)
        }
        return Array.from(keys).sort().reverse()
      },
      getMonthKey (ts) {
        if (!ts) return null
        try {
          const d = new Date(ts)
          if (isNaN(d)) return null
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          return `${y}-${m}`
        } catch {
          return null
        }
      },
      latestMonthFor (list) {
        const opts = this.buildMonthOptions(list)
        return opts.length > 0 ? opts[0] : null
      },
      filterDocsByMonth (list, sel) {
        if (!Array.isArray(list) || list.length === 0) return []
        // If Latest, find the newest month among items; if none have uploadedAt, return all
        let target = sel
        if (!target || target === 'Latest') {
          const lm = this.latestMonthFor(list)
          if (lm) target = lm
          else return list // no dates available; show all
        }
        return list.filter(d => this.getMonthKey(d?.uploadedAt) === target)
      },
      getMostRecentDocuments (documents, limit = 3) {
        if (!Array.isArray(documents) || documents.length === 0) return []

        // Sort documents by upload date (most recent first)
        const sorted = [...documents].sort((a, b) => {
          const dateA = this.extractDocumentTimestamp(a)
          const dateB = this.extractDocumentTimestamp(b)
          return dateB - dateA // Descending order (newest first)
        })

        // Return only the specified number of most recent documents
        return sorted.slice(0, limit)
      },
      extractDocumentTimestamp (doc) {
        try {
          const raw
            = doc?.uploadedAt
              || doc?.createdAt
              || doc?.date
              || doc?.timestamp
              || null
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
      async loadPropertyData (propertyId) {
        this.loading = true
        this.error = null

        try {
          console.log('Loading archived property data for ID:', propertyId)

          // Fetch property from archivedUnits collection
          const propertyDoc = await getDoc(doc(db, 'archivedUnits', propertyId))

          if (propertyDoc.exists()) {
            const propertyData = propertyDoc.data()
            this.property = {
              id: propertyDoc.id,
              ...propertyData,
            }
            console.log('Archived property loaded successfully:', this.property)
          } else {
            this.error = 'Archived property not found'
            console.log('Archived property not found in Firestore')
          }
        } catch (error) {
          console.error('Error loading archived property:', error)
          this.error = 'Failed to load archived property details'
        } finally {
          this.loading = false
        }
      },

      formatDate (date) {
        if (!date) return 'N/A'
        // Handle both Firestore Timestamp and regular Date objects
        return date.toDate ? new Date(date.toDate()).toLocaleDateString() : new Date(date).toLocaleDateString()
      },

      async restoreUnit () {
        const confirmed = await this.showConfirmDialog({
          title: 'Restore Unit',
          message: `Are you sure you want to restore "${this.property.propertyName}"? This will move it back to active units.`,
          confirmText: 'Restore',
          color: '#28a745',
        })

        if (confirmed) {
          this.restoring = true
          try {
            // Create exact duplicate in units collection
            const restoredUnitData = {
              ...this.property,
              restoredAt: new Date(),
              restoredBy: this.appStore.currentUser?.uid || 'unknown',
              restoredByUserType:
                this.appStore.currentUser?.userType || 'unknown',
              // Ensure the restored unit is unflagged
              isFlagged: false,
            }

            // Remove fields that shouldn't be in active units
            delete restoredUnitData.id
            delete restoredUnitData.originalId
            delete restoredUnitData.archivedAt
            delete restoredUnitData.archivedBy
            delete restoredUnitData.archivedByUserType

            // Add to units collection
            const unitsRef = collection(db, 'units')
            await addDoc(unitsRef, restoredUnitData)

            // Remove from flaggedUnits collection if it exists there
            // This ensures the restored unit is truly unflagged
            try {
              const flaggedQuery = query(
                collection(db, 'flaggedUnits'),
                where(
                  'unitName',
                  '==',
                  this.property.propertyName || this.property.unitName,
                ),
              )
              const flaggedSnapshot = await getDocs(flaggedQuery)
              if (!flaggedSnapshot.empty) {
                const flaggedDoc = flaggedSnapshot.docs[0]
                await deleteDoc(doc(db, 'flaggedUnits', flaggedDoc.id))
                console.log('Removed flagged unit entry for restored unit')
              }
            } catch (error) {
              console.warn('Could not remove flagged unit entry:', error)
            // Don't fail the restore if we can't remove the flagged entry
            }

            // Log audit event
            await this.logAuditEvent(
              this.auditActions.RESTORE,
              {
                propertyName: this.property.propertyName,
                tenantRef: this.property.tenantRef,
                originalId: this.property.originalId,
              },
              this.resourceTypes.PROPERTY,
              this.property.id,
            )

            // Delete from archivedUnits collection
            const archivedUnitRef = doc(db, 'archivedUnits', this.property.id)
            await deleteDoc(archivedUnitRef)

            this.showSuccess('Unit restored successfully')
            this.$router.push('/archived-units')
          } catch (error) {
            console.error('Error restoring unit:', error)
            this.showError('Failed to restore unit')
          } finally {
            this.restoring = false
          }
        }
      },

      viewDocument (fileURL, fileName) {
        this.currentDocumentURL = fileURL
        this.currentDocumentName = fileName
        this.showDocumentDialog = true
      },

      openInNewTab () {
        if (this.currentDocumentURL) {
          window.open(this.currentDocumentURL, '_blank')
        }
      },

      zoomIn () {
        if (this.zoomLevel < 2) {
          this.zoomLevel += 0.1
        }
      },

      zoomOut () {
        if (this.zoomLevel > 0.5) {
          this.zoomLevel -= 0.1
        }
      },
    },
  }
</script>

<style scoped>
.view-property-page {
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

/* Title section styling to match add-agency */
.title-section {
  background: black;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
}

/* Form card styling */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #000000;
}

/* Input field styling */
.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Tabs styling */
.property-tabs {
  background-color: #f8f9fa;
}

.property-tabs :deep(.tab-label) {
  font-weight: 500;
  text-transform: none;
  transition: color 0.2s ease;
}

.property-tabs :deep(.tab-label.v-tab--selected) {
  font-weight: 600;
  background-color: white;
}

.property-tabs :deep(.v-tabs-slider) {
  background-color: #000000 !important;
}

.property-tabs :deep(.tab--details) {
  color: #1e88e5;
}

.property-tabs :deep(.tab--details.v-tab--selected) {
  color: #0d47a1;
}

.property-tabs :deep(.tab--documents) {
  color: #fb8c00;
}

.property-tabs :deep(.tab--documents.v-tab--selected) {
  color: #ef6c00;
}

.property-tabs :deep(.tab--notes) {
  color: #43a047;
}

.property-tabs :deep(.tab--notes.v-tab--selected) {
  color: #1b5e20;
}

.property-tabs :deep(.tab--archive) {
  color: #8e24aa;
}

.property-tabs :deep(.tab--archive.v-tab--selected) {
  color: #5e35b1;
}

/* Restore button styling */
.restore-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid #28a745 !important;
  color: #28a745 !important;
  background-color: transparent !important;
}

.restore-btn:hover {
  background-color: #28a745 !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

/* Documents section */
.documents-section {
  padding: 20px 0;
}

.doc-filter-row {
  margin: 8px 0 12px 0;
}

.doc-month-select :deep(.v-field__input) {
  padding-top: 4px;
  padding-bottom: 4px;
}

.documents-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.document-category {
  margin-bottom: 32px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.document-category:nth-child(3) {
  border-left-color: #ffc107;
}

.document-category:nth-child(4) {
  border-left-color: #28a745;
}

.category-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
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
  padding: 16px;
  color: #666;
  font-style: italic;
  background-color: white;
  border-radius: 6px;
  border: 1px dashed #ccc;
}

/* Document Dialog - NotificationDialog Style */
.document-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.document-dialog {
  position: relative;
  width: 600px;
  max-width: 90vw;
  min-height: 500px;
}

.document-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  background-color: #000000;
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
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  color: #666;
}

.document-close:hover {
  color: #333;
}

.document-icon {
  position: relative;
  margin: 0 auto 24px auto;
  margin-top: -16%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCircle 0.3s ease-out forwards;
  background-color: #000000;
}

.document-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.document-icon::before {
  content: "";
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
  background-color: #000000;
}

@keyframes fadeInCircle {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.document-title {
  font-size: 2em;
  margin: 0 0 8px 0;
  color: #333;
}

.document-subtitle {
  font-size: 1.1em;
  margin: 0 0 24px 0;
  color: #666;
  word-break: break-all;
}

.pdf-container {
  width: 100%;
  margin: 0 0 24px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.zoom-btn {
  background-color: #000000;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.zoom-btn:hover {
  background-color: #333;
}

.zoom-level {
  font-weight: 600;
  color: #333;
  min-width: 50px;
  text-align: center;
}

.pdf-wrapper {
  transform-origin: top center;
  transition: transform 0.3s ease;
  overflow: auto;
  max-height: 400px;
}

.pdf-iframe {
  border: none;
  width: 100%;
  height: 400px;
  display: block;
}

.no-pdf-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
  margin: 0 0 24px 0;
}

.no-pdf-message p {
  margin-top: 16px;
  font-size: 1.1rem;
}

.document-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.document-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.document-button.secondary {
  background-color: #666;
}

.document-button.primary {
  background-color: #000000;
}

.document-button:hover {
  opacity: 0.9;
}

/* Search and month filter styling */
.doc-search {
  margin: 14px 0 24px 0;
}
.search-input,
.month-input {
  width: 100%;
}
.search-input .v-field,
.month-input .v-field {
  border-radius: 8px;
  transition: all 0.3s ease;
}
.search-input .v-field:focus-within,
.month-input .v-field:focus-within {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-property-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .back-btn {
    width: 140px;
    height: 40px;
  }
}
</style>
