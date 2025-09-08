<template>
  <div class="view-property-page">
    <v-container fluid>
      
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/active-units')"
            class="back-btn"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

             <!-- Title Section -->
       <v-row justify="center">
         <v-col cols="12" lg="10" xl="8">
           <div class="title-section">
             <h1 class="page-title">Property Details</h1>
           </div>
           
           <!-- Property Information Card -->
           <v-card v-if="loading" class="form-card" elevation="0">
             <v-card-text class="text-center">
               <v-progress-circular indeterminate color="primary" />
               <p class="mt-4">Loading property details...</p>
             </v-card-text>
           </v-card>

           <v-card v-else-if="error" class="form-card" elevation="0">
             <v-card-text class="text-center">
               <v-icon icon="mdi-alert" color="error" size="large" />
               <p class="mt-4 text-error">{{ error }}</p>
             </v-card-text>
           </v-card>

           <div v-else class="form-card" elevation="0">
            <!-- Tabs -->
            <v-tabs v-model="activeTab" class="property-tabs" color="primary">
              <v-tab value="details">Property Details</v-tab>
              <v-tab value="documents">Documents</v-tab>
            </v-tabs>

            <!-- Property Details Tab -->
            <v-window v-model="activeTab">
              <v-window-item value="details">
                <v-card-text>
                  <v-row>
                <!-- Tenant Reference -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.tenantRef"
                    label="Tenant Reference"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Property Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.propertyName"
                    label="Property Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Flag status -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="(property.isFlagged === true || property.isFlagged === 'Yes') ? 'Flagged' : 'Not Flagged'"
                    label="Flag Status"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Property Type -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="propertyTypeLabel"
                    label="Property Type"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- New Occupation -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.newOccupation"
                    label="New Occupation Yes/No"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Lease Starting Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.leaseStartDate"
                    label="Lease Starting Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Lease End Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.leaseEndDate"
                    label="Lease End Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Months Missed Rent Payment -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.monthsMissed"
                    label="Months Missed Rent Payment"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Maintenance Amount -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`R${property.maintenanceAmount.toLocaleString()}`"
                    label="Maintenance Amount"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contractor Requested -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.contractorRequested"
                    label="Contractor Requested"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Paid Towards Fund -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`R${property.paidTowardsFund.toLocaleString()}`"
                    label="Paid Towards Fund"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Amount to be Paid Out -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`R${property.amountToBePaidOut.toLocaleString()}`"
                    label="Amount to be Paid Out (Inc Interest)"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Paid Out -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property.paidOut"
                    label="Paid Out Yes/No"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>
              </v-row>
                </v-card-text>
              </v-window-item>

              <!-- Documents Tab -->
              <v-window-item value="documents">
                <v-card-text>
                  <div class="documents-section">
                    <h3 class="documents-title">Property Documents</h3>
                    <!-- Shared filters: search and month -->
                    <div class="doc-filters">
                      <v-text-field
                        v-model="docFilterSearch"
                        label="Search documents..."
                        prepend-inner-icon="mdi-magnify"
                        density="comfortable"
                        variant="outlined"
                        clearable
                        hide-details
                        class="custom-input doc-search"
                      />
                      <v-text-field
                        v-model="docFilterMonth"
                        type="month"
                        label="Month"
                        density="comfortable"
                        variant="outlined"
                        hide-details
                        clearable
                        class="custom-input doc-month-input"
                      />
                    </div>
                    
                    <!-- Quotes Section -->
                    <div class="document-category category-quotes">
                      <div class="category-header">
                        <h4 class="category-title">
                          <v-icon color="primary" class="mr-2">mdi-file-pdf-box</v-icon>
                          Quotes
                        </h4>
                      </div>
                      <div v-if="filteredQuotes.length > 0" class="document-list">
                        <div v-for="(quote, index) in filteredQuotes" :key="index" class="document-item">
                          <v-icon color="primary" class="mr-2">mdi-file-pdf-box</v-icon>
                          <span class="document-name">{{ quote.fileName }}</span>
                          <v-btn
                            size="small"
                            color="primary"
                            variant="outlined"
                            @click="viewDocument(quote.fileURL, quote.fileName)"
                            class="view-btn"
                          >
                            View
                          </v-btn>
                        </div>
                      </div>
                      <div v-else class="no-documents">
                        <v-icon color="grey" class="mr-2">mdi-file-pdf-box</v-icon>
                        No quotes uploaded for selected month
                      </div>
                    </div>

                    <!-- Inspections Section -->
                    <div class="document-category category-inspections">
                      <div class="category-header">
                        <h4 class="category-title">
                          <v-icon color="warning" class="mr-2">mdi-clipboard-check</v-icon>
                          Inspections
                        </h4>
                      </div>
                      <div v-if="filteredInspections.length > 0" class="document-list">
                        <div v-for="(inspection, index) in filteredInspections" :key="index" class="document-item">
                          <v-icon color="warning" class="mr-2">mdi-clipboard-check</v-icon>
                          <span class="document-name">{{ inspection.fileName }}</span>
                          <v-btn
                            size="small"
                            color="warning"
                            variant="outlined"
                            @click="viewDocument(inspection.fileURL, inspection.fileName)"
                            class="view-btn"
                          >
                            View
                          </v-btn>
                        </div>
                      </div>
                      <div v-else class="no-documents">
                        <v-icon color="grey" class="mr-2">mdi-clipboard-check</v-icon>
                        No inspections uploaded for selected month
                      </div>
                    </div>

                    <!-- Invoices Section -->
                    <div class="document-category category-invoices">
                      <div class="category-header">
                        <h4 class="category-title">
                          <v-icon color="success" class="mr-2">mdi-receipt</v-icon>
                          Invoices
                        </h4>
                      </div>
                      <div v-if="filteredInvoices.length > 0" class="document-list">
                        <div v-for="(invoice, index) in filteredInvoices" :key="index" class="document-item">
                          <v-icon color="success" class="mr-2">mdi-receipt</v-icon>
                          <span class="document-name">{{ invoice.fileName }}</span>
                          <v-btn
                            size="small"
                            color="success"
                            variant="outlined"
                            @click="viewDocument(invoice.fileURL, invoice.fileName)"
                            class="view-btn"
                          >
                            View
                          </v-btn>
                        </div>
                      </div>
                      <div v-else class="no-documents">
                        <v-icon color="grey" class="mr-2">mdi-receipt</v-icon>
                        No invoices uploaded for selected month
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
    <div v-if="showDocumentDialog" class="document-overlay" @click.self="showDocumentDialog = false">
      <div class="document-dialog">
        <!-- colored card behind -->
        <div class="document-dialog-bg"></div>
        <!-- main white card -->
        <div class="document-dialog-inner">
          <button class="document-close" @click="showDocumentDialog = false">&times;</button>

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
            <div class="pdf-wrapper" :style="{ transform: `scale(${zoomLevel})` }">
              <iframe
                :src="currentDocumentURL"
                width="100%"
                height="400"
                frameborder="0"
                class="pdf-iframe"
              />
            </div>
          </div>
          <div v-else class="no-pdf-message">
            <v-icon color="error" size="48">mdi-file-pdf-box</v-icon>
            <p>PDF file not available</p>
          </div>

          <div class="document-actions">
            <button class="document-button secondary" @click="showDocumentDialog = false">
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
import { db } from '@/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: 'ViewPropertyPage',
  setup() {
    const { getLabel } = usePropertyType()
    return { getLabel }
  },
  data() {
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
        maintenanceAmount: 15000,
        contractorRequested: 'Yes',
        paidTowardsFund: 5000,
        amountToBePaidOut: 25000,
        paidOut: 'No',
        quotes: [],
        inspections: [],
        invoices: []
      },
      loading: true,
      error: null,
      activeTab: 'details',
      showDocumentDialog: false,
      currentDocumentURL: '',
      currentDocumentName: '',
      zoomLevel: 1,
      // Shared docs filters
      docFilterMonth: '',
      docFilterSearch: ''
    }
  },
  computed: {
    propertyTypeLabel() {
      return this.getLabel(this.property.propertyType) || 'Unknown'
    },
    filteredQuotes() {
      return this.filterDocs(this.property?.quotes || [])
    },
    filteredInspections() {
      return this.filterDocs(this.property?.inspections || [])
    },
    filteredInvoices() {
      return this.filterDocs(this.property?.invoices || [])
    }
  },
  mounted() {
    console.log('ViewPropertyPage mounted');
    // Set the page title for the app bar
    document.title = 'Property Details - Depsure';
    
    // Get property ID from route params
    const propertyId = this.$route.params.id;
    console.log('Property ID from route:', propertyId);
    if (propertyId) {
      // Load property data based on ID
      console.log('Loading property with ID:', propertyId);
      // In a real app, you would fetch the property data here
      this.loadPropertyData(propertyId);
    } else {
      console.log('No property ID found in route params');
    }
  },
  methods: {
    // Return a Date from a document entry
    resolveDocDate(entry) {
      if (!entry) return null;
      const v = entry.uploadedAt || entry.createdAt || entry.date || entry.timestamp || null;
      if (!v) return null;
      try {
        if (typeof v.toDate === 'function') return v.toDate();
        if (typeof v === 'number') return new Date(v);
        return new Date(v);
      } catch {
        return null;
      }
    },
    monthKey(d) {
      if (!d || isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    },
    latestMonthFrom(docs) {
      const keys = docs
        .map(e => this.resolveDocDate(e))
        .filter(Boolean)
        .map(d => this.monthKey(d));
      if (!keys.length) return '';
      return keys.sort().pop();
    },
    filterDocs(docs) {
      if (!Array.isArray(docs) || docs.length === 0) return [];
      const month = this.docFilterMonth || this.latestMonthFrom(docs);
      const term = (this.docFilterSearch || '').toLowerCase();
      return docs.filter(e => {
        const d = this.monthKey(this.resolveDocDate(e));
        const monthMatch = month ? d === month : true;
        const name = (e.fileName || e.name || '').toLowerCase();
        const searchMatch = term ? name.includes(term) : true;
        return monthMatch && searchMatch;
      });
    },
    async loadPropertyData(propertyId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Loading property data for ID:', propertyId);
        
        // Fetch property from Firestore
        const propertyDoc = await getDoc(doc(db, 'units', propertyId));
        
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          this.property = {
            id: propertyDoc.id,
            ...propertyData
          };
          console.log('Property loaded successfully:', this.property);
        } else {
          this.error = 'Property not found';
          console.log('Property not found in Firestore');
        }
      } catch (error) {
        console.error('Error loading property:', error);
        this.error = 'Failed to load property details';
      } finally {
        this.loading = false;
      }
    },
    
    viewDocument(fileURL, fileName) {
      this.currentDocumentURL = fileURL;
      this.currentDocumentName = fileName;
      this.showDocumentDialog = true;
    },
    
    openInNewTab() {
      if (this.currentDocumentURL) {
        window.open(this.currentDocumentURL, '_blank');
      }
    },
    
    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel += 0.1;
      }
    },
    
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel -= 0.1;
      }
    }
  }
};
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
  text-align: left;
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

