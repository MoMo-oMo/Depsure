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

              <!-- Action Buttons -->
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
      },
      paidTowardsFund: 0,
      paidOut: "",
      originalPaidTowardsFund: 0,
      originalPaidOut: "",
      savingFinancials: false,
      loading: true,
      error: null,
      valid: true,
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
  },
  async mounted() {
    document.title = "Notice Details - Depsure";
    const noticeId = this.$route.params.id;
    if (noticeId) {
      await this.loadNotice(noticeId);
    } else {
      this.error = "No notice ID provided";
      this.loading = false;
    }
  },
  methods: {
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
          vacateDate: this.notice.leaseEndDate || "",
          updatedAt: new Date(),
        };
        if (this.isSuperAdmin) {
          payload.paidTowardsFund = Number(this.paidTowardsFund) || 0;
          payload.paidOut = this.paidOut || "";
        }
        await updateDoc(doc(db, "notices", this.notice.id), payload);
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
          };
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
