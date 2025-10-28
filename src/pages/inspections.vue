<template>
  <div class="view-inspection-page">
    <v-container fluid>
      <!-- Filters and Add Inspection Entry -->
      <v-row class="mb-4">
        <v-col cols="12" md="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search inspection entries..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterEntries"
          />
        </v-col>

        <!-- Agency selector removed for consistent header (selection may still be set globally) -->

        <v-col cols="12" md="3" class="pa-4">
          <v-menu
            v-model="monthMenu"
            :close-on-content-click="false"
            transition="fade-transition"
            location="bottom"
            @update:model-value="onMonthMenuToggle"
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="monthFilterLabel"
                label="Filter by month"
                append-inner-icon="mdi-calendar-month"
                flat
                density="comfortable"
                variant="outlined"
                hide-details
                dense
                class="custom-input top-filter month-input flex-grow-1"
                readonly
              />
            </template>
            <div class="month-menu">
              <div class="month-menu__title">Pick month</div>
              <input
                type="month"
                :value="tempMonth"
                @input="
                  (e) => {
                    tempMonth = e.target.value;
                  }
                "
                class="month-menu__input"
              />
              <div class="month-menu__actions">
                <v-btn
                  color="black"
                  variant="elevated"
                  size="small"
                  @click="applyMonth"
                  >Apply</v-btn
                >
                <v-btn
                  color="grey"
                  variant="text"
                  size="small"
                  @click="clearMonth"
                  >All</v-btn
                >
              </div>
            </div>
          </v-menu>
        </v-col>

        <v-col cols="12" md="2" class="pa-4">
          <v-select
            v-model="propertyTypeFilter"
            :items="propertyTypeFilterOptions"
            item-title="title"
            item-value="value"
            label="Property Type"
            prepend-inner-icon="mdi-home"
            density="comfortable"
            variant="outlined"
            hide-details
            class="custom-input top-filter"
            @update:model-value="filterEntries"
          />
        </v-col>

        <v-col
          cols="12"
          md="3"
          lg="2"
          class="pa-4 d-flex align-center"
          v-if="isAgencyUser"
        >
          <v-btn @click="addInspection" class="request-btn">
            Request Inspection
          </v-btn>
        </v-col>
      </v-row>

      <!-- Clean Agency Header (image, centered title, no overlay) -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="agency-hero-card" elevation="1">
            <div class="agency-hero-bg" :style="agencyHeroBgStyle"></div>
            <div class="agency-hero-center">
              {{ heroTitle }}
            </div>
          </v-card>
        </v-col>
      </v-row>
      <!-- Agency Info Card -->
      <v-row class="mb-6" v-if="false && selectedAgencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <div class="agency-card-bg" :style="agencyCardBgStyle"></div>
            <v-row class="no-gutters" align="stretch">
              <v-col cols="12">
                <div class="agency-content-right">
                  <v-card-title class="text-white text-h4 mb-2">
                    {{ selectedAgencyDetails.agencyName }}
                  </v-card-title>
                  <v-card-text class="text-white">
                    <div class="agency-details-black">
                      <div class="detail-item-black">
                        <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                        <span>{{
                          selectedAgencyDetails.address ||
                          "Address not provided"
                        }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon
                          icon="mdi-card-account-details"
                          class="mr-2 text-white"
                        />
                        <span
                          >Reg No:
                          {{ selectedAgencyDetails.regNo || "â€”" }}</span
                        >
                      </div>
                      <div class="detail-item-black">
                        <v-icon icon="mdi-account" class="mr-2 text-white" />
                        <span
                          >Primary Contact:
                          {{
                            selectedAgencyDetails.primaryContactName || "N/A"
                          }}</span
                        >
                      </div>
                      <div class="detail-item-black">
                        <v-icon icon="mdi-phone" class="mr-2 text-white" />
                        <span>{{
                          selectedAgencyDetails.contactNumber || "N/A"
                        }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon icon="mdi-email" class="mr-2 text-white" />
                        <span>{{ selectedAgencyDetails.email || "N/A" }}</span>
                      </div>
                      <div class="detail-item-black">
                        <v-icon icon="mdi-home" class="mr-2 text-white" />
                        <span>{{ activeUnitsCount }} Properties</span>
                      </div>
                    </div>
                    <!-- Description hidden to reduce visual noise over image -->
                    <!-- <v-divider class="my-4 bg-white" /> -->
                  </v-card-text>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Inspection Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredEntries"
            class="custom-header"
            density="comfortable"
            hover
            :loading="entriesLoading"
          >
            <template v-slot:item.inspectionRequired="{ item }">
              <v-chip
                :color="item.inspectionRequired === 'Yes' ? 'success' : 'error'"
                size="small"
              >
                {{ item.inspectionRequired }}
              </v-chip>
            </template>
            <template v-slot:item.appointmentMade="{ item }">
              <v-chip
                :color="item.appointmentMade === 'Yes' ? 'success' : 'error'"
                size="small"
              >
                {{ item.appointmentMade }}
              </v-chip>
            </template>
            <template v-slot:item.quotesNeeded="{ item }">
              <v-chip
                :color="item.quotesNeeded === 'Yes' ? 'success' : 'error'"
                size="small"
              >
                {{ item.quotesNeeded }}
              </v-chip>
            </template>
            <template v-slot:item.document="{ item }">
              <div
                v-if="item.inspectionFileURL"
                class="d-flex align-center justify-center"
              >
                <v-btn
                  icon="mdi-file-pdf-box"
                  size="small"
                  variant="text"
                  color="success"
                  @click="viewDocument(item)"
                  class="document-btn"
                  :title="item.inspectionFileName || 'View Document'"
                />
              </div>
              <div v-else class="d-flex align-center justify-center">
                <v-icon icon="mdi-file-remove" size="small" color="grey" />
              </div>
            </template>
            <!-- Action buttons - Edit only for Agency users, View/Delete for all -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewEntry(item)"
                  class="action-btn"
                  title="View Inspection"
                />
                <v-btn
                  v-if="isAgencyUser"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editEntry(item)"
                  class="action-btn"
                  title="Edit Inspection"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteEntry(item)"
                  class="action-btn"
                  title="Delete Inspection"
                />
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <v-snackbar v-model="snackbar" timeout="3000">
        {{ snackbarMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn color="white" text v-bind="attrs" @click="snackbar = false"
            >Close</v-btn
          >
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { useAppStore } from "@/stores/app";
import { useCustomDialogs } from "@/composables/useCustomDialogs";
import { usePropertyType } from "@/composables/usePropertyType";
const heroBg =
  "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg";

export default {
  name: "InspectionPage",
  setup() {
    const { showConfirmDialog, showSuccessDialog, showErrorDialog } =
      useCustomDialogs();
    const { getOptions, getLabel, getColor, resolvePropertyTypeFromUnit } =
      usePropertyType();
    return {
      showConfirmDialog,
      showSuccessDialog,
      showErrorDialog,
      getOptions,
      getLabel,
      getColor,
      resolvePropertyTypeFromUnit,
    };
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: "",
      monthMenu: false,
      tempMonth: "",
      propertyTypeFilter: null,
      selectedAgency: null,
      filteredEntries: [],
      entries: [],
      agencies: [],
      entriesLoading: false,
      agenciesLoading: false,
      snackbar: false,
      snackbarMessage: "",
      activeUnitsCount: 0,
      headers: [
        { title: "UNIT NAME", key: "unitName", sortable: true },
        {
          title: "INSPECTION REQUIRED",
          key: "inspectionRequired",
          sortable: true,
          align: "center",
        },
        {
          title: "INSEPCTION DATE",
          key: "inspectionDate",
          sortable: true,
          align: "center",
        },
        { title: "ACTIONS", key: "actions", sortable: false, align: "center" },
      ],
    };
  },
  computed: {
    agencyHeroBgStyle() {
      return { background: `url(${heroBg}) center/cover no-repeat` };
    },
    heroTitle() {
      return "Inspections";
    },
    agencyCardBgStyle() {
      const url =
        this.selectedAgencyDetails?.profileImageUrl ||
        this.selectedAgencyDetails?.profileImage ||
        "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg";
      return {
        background: `url(${url}) center/cover no-repeat`,
      };
    },
    monthFilterLabel() {
      if (!this.monthFilter) return "All Months";
      try {
        const [yy, mm] = String(this.monthFilter).split("-");
        const d = new Date(Number(yy), Number(mm) - 1, 1);
        return d.toLocaleString("en-US", { month: "long", year: "numeric" });
      } catch {
        return this.monthFilter;
      }
    },
    hasCurrentAgency() {
      const appStore = useAppStore();
      return !!appStore.currentAgency;
    },
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.id === this.selectedAgency) || null;
    },
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
      const userType = appStore.currentUser?.userType;
      const isSuper = userType === "Super Admin";
      console.log(
        "Inspections - User Type:",
        userType,
        "Is Super Admin:",
        isSuper
      );
      return isSuper;
    },
    userType() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType;
    },
    propertyTypeFilterOptions() {
      return [{ value: null, title: "All Types" }, ...this.getOptions()];
    },
  },
  methods: {
    onMonthMenuToggle(open) {
      if (open) this.tempMonth = this.monthFilter || "";
    },
    applyMonth() {
      this.monthFilter = this.tempMonth || "";
      this.filterEntries();
      this.monthMenu = false;
    },
    clearMonth() {
      this.tempMonth = "";
      this.monthFilter = "";
      this.filterEntries();
      this.monthMenu = false;
    },
    openMonthPicker() {
      const el = this.$refs.monthInput?.$el?.querySelector("input");
      if (el) {
        if (typeof el.showPicker === "function") el.showPicker();
        else el.focus();
      }
    },
    async refreshActiveUnitsCount(agencyId = null) {
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        let unitsQuery;
        if (userType === "Agency") {
          unitsQuery = query(
            collection(db, "units"),
            where("agencyId", "==", currentUser.uid)
          );
        } else if (agencyId) {
          unitsQuery = query(
            collection(db, "units"),
            where("agencyId", "==", agencyId)
          );
        } else {
          this.activeUnitsCount = 0;
          return;
        }
        const snap = await getDocs(unitsQuery);
        this.activeUnitsCount = snap.size;
      } catch (error) {
        console.error("Error counting active units:", error);
        this.activeUnitsCount = 0;
      }
    },
    getCurrentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    },

    async fetchInspections(agencyId = null) {
      this.entriesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;

        console.log("Fetching inspections for agencyId:", agencyId);
        let inspectionsQuery;

        if (
          userType === "Agency" ||
          (userType === "Admin" && currentUser.adminScope === "agency")
        ) {
          // Agency users and Agency Admin users can only see their own inspections
          let targetAgencyId = currentUser.uid; // Default for Agency users

          if (userType === "Admin" && currentUser.adminScope === "agency") {
            // For Agency Admin users, use their managed agency ID
            targetAgencyId = currentUser.managedAgencyId;
          }

          if (targetAgencyId) {
            inspectionsQuery = query(
              collection(db, "inspections"),
              where("agencyId", "==", targetAgencyId)
            );
            console.log(
              "Querying inspections for agency user:",
              targetAgencyId
            );
          } else {
            // No agency ID available, return empty results
            this.entries = [];
            this.filteredEntries = [];
            return;
          }
        } else if (agencyId) {
          // Query inspection entries for specific agency
          inspectionsQuery = query(
            collection(db, "inspections"),
            where("agencyId", "==", agencyId)
          );
          console.log("Querying inspections for specific agency:", agencyId);
        } else {
          // Super Admin/Admin users: no agency selected, return empty results
          this.entries = [];
          this.filteredEntries = [];
          this.entriesLoading = false;
          return;
        }

        const querySnapshot = await getDocs(inspectionsQuery);

        // First, get all inspection entries
        const entries = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        }));

        // Resolve property types for each entry
        const entriesWithPropertyTypes = await Promise.all(
          entries.map(async (entry) => {
            try {
              // Try to resolve property type from unitId if available
              if (entry.unitId) {
                const propertyType = await this.resolvePropertyTypeFromUnit(
                  entry.unitId
                );
                return { ...entry, propertyType };
              }
              // If no unitId, try to resolve from unitName by finding the unit
              else if (entry.unitName) {
                // Find the unit by name in the units collection
                const unitsQuery = query(
                  collection(db, "units"),
                  where("propertyName", "==", entry.unitName)
                );
                const unitsSnapshot = await getDocs(unitsQuery);
                if (!unitsSnapshot.empty) {
                  const unitDoc = unitsSnapshot.docs[0];
                  const unitData = unitDoc.data();
                  return {
                    ...entry,
                    propertyType: unitData.propertyType || "residential",
                  };
                }
              }
              // Default to residential if we can't resolve
              return { ...entry, propertyType: "residential" };
            } catch (error) {
              console.error(
                "Error resolving property type for inspection entry:",
                entry.id,
                error
              );
              return { ...entry, propertyType: "residential" };
            }
          })
        );

        this.entries = entriesWithPropertyTypes;
        console.log(
          "Inspections loaded with property types:",
          this.entries.length
        );
        console.log("User type:", userType, "Agency ID filter:", agencyId);

        // Log the first inspection structure if available
        if (this.entries.length > 0) {
          console.log("First inspection structure:", this.entries[0]);
          console.log("First inspection agencyId:", this.entries[0].agencyId);
        }

        this.filterEntries();
      } catch (error) {
        console.error("Error fetching inspections:", error);
        this.snackbarMessage = "Failed to load inspections";
        this.snackbar = true;
      } finally {
        this.entriesLoading = false;
      }
    },

    async fetchAgencies(createTestData = false) {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;

        if (
          userType === "Agency" ||
          (userType === "Admin" && currentUser.adminScope === "agency")
        ) {
          // Agency users and Agency Admin users can only see their own agency
          let agencyData = null;

          if (userType === "Agency") {
            // For Agency users, use their own document
            const agencyDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (agencyDoc.exists()) {
              agencyData = {
                id: agencyDoc.id,
                ...agencyDoc.data(),
              };
            }
          } else if (
            userType === "Admin" &&
            currentUser.adminScope === "agency"
          ) {
            // For Agency Admin users, fetch their managed agency
            if (currentUser.managedAgencyId) {
              const agencyDoc = await getDoc(
                doc(db, "users", currentUser.managedAgencyId)
              );
              if (agencyDoc.exists()) {
                agencyData = {
                  id: agencyDoc.id,
                  ...agencyDoc.data(),
                };
              }
            }
          }

          if (agencyData) {
            this.agencies = [agencyData];
            // Pre-select the agency for agency users and agency admins
            this.selectedAgency = agencyData.id;
            await this.refreshActiveUnitsCount(this.selectedAgency);
          } else {
            this.agencies = [];
          }
          console.log("Agency user - own agency loaded:", this.agencies);
        } else {
          // Super Admin and Admin users can see all agencies
          console.log("Fetching agencies...");
          const agenciesQuery = query(
            collection(db, "users"),
            where("userType", "==", "Agency")
          );

          const querySnapshot = await getDocs(agenciesQuery);
          this.agencies = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Agencies fetched:", this.agencies);
          console.log("Number of agencies found:", this.agencies.length);

          // Log the first agency structure if available
          if (this.agencies.length > 0) {
            console.log("First agency structure:", this.agencies[0]);
            console.log(
              "First agency agencyName:",
              this.agencies[0].agencyName
            );
          } // Do not auto-create test agencies in production
        }
      } catch (error) {
        console.error("Error fetching agencies:", error);
      } finally {
        this.agenciesLoading = false;
      }
    },

    filterEntries() {
      this.filteredEntries = this.entries.filter((entry) => {
        const textMatch = entry.unitName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        let agencyMatch = true;
        let monthMatch = true;
        let propertyTypeMatch = true;

        if (this.selectedAgency) {
          agencyMatch = entry.agencyId === this.selectedAgency;
        }

        if (this.propertyTypeFilter) {
          propertyTypeMatch = entry.propertyType === this.propertyTypeFilter;
        }

        if (this.monthFilter) {
          // Use createdAt date for filtering since that's when the inspection was created
          const entryDate = new Date(entry.createdAt);
          const filterDate = new Date(this.monthFilter + "-01");
          monthMatch =
            entryDate.getMonth() === filterDate.getMonth() &&
            entryDate.getFullYear() === filterDate.getFullYear();
        }
        return textMatch && agencyMatch && monthMatch && propertyTypeMatch;
      });
    },

    viewEntry(entry) {
      this.$router.push(`/view-inspection-${entry.id}`);
    },

    editEntry(entry) {
      this.$router.push(`/edit-inspection-${entry.id}`);
    },

    async deleteEntry(entry) {
      try {
        await this.showConfirmDialog({
          title: "Delete inspection entry?",
          message: `Are you sure you want to delete inspection entry for ${entry.unitName}?`,
          confirmText: "Delete",
          cancelText: "Cancel",
          color: "#dc3545",
        });
      } catch (_) {
        return;
      }
      try {
        await deleteDoc(doc(db, "inspections", entry.id));
        const index = this.entries.findIndex((e) => e.id === entry.id);
        if (index > -1) {
          this.entries.splice(index, 1);
          this.filterEntries();
          this.showSuccessDialog(
            `Inspection entry for ${entry.unitName} deleted successfully!`,
            "Success!",
            "Continue"
          );
        }
      } catch (error) {
        console.error("Error deleting inspection:", error);
        this.showErrorDialog(
          "Failed to delete inspection entry. Please try again.",
          "Error",
          "OK"
        );
      }
    },

    addInspection() {
      this.$router.push("/add-inspection");
    },

    viewDocument(item) {
      if (item.inspectionFileURL) {
        window.open(item.inspectionFileURL, "_blank");
      }
    },

    onAgencyChange(agencyId) {
      console.log("Agency changed to:", agencyId);
      console.log("Available agencies:", this.agencies);
      console.log("Selected agency details:", this.selectedAgencyDetails);

      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }

      // Clear current entries before fetching new ones
      this.entries = [];
      this.filteredEntries = [];

      if (agencyId) {
        // Fetch inspection entries for selected agency
        console.log("Fetching inspections for agency:", agencyId);
        this.fetchInspections(agencyId);
        this.refreshActiveUnitsCount(agencyId);
      } else {
        // Fetch all inspection entries when no agency is selected
        console.log("Fetching all inspections");
        this.fetchInspections();
        this.refreshActiveUnitsCount();
      }
    },
  },
  async mounted() {
    document.title = "Inspections - Depsure";

    // Fetch agencies first
    await this.fetchAgencies();

    // Fetch inspections based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own inspections
      await this.fetchInspections();
      await this.refreshActiveUnitsCount();
    } else {
      const appStore = useAppStore();
      const globalId = appStore.currentAgency?.id || null;
      if (globalId) {
        this.selectedAgency = globalId;
        await this.fetchInspections(globalId);
        await this.refreshActiveUnitsCount(globalId);
      } else {
        // Super Admin/Admin users: no agency selected, show empty state
        this.entries = [];
        this.filteredEntries = [];
      }
    }
  },

  // Add activated lifecycle hook to refresh data when navigating to this page
  async activated() {
    // Refresh data when the page is activated (e.g., when navigating back from add-inspection)
    if (this.isAgencyUser) {
      await this.fetchInspections();
    } else if (this.selectedAgency) {
      await this.fetchInspections(this.selectedAgency);
    } else {
      // No agency selected, show empty state
      this.entries = [];
      this.filteredEntries = [];
    }
  },
};
</script>

