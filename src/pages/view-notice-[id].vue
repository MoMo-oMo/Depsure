<template>
  <div class="view-notice-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="$router.push('/notices')"
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
            <h1 class="page-title">Notice Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading notice details...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Editable Form -->
          <div v-else class="form-card" elevation="0">
            <v-tabs
              v-model="activeTab"
              class="notice-tabs"
              color="primary"
            >
              <v-tab value="details" class="tab-label tab--details">
                Notice Details
              </v-tab>
              <v-tab value="documents" class="tab-label tab--documents">
                Documents
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <v-window-item value="details">
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-card-text>
                    <v-row>
                  <!-- Unit Name -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.unitName"
                      label="Unit Name"
                      variant="outlined"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Lease Start Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseStartDate"
                      label="Lease Start Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Lease End Date -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="notice.leaseEndDate"
                      label="Lease End Date"
                      type="date"
                      variant="outlined"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Maintenance Amount -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="notice.maintenanceAmount"
                      label="Maintenance Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      prefix="R"
                      variant="outlined"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Months Missed Rent -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="notice.monthsMissedRent"
                      label="Months Missed Rent"
                      variant="outlined"
                      type="number"
                      min="0"
                      step="1"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Paid Towards Fund (Super Admin only) -->
                  <v-col v-if="isSuperAdmin" cols="12" md="6">
                    <v-text-field
                      v-model.number="paidTowardsFund"
                      label="Paid Towards Fund (ZAR)"
                      variant="outlined"
                      type="number"
                      step="0.01"
                      min="0"
                      :rules="[
                        (v) =>
                          v === '' ||
                          v === 0 ||
                          Number(v) >= 0 ||
                          'Amount must be positive',
                      ]"
                      class="custom-input"
                      prefix="R"
                    />
                  </v-col>

                  <!-- Paid Out (Super Admin only) -->
                  <v-col v-if="isSuperAdmin" cols="12" md="6">
                    <v-select
                      v-model="paidOut"
                      label="Paid Out"
                      variant="outlined"
                      :items="['Yes', 'No', 'Pending']"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Paid Out Amount -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="notice.paidOutAmount"
                      label="Paid Out Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      prefix="R"
                      variant="outlined"
                      class="custom-input"
                    />
                  </v-col>

                  <!-- Lease End Notes (display only if present) -->
                  <v-col
                    cols="12"
                    v-if="(notice.leaseEndNotes || '').toString().trim()"
                  >
                    <v-textarea
                      v-model="notice.leaseEndNotes"
                      label="Lease End Notes"
                      variant="outlined"
                      class="custom-input"
                      rows="3"
                      hide-details
                    />
                  </v-col>
                    </v-row>
                  </v-card-text>

                  <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn
                      color="grey"
                      variant="outlined"
                      class="edit-btn mr-2"
                      @click="$router.push('/notices')"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="black"
                      variant="elevated"
                      class="edit-btn"
                      :loading="savingFinancials"
                      @click="saveNotice"
                    >
                      Save Changes
                    </v-btn>
                  </v-card-actions>
                </v-form>
              </v-window-item>

              <v-window-item value="documents">
                <v-card-text class="documents-tab">
                  <div v-if="documentsLoading" class="documents-loading">
                    <v-progress-circular indeterminate color="black" />
                    <p class="text-medium-emphasis mt-3">
                      Loading supporting documents…
                    </p>
                  </div>
                  <div v-else-if="documentsError" class="documents-error">
                    <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                    <span>{{ documentsError }}</span>
                  </div>
                  <div v-else>
                    <h3 class="documents-title">Supporting Documents</h3>
                    <div
                      v-if="documentsLoaded && !unitDocumentId"
                      class="documents-empty text-medium-emphasis mb-4"
                    >
                      No unit is linked to this notice yet, so documents are not
                      available.
                    </div>

                    <div v-else>
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

                      <div class="documents-section">
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
                            v-if="filteredQuotes.length"
                            class="document-list"
                          >
                            <div
                              v-for="(docItem, index) in filteredQuotes"
                              :key="docItem.fileURL || docItem.name || index"
                              class="document-item"
                            >
                              <v-icon color="primary" class="mr-2"
                                >mdi-file-pdf-box</v-icon
                              >
                              <span class="document-name">{{
                                docItem.fileName || docItem.name || "Document"
                              }}</span>
                              <v-btn
                                size="small"
                                color="primary"
                                variant="outlined"
                                :disabled="!docItem.fileURL"
                                @click="openDocument(docItem)"
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
                            No quotes available.
                          </div>
                        </div>

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
                            v-if="filteredInspections.length"
                            class="document-list"
                          >
                            <div
                              v-for="(docItem, index) in filteredInspections"
                              :key="docItem.fileURL || docItem.name || index"
                              class="document-item"
                            >
                              <v-icon color="warning" class="mr-2"
                                >mdi-clipboard-check</v-icon
                              >
                              <span class="document-name">{{
                                docItem.fileName || docItem.name || "Document"
                              }}</span>
                              <v-btn
                                size="small"
                                color="warning"
                                variant="outlined"
                                :disabled="!docItem.fileURL"
                                @click="openDocument(docItem)"
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
                            No inspections available.
                          </div>
                        </div>

                        <div class="document-category category-invoices">
                          <div class="category-header">
                            <h4 class="category-title">
                              <v-icon color="success" class="mr-2"
                                >mdi-receipt</v-icon
                              >
                              Invoices
                            </h4>
                          </div>
                          <div
                            v-if="filteredInvoices.length"
                            class="document-list"
                          >
                            <div
                              v-for="(docItem, index) in filteredInvoices"
                              :key="docItem.fileURL || docItem.name || index"
                              class="document-item"
                            >
                              <v-icon color="success" class="mr-2"
                                >mdi-receipt</v-icon
                              >
                              <span class="document-name">{{
                                docItem.fileName || docItem.name || "Document"
                              }}</span>
                              <v-btn
                                size="small"
                                color="success"
                                variant="outlined"
                                :disabled="!docItem.fileURL"
                                @click="openDocument(docItem)"
                                class="view-btn"
                              >
                                View
                              </v-btn>
                            </div>
                          </div>
                          <div v-else class="no-documents">
                            <v-icon color="grey" class="mr-2"
                              >mdi-receipt</v-icon
                            >
                            No invoices available.
                          </div>
                        </div>
                      </div> <!-- documents-section -->
                    </div>
                  </div>
                </v-card-text>
              </v-window-item>
            </v-window>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { useCustomDialogs } from "@/composables/useCustomDialogs";
