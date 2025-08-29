<template>
  <div class="edit-property-page">
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
            <h1 class="page-title">Edit Property</h1>
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
            <v-tabs v-model="activeTab" class="property-tabs">
              <v-tab value="details">Property Details</v-tab>
              <v-tab value="documents">Documents</v-tab>
            </v-tabs>

            <v-form ref="form" v-model="valid" lazy-validation>
              <!-- Property Details Tab -->
              <v-window v-model="activeTab">
                <v-window-item value="details">
                  <v-card-text>
                    <v-row>
                      <!-- Tenant Reference -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="property.tenantRef"
                          label="Tenant Reference"
                          variant="outlined"
                          class="custom-input"
                          :rules="tenantRefRules"
                          required
                        />
                      </v-col>

                      <!-- Property Name -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="property.propertyName"
                          label="Property Name"
                          variant="outlined"
                          class="custom-input"
                          :rules="propertyNameRules"
                          required
                        />
                      </v-col>

                      <!-- Property Type -->
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="property.propertyType"
                          label="Property Type"
                          variant="outlined"
                          class="custom-input"
                          :items="propertyTypeOptions"
                          item-title="title"
                          item-value="value"
                          :rules="propertyTypeRules"
                          required
                        />
                      </v-col>

                      <!-- New Occupation -->
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="property.newOccupation"
                          label="New Occupation Yes/No"
                          variant="outlined"
                          class="custom-input"
                          :items="['Yes', 'No']"
                          :rules="newOccupationRules"
                          required
                        />
                      </v-col>

                      <!-- Lease Starting Date -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="property.leaseStartDate"
                          label="Lease Starting Date"
                          variant="outlined"
                          type="date"
                          class="custom-input"
                          :rules="leaseStartDateRules"
                          required
                        />
                      </v-col>

                      <!-- Lease End Date -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="property.leaseEndDate"
                          label="Lease End Date"
                          variant="outlined"
                          type="date"
                          class="custom-input"
                          :rules="leaseEndDateRules"
                          required
                        />
                      </v-col>

                      <!-- Months Missed Rent Payment -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="property.monthsMissed"
                          label="Months Missed Rent Payment"
                          variant="outlined"
                          type="number"
                          class="custom-input"
                          :rules="monthsMissedRules"
                          required
                        />
                      </v-col>

                      <!-- Maintenance Amount -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="property.maintenanceAmount"
                          label="Maintenance Amount"
                          variant="outlined"
                          type="number"
                          class="custom-input"
                          :rules="maintenanceAmountRules"
                          required
                        />
                      </v-col>

                      <!-- Contractor Requested -->
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="property.contractorRequested"
                          label="Contractor Requested"
                          variant="outlined"
                          class="custom-input"
                          :items="['Yes', 'No']"
                          :rules="contractorRequestedRules"
                          required
                        />
                      </v-col>

                      <!-- Paid Towards Fund -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="property.paidTowardsFund"
                          label="Paid Towards Fund"
                          variant="outlined"
                          type="number"
                          class="custom-input"
                          :rules="paidTowardsFundRules"
                          required
                        />
                      </v-col>

                      <!-- Amount to be Paid Out -->
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="property.amountToBePaidOut"
                          label="Amount to be Paid Out (Inc Interest)"
                          variant="outlined"
                          type="number"
                          class="custom-input"
                          :rules="amountToBePaidOutRules"
                          required
                        />
                      </v-col>

                      <!-- Paid Out -->
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="property.paidOut"
                          label="Paid Out Yes/No"
                          variant="outlined"
                          class="custom-input"
                          :items="['Yes', 'No']"
                          :rules="paidOutRules"
                          required
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-window-item>

                <!-- Documents Tab -->
                <v-window-item value="documents">
                  <v-card-text>
                    <div class="documents-section">
                      <h3 class="documents-title">Upload Property Documents</h3>
                      
                      <!-- Quotes Upload Section -->
                      <div class="document-category">
                        <h4 class="category-title">
                          <v-icon color="primary" class="mr-2">mdi-file-pdf-box</v-icon>
                          Quotes
                        </h4>
                        <v-file-input
                          v-model="newQuotes"
                          label="Upload Quote Documents (PDF only)"
                          variant="outlined"
                          class="custom-input"
                          accept=".pdf"
                          multiple
                          show-size
                          prepend-icon="mdi-file-pdf-box"
                          :loading="uploadingQuotes"
                          :rules="quoteFileRules"
                          hint="Only PDF files are allowed. Maximum size: 50MB per file"
                          persistent-hint
                        />
                        <div v-if="property.quotes && property.quotes.length > 0" class="existing-documents">
                          <h5 class="existing-title">Existing Quotes:</h5>
                          <div class="document-list">
                            <div v-for="(quote, index) in property.quotes" :key="`q-${index}`" class="document-item">
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
                              <v-btn
                                size="small"
                                color="error"
                                variant="outlined"
                                @click="removeDocument('quotes', index)"
                                class="remove-btn"
                              >
                                Delete
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Inspections Upload Section -->
                      <div class="document-category">
                        <h4 class="category-title">
                          <v-icon color="warning" class="mr-2">mdi-clipboard-check</v-icon>
                          Inspections
                        </h4>
                        <v-file-input
                          v-model="newInspections"
                          label="Upload Inspection Documents (PDF only)"
                          variant="outlined"
                          class="custom-input"
                          accept=".pdf"
                          multiple
                          show-size
                          prepend-icon="mdi-clipboard-check"
                          :loading="uploadingInspections"
                          :rules="inspectionFileRules"
                          hint="Only PDF files are allowed. Maximum size: 50MB per file"
                          persistent-hint
                        />
                        <div v-if="property.inspections && property.inspections.length > 0" class="existing-documents">
                          <h5 class="existing-title">Existing Inspections:</h5>
                          <div class="document-list">
                            <div v-for="(inspection, index) in property.inspections" :key="`i-${index}`" class="document-item">
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
                              <v-btn
                                size="small"
                                color="error"
                                variant="outlined"
                                @click="removeDocument('inspections', index)"
                                class="remove-btn"
                              >
                                Delete
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Invoices Upload Section -->
                      <div class="document-category">
                        <h4 class="category-title">
                          <v-icon color="success" class="mr-2">mdi-receipt</v-icon>
                          Invoices
                        </h4>
                        <v-file-input
                          v-model="newInvoices"
                          label="Upload Invoice Documents (PDF only)"
                          variant="outlined"
                          class="custom-input"
                          accept=".pdf"
                          multiple
                          show-size
                          prepend-icon="mdi-receipt"
                          :loading="uploadingInvoices"
                          :rules="invoiceFileRules"
                          hint="Only PDF files are allowed. Maximum size: 50MB per file"
                          persistent-hint
                        />
                        <div v-if="property.invoices && property.invoices.length > 0" class="existing-documents">
                          <h5 class="existing-title">Existing Invoices:</h5>
                          <div class="document-list">
                            <div v-for="(invoice, index) in property.invoices" :key="`inv-${index}`" class="document-item">
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
                              <v-btn
                                size="small"
                                color="error"
                                variant="outlined"
                                @click="removeDocument('invoices', index)"
                                class="remove-btn"
                              >
                                Delete
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-window-item>
              </v-window>

              <!-- Action Buttons -->
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="$router.push('/active-units')"
                  class="cancel-btn"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="black"
                  variant="elevated"
                  @click="saveProperty"
                  :disabled="!valid || loading"
                  :loading="loading"
                  class="save-btn"
                >
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </v-btn>
              </v-card-actions>
            </v-form>
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
                width="100%