<style scoped>
/* reuse maintenance page styles */
.view-inspection-page {
  padding: 20px;
  min-height: 100vh;
}
.back-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s;
  background: black;
  color: white;
  border: 2px solid black;
  width: 180px;
  height: 44px;
}
.back-btn:hover {
  background: #333;
  border-color: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.request-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: black !important;
  color: white !important;
  border: 2px solid black !important;
  width: auto;
  min-width: 175px;
  height: 44px;
  white-space: nowrap;
  padding: 0 18px;
  font-size: 0.9rem;
}

.request-btn:hover {
  background-color: #333 !important;
  border-color: #333 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.agency-info-card-black {
  background: linear-gradient(135deg, #000, #1a1a1a);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0;
  position: relative;
}
.agency-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.agency-info-card-black {
  position: relative;
}
.agency-info-card-black::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.85) 45%,
    rgba(0, 0, 0, 0)
  );
  pointer-events: none;
}
.agency-info-card-black .no-gutters,
.agency-info-card-black .v-row {
  position: relative;
  z-index: 1;
}
/* Content aligned to the right dark area */
.agency-content-right {
  margin-left: auto;
  width: min(720px, 55%);
  padding: 16px 16px 24px;
  text-align: left;
}
.agency-logo-black {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.agency-details-black {
  margin-bottom: 16px;
}
.detail-item-black {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #fff;
}
.agency-description-black {
  color: #e0e0e0;
  line-height: 1.6;
  margin: 0;
}

.custom-input .v-field {
  border-radius: 8px;
}

.action-btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}
.action-btn {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
}
.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.document-btn {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
}
.document-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:deep(.custom-header .v-data-table-header) {
  background: #000;
  color: white;
}

/* Clean agency name-only hero with image (no overlay) */
.agency-hero-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 180px;
}
.agency-hero-bg {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.agency-hero-center {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  color: #fff;
  font-weight: 800;
  font-size: 1.6rem;
  text-align: center;
  letter-spacing: 0.3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .back-btn {
    width: 140px;
    height: 40px;
  }
  .request-btn {
    width: 100%;
    max-width: 100%;
    height: 40px;
    font-size: 0.875rem;
  }
  .action-btn {
    font-size: 0.7rem;
    padding: 6px 8px;
  }
  .agency-info-card-black {
    text-align: center;
  }
  .agency-logo-black {
    height: 220px;
  }
  .agency-content-right {
    width: 100%;
  }
}

/* Custom month menu styling */
.month-menu {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 12px;
  min-width: 260px;
}
.month-menu__title {
  font-weight: 600;
  margin-bottom: 8px;
}
.month-menu__input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
}
.month-menu__input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08);
}
.month-menu__actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
</style>