import { useAppStore } from "@/stores/app";
import { db } from "@/firebaseConfig";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export default {
  name: "ViewNoticePage",
  data() {
    return {
      notice: {
        id: "",
        unitName: "",
        leaseStartDate: "",
        leaseEndDate: "",
        leaseEndNotes: "",
        monthsMissedRent: 0,
        maintenanceAmount: 0,
        paidOutAmount: 0,
      },
      paidTowardsFund: 0,
      paidOut: "",
      originalPaidTowardsFund: 0,
      originalPaidOut: "",
      savingFinancials: false,
      loading: true,
      error: null,
      valid: true,
      unitDocumentId: "",
      activeTab: "details",
      documentsLoaded: false,
      documentsLoading: false,
      documentsError: null,
      documents: {
        quotes: [],
        inspections: [],
        invoices: [],
      },
      docFilterSearch: "",
      docFilterMonth: "",
    };
  },
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return (
        user?.userType === "Agency" ||
        (user?.userType === "Admin" && user?.adminScope === "agency")
      );
    },
    isSuperAdmin() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return (
        user?.userType === "Super Admin" ||
        (user?.userType === "Admin" && user?.adminScope === "depsure")
      );
    },
    userType() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType;
    },
    isFinancialsValid() {
      const amountOk =
        this.paidTowardsFund === "" ||
        (Number(this.paidTowardsFund) >= 0 &&
          Number.isFinite(Number(this.paidTowardsFund)));
      const status = String(this.paidOut || "")
        .trim()
        .toLowerCase();
      const statusOk = ["yes", "no", "pending"].includes(status);
      return amountOk && statusOk;
    },
    hasFinancialsChanged() {
      const amountChanged =
        String(this.paidTowardsFund ?? "").trim() !==
        String(this.originalPaidTowardsFund ?? "").trim();
      const statusChanged =
        String(this.paidOut ?? "").trim() !==
        String(this.originalPaidOut ?? "").trim();
      return amountChanged || statusChanged;
    },
    canProcessNotice() {
      return (
        Number(this.paidTowardsFund) > 0 ||
        String(this.paidOut || "").trim() !== ""
      );
    },
    filteredQuotes() {
      return this.filterDocumentsList(this.documents.quotes);
    },
    filteredInspections() {
      return this.filterDocumentsList(this.documents.inspections);
    },
    filteredInvoices() {
      return this.filterDocumentsList(this.documents.invoices);
    },
  },
  watch: {
    unitDocumentId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.loadDocuments(true);
      }
    },
    activeTab(newVal) {
      if (newVal === "documents") {
        this.loadDocuments();
      }
    },
  },
  async mounted() {
    document.title = "Notice Details - Depsure";
    try {
      const initialTab = this.$route?.query?.tab;
      if (initialTab === "documents" || initialTab === "details") {
        this.activeTab = initialTab;
      }
    } catch {}
    const noticeId = this.$route.params.id;
    if (noticeId) {
      await this.loadNotice(noticeId);
    } else {
      this.error = "No notice ID provided";
      this.loading = false;
    }
  },
  methods: {
    async loadDocuments(force = false) {
      if (!this.unitDocumentId) {
        this.documents = { quotes: [], inspections: [], invoices: [] };
        this.documentsLoaded = false;
        return;
      }
      if (this.documentsLoading) return;
      if (this.documentsLoaded && !force) return;
      this.documentsLoading = true;
      this.documentsError = null;
      try {
        const snap = await getDoc(doc(db, "units", this.unitDocumentId));
        if (snap.exists()) {
          const data = snap.data() || {};
          this.documents = {
            quotes: Array.isArray(data.quotes) ? data.quotes : [],
            inspections: Array.isArray(data.inspections)
              ? data.inspections
              : [],
            invoices: Array.isArray(data.invoices) ? data.invoices : [],
          };
          this.documentsLoaded = true;
        } else {
          this.documents = { quotes: [], inspections: [], invoices: [] };
          this.documentsLoaded = true;
          this.documentsError = "No documents found for this unit.";
        }
      } catch (error) {
        console.error("Failed to load supporting documents", error);
        this.documentsError = "Failed to load supporting documents.";
      } finally {
        this.documentsLoading = false;
      }
    },
    resolveDocumentDate(entry) {
      if (!entry) return null;
      const raw =
        entry.uploadedAt || entry.createdAt || entry.date || entry.timestamp;
      if (!raw) return null;
      try {
        if (typeof raw.toDate === "function") return raw.toDate();
        return new Date(raw);
      } catch {
        return null;
      }
    },
    monthKey(date) {
      if (!date || Number.isNaN(date.getTime())) return "";
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    },
    filterDocumentsList(list) {
      if (!Array.isArray(list) || !list.length) return [];
      const hasFilter = this.docFilterSearch || this.docFilterMonth;
      if (hasFilter) {
        const term = (this.docFilterSearch || "").toLowerCase();
        const month = this.docFilterMonth || "";
        return list.filter((item) => {
          const name = String(item?.fileName || item?.name || "").toLowerCase();
          const date = this.resolveDocumentDate(item);
          const matchesTerm = term ? name.includes(term) : true;
          const matchesMonth = month ? this.monthKey(date) === month : true;
          return matchesTerm && matchesMonth;
        });
      }
      const sorted = [...list].sort((a, b) => {
        const dateA = this.resolveDocumentDate(a);
        const dateB = this.resolveDocumentDate(b);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      });
      return sorted.slice(0, 3);
    },
    formatDocumentDate(entry) {
      const date = this.resolveDocumentDate(entry);
      if (!date) return "";
      return date.toISOString().slice(0, 10);
    },
    openDocument(entry) {
      const url = entry?.fileURL || entry?.url;
      if (!url) return;
      window.open(url, "_blank");
    },
    async syncNoticeToVacancy(extra = {}) {
      try {
        const { collection, query, where, getDocs, updateDoc } = await import(
          "firebase/firestore"
        );
        const queries = [];
        const trimmedName = (this.notice?.unitName || "").trim();
        if (this.notice?.unitId) {
          queries.push(
            query(
              collection(db, "vacancies"),
              where("unitId", "==", this.notice.unitId)
            )
          );
        }
        if (trimmedName) {
          queries.push(
            query(
              collection(db, "vacancies"),
              where("unitName", "==", trimmedName)
            )
          );
        }
        if (!queries.length) return;

        const resolveNumber = (value, fallback = 0) => {
          const num =
            typeof value === "number"
              ? value
              : Number(value ?? fallback ?? 0);
          return Number.isFinite(num) ? num : fallback;
        };

        const basePaidOut =
          extra.hasOwnProperty("paidOut") || typeof extra.paidOut !== "undefined"
            ? extra.paidOut
            : this.paidOut ?? "";
        const updateData = {
          maintenanceAmount: resolveNumber(
            extra.maintenanceAmount,
            this.notice?.maintenanceAmount
          ),
          monthsMissed: resolveNumber(
            extra.monthsMissed,
            this.notice?.monthsMissedRent
          ),
          leaseStartDate:
            extra.leaseStartDate ?? this.notice?.leaseStartDate ?? "",
          leaseEndDate: extra.leaseEndDate ?? this.notice?.leaseEndDate ?? "",
          paidOutAmount: resolveNumber(
            extra.paidOutAmount,
            this.notice?.paidOutAmount
          ),
          amountToBePaidOut: resolveNumber(
            extra.paidOutAmount,
            this.notice?.paidOutAmount
          ),
          updatedAt: new Date(),
        };

        if (
          this.isSuperAdmin ||
          extra.hasOwnProperty("paidTowardsFund")
        ) {
          updateData.paidTowardsFund = resolveNumber(
            extra.paidTowardsFund,
            this.paidTowardsFund
          );
        }

        if (typeof basePaidOut !== "undefined") {
          updateData.paidOut = String(basePaidOut || "").trim();
        }

        const attempts = queries.length ? queries : [];
        for (const qRef of attempts) {
          const snap = await getDocs(qRef);
          if (!snap.empty) {
            const updates = snap.docs.map((docSnap) =>
              updateDoc(doc(db, "vacancies", docSnap.id), updateData)
            );
            await Promise.allSettled(updates);
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to sync notice data to vacancies", error);
      }
    },
    formatDateField(value) {
      if (!value) return "N/A";
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
    async saveNoticeFinancials() {
      if (!this.isSuperAdmin || !this.notice?.id) return;
      try {
        if (!this.isFinancialsValid) return;
        this.savingFinancials = true;
        const { updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "notices", this.notice.id), {
          paidTowardsFund: Number(this.paidTowardsFund) || 0,
          paidOut: this.paidOut || "",
          financialsEdited: true,
          updatedAt: new Date(),
        });
        await this.syncNoticeToVacancy({
          paidTowardsFund: Number(this.paidTowardsFund) || 0,
          paidOut: this.paidOut || "",
        });
        const { showSuccessDialog } = useCustomDialogs();
        showSuccessDialog?.("Notice financials saved.", "Success", "OK");

        this.originalPaidTowardsFund = this.paidTowardsFund;
        this.originalPaidOut = this.paidOut;

        this.$router.push("/notices");
      } catch (e) {
        console.error("Failed updating notice financials", e);
        const { showErrorDialog } = useCustomDialogs();
        showErrorDialog?.("Failed to update financial fields.", "Error", "OK");
      } finally {
        this.savingFinancials = false;
      }
    },
    async saveNotice() {
      try {
        if (!this.notice?.id) return;
        this.savingFinancials = true;
        const { updateDoc } = await import("firebase/firestore");
        const payload = {
          unitName: this.notice.unitName || "",
          leaseStartDate: this.notice.leaseStartDate || "",
          leaseEndDate: this.notice.leaseEndDate || "",
          leaseEndNotes: this.notice.leaseEndNotes || "",
          monthsMissedRent: Number(this.notice.monthsMissedRent) || 0,
          maintenanceAmount: Number(this.notice.maintenanceAmount) || 0,
          paidOutAmount: Number(this.notice.paidOutAmount) || 0,
          vacateDate: this.notice.leaseEndDate || "",
          updatedAt: new Date(),
        };
        if (this.isSuperAdmin) {
          payload.paidTowardsFund = Number(this.paidTowardsFund) || 0;
          payload.paidOut = this.paidOut || "";
        }
        await updateDoc(doc(db, "notices", this.notice.id), payload);
        await this.syncNoticeToVacancy(payload);
        const { showSuccessDialog } = useCustomDialogs();
        showSuccessDialog?.(
          "Notice saved successfully!",
          "Success!",
          "Continue"
        );
        this.$router.push("/notices");
      } catch (e) {
        console.error("Failed to save notice", e);
        const { showErrorDialog } = useCustomDialogs();
        showErrorDialog?.(
          "Failed to save notice. Please try again.",
          "Error",
          "OK"
        );
      } finally {
        this.savingFinancials = false;
      }
    },
    async loadNotice(noticeId) {
      this.loading = true;
      this.error = null;

      try {
        console.log("Loading notice data for ID:", noticeId);

        // Fetch notice from Firestore
        const noticeDoc = await getDoc(doc(db, "notices", noticeId));

        if (noticeDoc.exists()) {
          const noticeData = noticeDoc.data();
          this.notice = {
            id: noticeDoc.id,
            unitName: noticeData.unitName || "",
            leaseStartDate: noticeData.leaseStartDate || "",
            leaseEndDate: noticeData.leaseEndDate || "",
            leaseEndNotes: noticeData.leaseEndNotes || "",
            monthsMissedRent: noticeData.monthsMissedRent || 0,
            maintenanceAmount:
              Number(noticeData.maintenanceAmount ?? 0) || 0,
            paidOutAmount: Number(noticeData.paidOutAmount ?? 0) || 0,
            unitId: noticeData.unitId || "",
          };
          this.documentsLoaded = false;
          this.documents = { quotes: [], inspections: [], invoices: [] };
          console.log("Notice loaded successfully:", this.notice);

          // For Super Admins, attempt to resolve Paid Towards Fund and Paid Out
          if (this.isSuperAdmin) {
            try {
              // Prefer values saved on notice
              const paidTowards = Number(noticeData.paidTowardsFund ?? 0);
              const paidOutVal = String(noticeData.paidOut ?? "").trim();
              this.paidTowardsFund = Number.isFinite(paidTowards)
                ? paidTowards
                : 0;
              this.paidOut = paidOutVal || "";
              this.originalPaidTowardsFund = this.paidTowardsFund;
              this.originalPaidOut = this.paidOut;

              // If missing, try fetch from underlying unit
              if (
                !this.paidTowardsFund &&
                !this.paidOut &&
                (noticeData.unitId || noticeData.unitName)
              ) {
                try {
                  if (noticeData.unitId) {
                    const unitSnap = await getDoc(
                      doc(db, "units", noticeData.unitId)
                    );
                    if (unitSnap.exists()) {
                      const unit = unitSnap.data() || {};
                      this.paidTowardsFund =
                        Number(unit.paidTowardsFund || unit.paidTowards || 0) ||
                        0;
                      this.paidOut = String(unit.paidOut || "").trim();
                      this.originalPaidTowardsFund = this.paidTowardsFund;
                      this.originalPaidOut = this.paidOut;
                    }
                  } else if (noticeData.unitName) {
                    // Fallback by name
                    const { collection, query, where, getDocs } = await import(
                      "firebase/firestore"
                    );
                    const q = query(
                      collection(db, "units"),
                      where("unitName", "==", noticeData.unitName)
                    );
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                      const unit = snap.docs[0].data() || {};
                      this.paidTowardsFund =
                        Number(unit.paidTowardsFund || unit.paidTowards || 0) ||
                        0;
                      this.paidOut = String(unit.paidOut || "").trim();
                      this.originalPaidTowardsFund = this.paidTowardsFund;
                      this.originalPaidOut = this.paidOut;
                    }
                  }
                } catch (e) {
                  console.warn(
                    "Failed to resolve unit financials for notice",
                    e
                  );
                }
              }
            } catch (e) {
              console.warn("Failed to compute financials for notice", e);
            }
          }

          await this.resolveUnitForDocuments(noticeData);
        } else {
          this.error = "Notice not found";
          console.log("Notice not found in Firestore");
        }
      } catch (error) {
        console.error("Error loading notice:", error);
        this.error = `Failed to load notice details: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
    async resolveUnitForDocuments(noticeData) {
      try {
        if (!noticeData) return;
        if (noticeData.unitId) {
          this.unitDocumentId = noticeData.unitId;
          return;
        }

        const unitNameCandidates = [
          noticeData.unitName,
          noticeData.propertyName,
          noticeData.unitNumber,
        ]
          .map((value) =>
            typeof value === "string" ? value.replace(/\s+/g, " ").trim() : ""
          )
          .filter(Boolean);

        if (!unitNameCandidates.length) {
          this.unitDocumentId = "";
          return;
        }

        const { collection, query, where, getDocs } = await import(
          "firebase/firestore"
        );

        for (const candidate of unitNameCandidates) {
          const q = query(
            collection(db, "units"),
            where("unitName", "==", candidate)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            this.unitDocumentId = snap.docs[0].id;
            this.loadDocuments(true);
            return;
          }
          const alt = query(
            collection(db, "units"),
            where("propertyName", "==", candidate)
          );
          const altSnap = await getDocs(alt);
          if (!altSnap.empty) {
            this.unitDocumentId = altSnap.docs[0].id;
            this.loadDocuments(true);
            return;
          }
        }
        this.unitDocumentId = "";
        this.documentsLoaded = false;
        this.documents = { quotes: [], inspections: [], invoices: [] };
      } catch (error) {
        console.warn("Failed to resolve unit for documents", error);
        this.unitDocumentId = "";
        this.documentsLoaded = false;
        this.documents = { quotes: [], inspections: [], invoices: [] };
      }
    },
    formatCurrency(amount) {
      const n = Number(amount || 0);
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "ZAR",
          minimumFractionDigits: 0,
        }).format(n);
      } catch {
        return `R ${n.toLocaleString()}`;
      }
    },
    async deleteNotice() {
      const { showSuccessDialog, showErrorDialog, showConfirmDialog } =
        useCustomDialogs();
      try {
        await showConfirmDialog({
          title: "Delete notice?",
          message: `Are you sure you want to delete notice for ${this.notice.unitName}?`,
          confirmText: "Delete",
          cancelText: "Cancel",
          color: "#dc3545",
        });
      } catch (_) {
        return;
      }
      try {
        await deleteDoc(doc(db, "notices", this.notice.id));
        showSuccessDialog(
          "Notice deleted successfully!",
          "Success!",
          "Continue",
          "/notices"
        );
      } catch (error) {
        console.error("Error deleting notice:", error);
        showErrorDialog(
          `Failed to delete notice: ${error.message}`,
          "Error",
          "OK"
        );
      }
    },
  },
};
</script>

<style scoped>
.view-notice-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling */
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

/* Title section */
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

/* Form card */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Input styling */
.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

.notice-tabs {
  border-bottom: 1px solid #e9ecef;
}

.notice-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 600;
}

.notice-tabs :deep(.v-tab--selected) {
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

/* Responsive */
@media (max-width: 768px) {
  .view-notice-page {
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