"
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db, storage } from '@/firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

const COLLECTION = 'units' // <-- fix: use the same collection everywhere

export default {
  name: 'EditPropertyPage',
  setup() {
    const { showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getOptions } = usePropertyType()
    return { showSuccessDialog, showErrorDialog, logAuditEvent, auditActions, resourceTypes, getOptions }
  },
  data() {
    return {
      property: {
        id: '',
        tenantRef: '',
        propertyName: '',
        propertyType: '',
        newOccupation: '',
        leaseStartDate: '',
        leaseEndDate: '',
        monthsMissed: 0,
        maintenanceAmount: 0,
        contractorRequested: '',
        paidTowardsFund: 0,
        amountToBePaidOut: 0,
        paidOut: '',
        quotes: [],
        inspections: [],
        invoices: []
      },
      loading: true,
      error: null,
      valid: true,
      activeTab: 'details',
      showDocumentDialog: false,
      currentDocumentURL: '',
      currentDocumentName: '',
      zoomLevel: 1,
      newQuotes: [],
      newInspections: [],
      newInvoices: [],
      uploadingQuotes: false,
      uploadingInspections: false,
      uploadingInvoices: false,
      // Validation rules
      tenantRefRules: [
        v => !!v || 'Tenant Reference is required',
        v => v.length >= 2 || 'Tenant Reference must be at least 2 characters'
      ],
      propertyNameRules: [
        v => !!v || 'Property Name is required',
        v => v.length >= 5 || 'Property Name must be at least 5 characters'
      ],
      newOccupationRules: [
        v => !!v || 'New Occupation is required'
      ],
      leaseStartDateRules: [
        v => !!v || 'Lease Start Date is required'
      ],
      leaseEndDateRules: [
        v => !!v || 'Lease End Date is required'
      ],
      monthsMissedRules: [
        v => v >= 0 || 'Months Missed cannot be negative',
        v => v <= 12 || 'Months Missed cannot exceed 12'
      ],
      maintenanceAmountRules: [
        v => v >= 0 || 'Maintenance Amount cannot be negative'
      ],
      contractorRequestedRules: [
        v => !!v || 'Contractor Requested is required'
      ],
      paidTowardsFundRules: [
        v => v >= 0 || 'Paid Towards Fund cannot be negative'
      ],
      amountToBePaidOutRules: [
        v => v >= 0 || 'Amount to be Paid Out cannot be negative'
      ],
      paidOutRules: [
        v => !!v || 'Paid Out is required'
      ],
      propertyTypeRules: [
        v => !!v || 'Property Type is required'
      ],
      quoteFileRules: [
        v => !v || v.length === 0 || v.every(file => file.size <= 50 * 1024 * 1024) || "Each file must be less than 50MB",
        v => !v || v.length === 0 || v.every(file => file.type === 'application/pdf') || "Only PDF files are allowed"
      ],
      inspectionFileRules: [
        v => !v || v.length === 0 || v.every(file => file.size <= 50 * 1024 * 1024) || "Each file must be less than 50MB",
        v => !v || v.length === 0 || v.every(file => file.type === 'application/pdf') || "Only PDF files are allowed"
      ],
      invoiceFileRules: [
        v => !v || v.length === 0 || v.every(file => file.size <= 50 * 1024 * 1024) || "Each file must be less than 50MB",
        v => !v || v.length === 0 || v.every(file => file.type === 'application/pdf') || "Only PDF files are allowed"
      ]
    }
  },
  computed: {
    propertyTypeOptions() {
      return this.getOptions();
    }
  },
  async mounted() {
    console.log('EditPropertyPage mounted');
    document.title = 'Edit Property - Depsure';
    const propertyId = this.$route.params.id;
    console.log('Property ID from route:', propertyId);
    if (propertyId) {
      await this.loadPropertyData(propertyId);
    } else {
      console.log('No property ID found in route params');
      this.error = 'No property ID provided';
      this.loading = false;
    }
  },
  methods: {
    async loadPropertyData(propertyId) {
      this.loading = true;
      this.error = null;
      try {
        console.log('Loading property data for ID:', propertyId);
        const propertyDoc = await getDoc(doc(db, COLLECTION, propertyId));
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          this.property = {
            id: propertyDoc.id,
            quotes: [],
            inspections: [],
            invoices: [],
            ...propertyData
          };
          console.log('Property loaded successfully:', this.property);

          // Defaults
          this.property.tenantRef = this.property.tenantRef || '';
          this.property.propertyName = this.property.propertyName || '';
          this.property.propertyType = this.property.propertyType || '';
          this.property.newOccupation = this.property.newOccupation || '';
          this.property.leaseStartDate = this.property.leaseStartDate || '';
          this.property.leaseEndDate = this.property.leaseEndDate || '';
          this.property.monthsMissed = this.property.monthsMissed || 0;
          this.property.maintenanceAmount = this.property.maintenanceAmount || 0;
          this.property.contractorRequested = this.property.contractorRequested || '';
          this.property.paidTowardsFund = this.property.paidTowardsFund || 0;
          this.property.amountToBePaidOut = this.property.amountToBePaidOut || 0;
          this.property.paidOut = this.property.paidOut || '';

          // Normalize existing doc arrays to objects with storagePath if missing (best-effort)
          ['quotes','inspections','invoices'].forEach(type => {
            this.property[type] = (this.property[type] || []).map(item => {
              if (!item) return null;
              const normalized = { ...item };
              if (!normalized.storagePath && normalized.fileURL) {
                normalized.storagePath = this.safeParseStoragePathFromUrl(normalized.fileURL, this.property.id, type, normalized.fileName);
              }
              return normalized;
            }).filter(Boolean);
          });

          console.log('Property data after defaults/normalization:', this.property);
        } else {
          this.error = 'Property not found';
          console.log('Property not found in Firestore');
        }
      } catch (error) {
        console.error('Error loading property:', error);
        this.error = `Failed to load property details: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },

    // Robust URL → storage path decoder for older docs
    safeParseStoragePathFromUrl(fileURL, propertyId, type, fileName) {
      try {
        if (!fileURL) return '';
        const u = new URL(fileURL);
        // Typical: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<ENCODED_PATH>?alt=media&token=...
        const parts = u.pathname.split('/');
        const oIndex = parts.indexOf('o');
        if (oIndex !== -1 && parts[oIndex + 1]) {
          const encoded = parts[oIndex + 1];
          // strip query bits if present (rare in pathname)
          const pure = encoded.split('?')[0];
          const decoded = decodeURIComponent(pure);
          if (decoded && decoded.includes('/')) {
            return decoded; // full path like property-documents/<id>/<type>/<ts>_<name>.pdf
          }
        }
        // Fallback: last segment filename (lossy if you used a ts prefix in storage)
        const last = u.pathname.split('/').pop() || '';
        const clean = last.split('?')[0];
        if (clean && clean !== '') {
          return `property-documents/${propertyId}/${type}/${clean}`;
        }
      } catch (e) {
        console.warn('safeParseStoragePathFromUrl failed, using fallback', e);
      }
      // ultimate fallback (very lossy)
      return `property-documents/${propertyId}/${type}/${fileName || 'unknown.pdf'}`;
    },

    async saveProperty() {
      console.log('Save property called, form valid:', this.valid);
      console.log('Form ref exists:', !!this.$refs.form);
      if (this.$refs.form && this.$refs.form.validate()) {
        this.loading = true;
        try {
          console.log('Saving property:', this.property);
          if (!this.property.id) throw new Error('Property ID is missing');

          // Gather uploads per type
          const uploaded = await this.uploadDocuments();
          if (uploaded === false) return;

          // Build payload without id
          const { id, ...propertyDataBase } = this.property;
          const updatedAt = new Date();

          // Merge arrays: existing + newly uploaded, preserving older entries
          const merged = {
            quotes: [
              ...(this.property.quotes || []),
              ...(uploaded.quotes || [])
            ],
            inspections: [
              ...(this.property.inspections || []),
              ...(uploaded.inspections || [])
            ],
            invoices: [
              ...(this.property.invoices || []),
              ...(uploaded.invoices || [])
            ]
          };

          const propertyData = {
            ...propertyDataBase,
            quotes: merged.quotes,
            inspections: merged.inspections,
            invoices: merged.invoices,
            updatedAt
          };

          // Log update
          await this.logAuditEvent(
            this.auditActions.UPDATE,
            {
              unitId: id,
              unitName: propertyData.propertyName,
              tenantRef: propertyData.tenantRef,
              updatedFields: Object.keys(propertyData),
              updatedData: propertyData
            },
            this.resourceTypes.UNIT,
            id
          );

          // Update Firestore (CORRECT COLLECTION)
          await updateDoc(doc(db, COLLECTION, id), propertyData);

          console.log('Property updated successfully');
          this.showSuccessDialog('Property saved successfully!', 'Success!', 'Continue', `/view-property-${id}`);
        } catch (error) {
          console.error('Error saving property:', error);
          this.showErrorDialog(`Failed to save property: ${error.message}`, 'Error', 'OK');
        } finally {
          this.loading = false;
        }
      } else {
        console.log('Form validation failed');
        this.showErrorDialog('Please fix the form errors before saving.', 'Validation Error', 'OK');
      }
    },
    
    async uploadDocuments() {
      const result = { quotes: [], inspections: [], invoices: [] };

      // helper to upload a batch and push normalized entries
      const uploadBatch = async (files, type, loadingKey) => {
        if (!files || files.length === 0) return;
        this[loadingKey] = true;
        try {
          for (const file of files) {
            const ts = Date.now();
            const fileRef = ref(storage, `property-documents/${this.property.id}/${type}/${ts}_${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            const storagePath = snapshot.ref.fullPath; // <- authoritative path
            result[type].push({
              fileName: file.name,
              fileURL: downloadURL,
              storagePath,           // <- store this!
              uploadedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error(`Error uploading ${type}:`, error);
          this.showErrorDialog(`Failed to upload ${type} documents.`, 'Upload Error', 'OK');
          return false;
        } finally {
          this[loadingKey] = false;
        }
      };

      if (await uploadBatch(this.newQuotes, 'quotes', 'uploadingQuotes') === false) return false;
      if (await uploadBatch(this.newInspections, 'inspections', 'uploadingInspections') === false) return false;
      if (await uploadBatch(this.newInvoices, 'invoices', 'uploadingInvoices') === false) return false;

      // clear the pickers after success
      this.newQuotes = [];
      this.newInspections = [];
      this.newInvoices = [];

      return result;
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
    },
    
    async removeDocument(type, index) {
      if (!this.property || !this.property.id) {
        console.error('Property not loaded or invalid property ID');
        return;
      }
      if (!this.property[type] || !this.property[type][index]) {
        console.error('Document not found in property data');
        return;
      }

      const document = this.property[type][index];
      const documentName = document.fileName;

      // Show confirmation dialog
      const confirmed = await this.showConfirmDialog(
        `Are you sure you want to delete "${documentName}"?`,
        'Delete Document',
        'This action cannot be undone.'
      );
      if (!confirmed) return;

      // Compute storagePath reliably
      let storagePath = document.storagePath;
      if (!storagePath && document.fileURL) {
        storagePath = this.safeParseStoragePathFromUrl(document.fileURL, this.property.id, type, document.fileName);
      }

      try {
        // Attempt Storage delete first (ok if it 404s)
        if (storagePath) {
          try {
            console.log('Deleting from storage using storagePath:', storagePath);
            const fileRef = ref(storage, storagePath);
            await deleteObject(fileRef);
            console.log('File deleted from storage:', storagePath);
          } catch (deleteError) {
            console.log('Storage delete failed or object missing, continuing:', deleteError?.code || deleteError?.message || deleteError);
          }
        } else {
          console.log('No storagePath available for this document; skipping storage delete.');
        }

        // Always update Firestore (CORRECT COLLECTION)
        try {
          const docRef = doc(db, COLLECTION, this.property.id);
          const currentArray = this.property[type] || [];
          const updatedArray = currentArray.filter((_, i) => i !== index);
          const updateData = {};
          updateData[type] = updatedArray;
          await updateDoc(docRef, updateData);
          console.log('Firestore document updated successfully - array item removed');

          // Update local state
          this.property[type] = updatedArray;
          this.$nextTick(() => this.$forceUpdate());
        } catch (firestoreError) {
          console.error('Failed to update Firestore document:', firestoreError);
          // Still update local array (UI consistency)
          const currentArray = this.property[type] || [];
          this.property[type] = currentArray.filter((_, i) => i !== index);
          this.$nextTick(() => this.$forceUpdate());
        }

        // Log the delete action
        await this.logAuditEvent(
          this.auditActions.DELETE,
          {
            propertyId: this.property.id,
            documentType: type,
            documentName: documentName,
            documentURL: document.fileURL,
            storagePath: storagePath || null
          },
          this.resourceTypes.DOCUMENT,
          `${this.property.id}_${type}_${index}`
        );

        this.showSuccessDialog(
          `Document "${documentName}" has been deleted successfully.`,
          'Document Deleted',
          'OK'
        );
      } catch (error) {
        console.error('Error deleting document:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        // No error dialog - just log
      }
    },

    async showConfirmDialog(message, title, subtitle = '') {
      return new Promise((resolve) => {
        // Create a custom confirmation dialog with exact NotificationDialog styling
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.style.cssText = `
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
        `;
        
        dialog.innerHTML = `
          <div style="
            position: relative;
            width: 500px;
            max-width: 90vw;
            min-height: 200px;
          ">
            <!-- colored card behind -->
            <div style="
              position: absolute;
              top: 12px;
              left: 12px;
              width: 96%;
              height: 100%;
              border-radius: 16px;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
              background-color: #e53e3e;
            "></div>
            <!-- main white card -->
            <div style="
              position: relative;
              background: #ffffff;
              border-radius: 16px;
              padding: 32px;
              text-align: center;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
            ">
              <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = false;" style="
                position: absolute;
                top: 16px;
                right: 16px;
                background: transparent;
                border: none;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
                color: #666;
              ">&times;</button>

              <div style="
                position: relative;
                margin: 0 auto 24px auto;
                margin-top: -16%;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #e53e3e;
                animation: fadeInCircle 0.3s ease-out forwards;
              ">
                <i class="mdi mdi-delete" style="
                  font-size: 40px;
                  color: #ffffff;
                "></i>
              </div>
              <style>
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
                .confirm-dialog-overlay div[style*="background-color: #e53e3e"]::before {
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
                  background-color: #e53e3e;
                }
              </style>

              <h2 style="
                font-size: 2em;
                margin: 0 0 12px 0;
                color: #333;
              ">${title}</h2>
              <p style="
                font-size: 1.2em;
                margin: 0 0 32px 0;
                color: #666;
              ">${message}</p>
              
              <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = false;" style="
                  border: none;
                  border-radius: 8px;
                  color: #ffffff;
                  font-size: 1.1em;
                  padding: 12px 24px;
                  cursor: pointer;
                  background-color: #666;
                  transition: opacity 0.3s ease;
                ">Cancel</button>
                <button onclick="this.closest('.confirm-dialog-overlay').remove(); window.confirmResult = true;" style="
                  border: none;
                  border-radius: 8px;
                  color: #ffffff;
                  font-size: 1.1em;
                  padding: 12px 24px;
                  cursor: pointer;
                  background-color: #e53e3e;
                  transition: opacity 0.3s ease;
                ">Delete</button>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(dialog);
        
        const checkResult = () => {
          if (typeof window.confirmResult !== 'undefined') {
            const result = window.confirmResult;
            delete window.confirmResult;
            resolve(result);
          } else {
            setTimeout(checkResult, 100);
          }
        };
        checkResult();
      });
    }
  }
}
</script>

<style scoped>
.edit-property-page {
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

/* Input field styling */
.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  background-color: white !important;
  color: #000000 !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
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

.existing-documents {
  margin-top: 16px;
}

.existing-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
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

.remove-btn {
  margin-left: 8px;
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

/* Button styling */
.cancel-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 120px;
  height: 44px;
}

.cancel-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.save-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 160px;
  height: 44px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.save-btn:hover:not(:disabled) {
  background-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .edit-property-page {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
}

/* Confirmation Dialog Styles */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.confirm-dialog-header {
  background: #dc3545;
  color: white;
  padding: 20px 24px;
  text-align: center;
}

.confirm-dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.confirm-dialog-subtitle {
  margin: 8px 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.confirm-dialog-content {
  padding: 24px;
  text-align: center;
}

.confirm-dialog-content p {
  margin: 0;
  font-size: 1rem;
  color: #333;
  line-height: 1.5;
}

.confirm-dialog-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
  justify-content: center;
}

.confirm-btn {
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 100px;
}

.confirm-btn.cancel {
  background-color: #6c757d;
  color: white;
}

.confirm-btn.cancel:hover {
  background-color: #5a6268;
  transform: translateY(-1px);
}

.confirm-btn.delete {
  background-color: #dc3545;
  color: white;
}

.confirm-btn.delete:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

/* Responsive adjustments for confirmation dialog */
@media (max-width: 768px) {
  .confirm-dialog {
    width: 95%;
    margin: 20px;
  }
  
  .confirm-dialog-actions {
    flex-direction: column;
  }
  
  .confirm-btn {
    width: 100%;
  }
}
</style>