.custom-input :deep(.v-field__input) {
  background-color: #f8f9fa !important;
  color: #000000 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Color cue for tabs (active vs inactive) */
:deep(.property-tabs .v-tab) {
  color: #6b7280; /* neutral for inactive */
}
:deep(.property-tabs .v-tab.v-tab--selected) {
  color: #000000 !important; /* brand primary */
  font-weight: 600;
}
:deep(.property-tabs .v-tabs-slider) {
  background-color: #000000 !important; /* brand primary */
}

/* Tabs styling */
.property-tabs {
  background-color: #f8f9fa;
}

.property-tabs :deep(.v-tab) {
  font-weight: 500;
  text-transform: none;
  color: #666;
}

.property-tabs :deep(.v-tab--selected) {
  color: #000;
  background-color: white;
}

/* Documents section */
.documents-section {
  padding: 20px 0;
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
  border-left: 4px solid #e5e7eb; /* neutral by default */
}

/* Explicit per-category colors (match icon palettes) */
.document-category.category-quotes { border-left-color: var(--v-theme-primary); }
.document-category.category-inspections { border-left-color: var(--v-theme-warning); }
.document-category.category-invoices { border-left-color: var(--v-theme-success); }

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
  content: '';
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
  0%, 100% {
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

/* Compact month filter next to category title */
.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* Shared docs toolbar */
.doc-filters {
  display: flex;
  gap: 12px;
  margin: 8px 0 16px 0;
  align-items: center;
  justify-content: center;
}
.doc-search,
.doc-month-input {
  width: 220px;
  max-width: 220px;
}
.doc-month-input :deep(input) { min-width: 120px; }

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
