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
            @click="goBack"
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
              <v-tab value="details" class="tab-label tab--details"
                >Property Details</v-tab
              >
              <v-tab value="documents" class="tab-label tab--documents"
                >Documents</v-tab
              >
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
                    <!-- <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="(property.isFlagged === true || property.isFlagged === 'Yes') ? 'Flagged' : 'Not Flagged'"
                    label="Flag Status"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col> -->

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

                    <!-- Square Meterage -->
                    <v-col cols="12" md="6" v-if="showSquareMeterage">
                      <v-text-field
                        :model-value="
                          formatSquareMeterage(property.squareMeterage)
                        "
                        label="Square Meterage"
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
                        :model-value="formatDateField(property.leaseStartDate)"
                        label="Lease Starting Date"
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
                        :model-value="
                          formatCurrency(property.maintenanceAmount)
                        "
                        label="Maintenance Amount"
                        variant="outlined"
                        readonly
                        class="custom-input"
                      />
                    </v-col>

                    <!-- Amount to be Paid Out
                <v-col cols="12" md="6">
                  <v-text-field
                        :model-value="
                          formatCurrency(property.amountToBePaidOut)
                        "
                    label="Amount to be Paid Out (Inc Interest)"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                    </v-col> -->
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
                          <v-icon color="primary" class="mr-2"
                            >mdi-file-pdf-box</v-icon
                          >
                          Quotes
                        </h4>
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
                          <v-icon color="primary" class="mr-2"
                            >mdi-file-pdf-box</v-icon
                          >
                          <span class="document-name">{{
                            quote.fileName
                          }}</span>
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
                        <v-icon color="grey" class="mr-2"
                          >mdi-file-pdf-box</v-icon
                        >
                        No quotes uploaded for selected month
                      </div>
                    </div>

                    <!-- Inspections Section -->
                    <div class="document-category category-inspections">
                      <div class="category-header">
                        <h4 class="category-title">
                          <v-icon color="warning" class="mr-2"
                            >mdi-clipboard-check</v-icon
                          >
                          Inspections
                        </h4>
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
                          <v-icon color="warning" class="mr-2"
                            >mdi-clipboard-check</v-icon
                          >
                          <span class="document-name">{{
                            inspection.fileName
                          }}</span>
                          <v-btn
                            size="small"
                            color="warning"
                            variant="outlined"
                            @click="
                              viewDocument(
                                inspection.fileURL,
                                inspection.fileName
                              )
                            "
                            class="view-btn"
                          >
                            View
                          </v-btn>
                        </div>
                      </div>
                      <div v-else class="no-documents">
                        <v-icon color="grey" class="mr-2"
                          >mdi-clipboard-check</v-icon
                        >
                        No inspections uploaded for selected month
                      </div>
                    </div>

                    <!-- Invoices Section -->
                    <div class="document-category category-invoices">
                      <div class="category-header">
                        <h4 class="category-title">
                          <v-icon color="success" class="mr-2"
                            >mdi-receipt-text</v-icon
                          >
                          Invoices
                        </h4>
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
                          <v-icon color="success" class="mr-2"
                            >mdi-receipt-text</v-icon
                          >
                          <span class="document-name">{{
                            invoice.fileName
                          }}</span>
                          <v-btn
                            size="small"
                            color="success"
                            variant="outlined"
                            @click="
                              viewDocument(invoice.fileURL, invoice.fileName)
                            "
                            class="view-btn"
                          >
                            View
                          </v-btn>
                        </div>
                      </div>
                      <div v-else class="no-documents">
                        <v-icon color="grey" class="mr-2"
                          >mdi-receipt-text</v-icon
                        >
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
    <div
      v-if="showDocumentDialog"
      class="document-overlay"
      @click.self="showDocumentDialog = false"
    >
      <div class="document-dialog">
        <!-- colored card behind -->
        <div class="document-dialog-bg"></div>
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
import { db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { usePropertyType } from "@/composables/usePropertyType";
import { useAppStore } from "@/stores/app";
import { PROPERTY_TYPES } from "@/constants/propertyTypes";

const SQUARE_METER_TYPES = [
  PROPERTY_TYPES.COMMERCIAL,
  PROPERTY_TYPES.INDUSTRIAL,
];

export default {
  name: "ViewPropertyPage",
  setup() {
    const { getLabel } = usePropertyType();
    return { getLabel };
  },
  data() {
    return {
      property: {
        id: 1,
        tenantRef: "T001",
        propertyName: "123 Main Street, Cape Town",
        propertyType: "",
        squareMeterage: null,
        newOccupation: "Yes",
        leaseStartDate: "2024-01-15",
        leaseEndDate: "",
        monthsMissed: 2,
        maintenanceAmount: 15000,
        contractorRequested: "",
        paidTowardsFund: 0,
        amountToBePaidOut: 0,
        paidOut: "",
        quotes: [],
        inspections: [],
        invoices: [],
      },
      loading: true,
      error: null,
      activeTab: "details",
      showDocumentDialog: false,
      currentDocumentURL: "",
      currentDocumentName: "",
      zoomLevel: 1,
      // Shared docs filters
      docFilterMonth: "",
      docFilterSearch: "",
    };
  },
  computed: {
    propertyTypeLabel() {
      return this.getLabel(this.property.propertyType) || "Unknown";
    },
    showSquareMeterage() {
      return this.requiresSquareMeterageFor(this.property.propertyType);
    },
    filteredQuotes() {
      return this.filterDocs(this.property?.quotes || []);
    },
    filteredInspections() {
      return this.filterDocs(this.property?.inspections || []);
    },
    filteredInvoices() {
      return this.filterDocs(this.property?.invoices || []);
    },
  },
  mounted() {
    console.log("ViewPropertyPage mounted");
    // Set the page title for the app bar
    document.title = "Property Details - Depsure";

    // Optional: open a specific tab via query param
    try {
      const initialTab = this.$route?.query?.tab;
      if (initialTab === "documents" || initialTab === "details") {
        this.activeTab = initialTab;
      }
    } catch {}

    // Get property ID from route params
    const propertyId = this.$route.params.id;
    console.log("Property ID from route:", propertyId);
    if (propertyId) {
      // Load property data based on ID
      console.log("Loading property with ID:", propertyId);
      // In a real app, you would fetch the property data here
      this.loadPropertyData(propertyId);
    } else {
      console.log("No property ID found in route params");
    }
  },
  methods: {
    requiresSquareMeterageFor(type) {
      return SQUARE_METER_TYPES.includes(type);
    },
    formatSquareMeterage(value) {
      const numeric = this.toNumber(value, null);
      if (numeric === null || numeric <= 0) return "Not provided";
      return `${numeric.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} sqm`;
    },
    formatDateField(value) {
      if (!value) return "-";
      if (typeof value === "string") return value;
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      if (value?.toDate) {
        try {
          return value.toDate().toISOString().slice(0, 10);
        } catch (error) {
          console.warn("Failed to convert Firestore timestamp:", error);
        }
      }
      return String(value);
    },
    formatCurrency(value) {
      const amount = this.toNumber(value, 0);
      return `R${amount.toLocaleString()}`;
    },
    toNumber(value, fallback = 0) {
      if (value === null || value === undefined || value === "")
        return fallback;
      const num = typeof value === "number" ? value : Number(value);
      return Number.isFinite(num) ? num : fallback;
    },
    normalizePropertyData(data, id) {
      const base = {
        ...this.property,
        ...(data || {}),
        id: id ?? this.property.id,
      };
      base.maintenanceAmount = this.toNumber(
        data?.maintenanceAmount ?? base.maintenanceAmount
      );
      // Financials moved to Notices module; default to zero/empty in Property view
      base.paidTowardsFund = 0;
      base.amountToBePaidOut = 0;
      base.monthsMissed = this.toNumber(
        data?.monthsMissed ?? base.monthsMissed
      );
      const squareValue = this.toNumber(
        data?.squareMeterage ?? base.squareMeterage,
        null
      );
      base.squareMeterage = this.requiresSquareMeterageFor(base.propertyType)
        ? squareValue !== null && squareValue > 0
          ? squareValue
          : null
        : null;
      base.quotes = Array.isArray(data?.quotes) ? data.quotes : [];
      base.inspections = Array.isArray(data?.inspections)
        ? data.inspections
        : [];
      base.invoices = Array.isArray(data?.invoices) ? data.invoices : [];
      return base;
    },
    goBack() {
      // Agency and Agency Admin go back to Onboard Units; others to original list
      try {
        const appStore = useAppStore();
        const user = appStore.currentUser;
        const isAgency =
          user?.userType === "Agency" ||
          (user?.userType === "Admin" && user?.adminScope === "agency");
        if (isAgency) {
          this.$router.push("/onboard-units");
          return;
        }
      } catch (_) {}
      this.$router.push("/active-units");
    },
    // Return a Date from a document entry
    resolveDocDate(entry) {
      if (!entry) return null;
      const v =
        entry.uploadedAt ||
        entry.createdAt ||
        entry.date ||
        entry.timestamp ||
        null;
      if (!v) return null;
      try {
        if (typeof v.toDate === "function") return v.toDate();
        if (typeof v === "number") return new Date(v);
        return new Date(v);
      } catch {
        return null;
      }
    },
    monthKey(d) {
      if (!d || isNaN(d.getTime())) return "";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    },
    latestMonthFrom(docs) {
      const keys = docs
        .map((e) => this.resolveDocDate(e))
        .filter(Boolean)
        .map((d) => this.monthKey(d));
      if (!keys.length) return "";
      return keys.sort().pop();
    },
    filterDocs(docs) {
      if (!Array.isArray(docs) || docs.length === 0) return [];

      // If there's an active search or month filter, show all matching results
      const hasActiveFilter = this.docFilterMonth || this.docFilterSearch;

      if (hasActiveFilter) {
        const month = this.docFilterMonth || "";
        const term = (this.docFilterSearch || "").toLowerCase();
        return docs.filter((e) => {
          const d = this.monthKey(this.resolveDocDate(e));
          const monthMatch = month ? d === month : true;
          const name = (e.fileName || e.name || "").toLowerCase();
          const searchMatch = term ? name.includes(term) : true;
          return monthMatch && searchMatch;
        });
      }

      // No active filter: limit to last 3 documents by upload date
      const sorted = [...docs].sort((a, b) => {
        const dateA = this.resolveDocDate(a);
        const dateB = this.resolveDocDate(b);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime(); // Newest first
      });

      return sorted.slice(0, 3);
    },
    async loadPropertyData(propertyId) {
      this.loading = true;
      this.error = null;

      try {
        console.log("Loading property data for ID:", propertyId);

        // Fetch property from Firestore
        const propertyDoc = await getDoc(doc(db, "units", propertyId));

        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          this.property = this.normalizePropertyData(
            propertyData,
            propertyDoc.id
          );
          console.log("Property loaded successfully:", this.property);
        } else {
          this.error = "Property not found";
          console.log("Property not found in Firestore");
        }
      } catch (error) {
        console.error("Error loading property:", error);
        this.error = "Failed to load property details";
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
        window.open(this.currentDocumentURL, "_blank");
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
  },
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
.property-tabs :deep(.tab-label) {
  font-weight: 500;
  text-transform: none;
  transition: color 0.2s ease;
  color: #000000;
}

.property-tabs :deep(.tab-label.v-tab--selected) {
  font-weight: 600;
  background-color: white;
  color: #000000;
}

.property-tabs :deep(.v-tabs-slider) {
  background-color: #000000 !important;
}

.property-tabs :deep(.tab--details) {
  color: #000000;
}

.property-tabs :deep(.tab--details.v-tab--selected) {
  color: #000000;
}

.property-tabs :deep(.tab--documents) {
  color: #000000;
}

.property-tabs :deep(.tab--documents.v-tab--selected) {
  color: #000000;
}

.property-tabs :deep(.tab--notes) {
  color: #000000;
}

.property-tabs :deep(.tab--notes.v-tab--selected) {
  color: #000000;
}

.property-tabs :deep(.tab--archive) {
  color: #000000;
}

.property-tabs :deep(.tab--archive.v-tab--selected) {
  color: #000000;
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

  border-radius: 8px;
  border-left: 4px solid #e5e7eb; /* neutral by default */
}

/* Explicit per-category colors (match icon palettes) */
/* Keep neutral left border for all categories */

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
  gap: 16px;
  margin: 16px 0 24px 0;
  padding: 12px 0;
  align-items: center;
  justify-content: center;
}
.doc-search,
.doc-month-input {
  width: 220px;
  max-width: 220px;
}
.doc-month-input :deep(input) {
  min-width: 120px;
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
