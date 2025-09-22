<template>
  <div class="view-agency-page">
    <v-container fluid>
      
      <!-- Filters and Add Flagged Unit Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search Unit"
            prepend-inner-icon="mdi-magnify"
            flat="true"
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterUnits"
          />
        </v-col>

        <!-- Agency Select removed for header consistency -->

        <!-- Property Type Filter -->
        <v-col cols="12" md="2" lg="2" class="pa-4">
          <v-select
            v-model="propertyTypeFilter"
            :items="propertyTypeFilterOptions"
            item-title="title"
            item-value="value"
            label="Property Type"

            density="comfortable"
            variant="outlined"
            hide-details
            class="custom-input top-filter"
            @update:model-value="filterUnits"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="2" lg="3" class="pa-4">
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
                flat="true"
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
                @input="(e) => { tempMonth = e.target.value }"
                class="month-menu__input"
              />
              <div class="month-menu__actions">
                <v-btn color="black" variant="elevated" size="small" @click="applyMonth">Apply</v-btn>
                <v-btn color="grey" variant="text" size="small" @click="clearMonth">All</v-btn>
              </div>
            </div>
          </v-menu>
        </v-col>

        <!-- Add Flagged Unit Button - Only visible to Agency users -->
        <v-col cols="12" md="3" lg="3" class="pa-4 d-flex align-center" v-if="isAgencyUser">
          <v-btn @click="addFlaggedUnit" class="back-btn">
            Add Flagged Unit
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
      <!-- Agency Info Card (only when selected) -->
      <v-row class="mb-6" v-if="false && selectedAgencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <!-- Background image layer -->
            <div class="agency-card-bg" :style="agencyCardBgStyle"></div>
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12">
                <div class="agency-content-right">
                <v-card-title class="text-white text-h4 mb-2">
                  {{ selectedAgencyDetails.agencyName }}
                </v-card-title>
                <v-card-text class="text-white">
                  <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.address || 'Address not provided' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-card-account-details" class="mr-2 text-white" />
                      <span>Reg No: {{ selectedAgencyDetails.regNo || '—' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-account" class="mr-2 text-white" />
                      <span>Primary Contact: {{ selectedAgencyDetails.primaryContactName || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-phone" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.contactNumber || 'N/A' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-email" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.email || 'N/A' }}</span>
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
      

      <!-- Flagged Units Table -->
      <v-row>
        <v-col cols="12" class="pa-4">
          <v-data-table
            :headers="headers"
            :items="filteredUnits"
            :search="searchQuery"
            class="custom-header"
            density="comfortable"
            hover
            :loading="unitsLoading"
            no-data-text="No data available"
          >
            <template v-slot:item.missedPaymentFlag="{ item }">
              <v-chip :color="item.missedPaymentFlag === 'Yes' ? 'error' : 'success'" size="small">
                {{ item.missedPaymentFlag }}
              </v-chip>
            </template>
            <template v-slot:item.noticeToVacateGiven="{ item }">
              <span class="font-weight-medium">
                {{ item.noticeToVacateGiven ? `Yes - ${item.noticeToVacateGiven}` : 'No' }}
              </span>
            </template>
            <template v-slot:item.propertyType="{ item }">
              <v-chip
                :color="getPropertyTypeColor(item.propertyType)"
                size="small"
                variant="outlined"
              >
                {{ getPropertyTypeLabel(item.propertyType) }}
              </v-chip>
            </template>
            <!-- Centered Action Buttons -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewUnit(item)"
                  class="action-btn"
                />
                <v-btn
                  v-if="!isSuperAdmin"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editUnit(item)"
                  class="action-btn"
                />
                <v-btn

                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteUnit(item)"
                  class="action-btn"
                />
              </div>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { db } from '@/firebaseConfig'
import heroBg from '@/assets/title.png'
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAppStore } from '@/stores/app'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: "FlaggedUnitsPage",
  setup() {
    const { showConfirmDialog, showSuccessDialog, showErrorDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getLabel, getColor, getOptions, resolvePropertyTypeFromUnit } = usePropertyType()
    return { 
      showConfirmDialog,
      showSuccessDialog,
      showErrorDialog,
      logAuditEvent, 
      auditActions, 
      resourceTypes,
      getPropertyTypeLabel: getLabel,
      getPropertyTypeColor: getColor,
      resolvePropertyTypeFromUnit
    }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      monthMenu: false,
      tempMonth: this.getCurrentMonth(),
      selectedAgency: null,
      propertyTypeFilter: null,
      filteredUnits: [],
      agencies: [],
      agenciesLoading: false,
      units: [],
      unitsLoading: false,
      flaggedUnsubscribe: null,
      activeUnitsCount: 0,
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Missed Payment Flag", key: "missedPaymentFlag", sortable: true, align: "center" },
        { title: "Notice To Vacate Given", key: "noticeToVacateGiven", sortable: true, align: "center" },
        { title: "Property Type", key: "propertyType", sortable: true, align: "center" },
        { title: "Action Taken", key: "actionTaken", sortable: true },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ]
    };
  },
computed: {
    agencyHeroBgStyle() {
      return { background: `url(${heroBg}) center/cover no-repeat` }
    },
    heroTitle() {
      return this.selectedAgencyDetails?.agencyName || 'Flagged Units'
    },
    monthFilterLabel() {
      if (!this.monthFilter) return 'All Months'
      try {
        const [yy, mm] = String(this.monthFilter).split('-')
        const d = new Date(Number(yy), Number(mm) - 1, 1)
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      } catch {
        return this.monthFilter
      }
    },
    agencyCardBgStyle() {
      const url = this.selectedAgencyDetails?.profileImageUrl || this.selectedAgencyDetails?.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
      return {
        background: `url(${url}) center/cover no-repeat`
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
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
    },
    isSuperAdmin() {
      const appStore = useAppStore();
      const userType = appStore.currentUser?.userType;
      console.log('Flagged Units - User Type:', userType, 'Is Super Admin:', userType === 'Super Admin');
      return userType === 'Super Admin';
    },
    propertyTypeFilterOptions() {
      const { getOptions } = usePropertyType()
      return [
        { value: null, title: 'All Types' },
        ...getOptions()
      ]
    }
  },
  methods: {
    onMonthMenuToggle(open) {
      if (open) {
        this.tempMonth = this.monthFilter || ''
      }
    },
    openMonthMenu() {
      this.tempMonth = this.monthFilter || ''
      this.monthMenu = true
    },
    applyMonth() {
      this.monthFilter = this.tempMonth || ''
      this.filterUnits()
      this.monthMenu = false
    },
    clearMonth() {
      this.tempMonth = ''
      this.monthFilter = ''
      this.filterUnits()
      this.monthMenu = false
    },
    openMonthPicker() {
      const el = this.$refs.monthInput?.$el?.querySelector('input');
      if (el) {
        if (typeof el.showPicker === 'function') el.showPicker();
        else el.focus();
      }
    },
    async refreshActiveUnitsCount(agencyId = null) {
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        let unitsQuery;
        if (userType === 'Agency') {
          unitsQuery = query(collection(db, 'units'), where('agencyId', '==', currentUser.uid));
        } else if (agencyId) {
          unitsQuery = query(collection(db, 'units'), where('agencyId', '==', agencyId));
        } else {
          this.activeUnitsCount = 0;
          return;
        }
        const snap = await getDocs(unitsQuery);
        this.activeUnitsCount = snap.size;
      } catch (error) {
        console.error('Error counting active units:', error);
        this.activeUnitsCount = 0;
      }
    },
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },
    filterUnits() {
      this.filteredUnits = this.units.filter((unit) => {
        const textMatch = unit.unitName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          unit.tenantRef.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          unit.flagReason.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          unit.actionTaken.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          unit.notes.toLowerCase().includes(this.searchQuery.toLowerCase());

        let agencyMatch = true;
        let monthMatch = true;
        let propertyTypeMatch = true;

        if (this.selectedAgency) {
          agencyMatch = unit.agencyId === this.selectedAgency;
        }

        if (this.propertyTypeFilter) {
          propertyTypeMatch = unit.propertyType === this.propertyTypeFilter;
        }

        if (this.monthFilter) {
          // Handle Firestore Timestamp objects
          let unitDate;
          if (unit.createdAt && unit.createdAt.toDate) {
            // Firestore Timestamp object
            unitDate = unit.createdAt.toDate();
          } else if (unit.createdAt) {
            // Regular Date object or date string
            unitDate = new Date(unit.createdAt);
          } else {
            // No createdAt date, skip this unit
            return textMatch && agencyMatch && propertyTypeMatch;
          }
          
          const filterDate = new Date(this.monthFilter + "-01");
          const unitMonth = `${unitDate.getFullYear()}-${String(unitDate.getMonth() + 1).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, "0")}`;
          monthMatch = unitMonth === filterMonth;
        }

        return textMatch && agencyMatch && monthMatch && propertyTypeMatch;
      });
    },
    viewUnit(unit) {
      console.log("Viewing flagged unit:", unit);
      this.$router.push(`/view-flagged-unit-${unit.id}`);
    },
    editUnit(unit) {
      this.$router.push(`/edit-flagged-unit-${unit.id}`);
    },
    async deleteUnit(unit) {
      try {
        await this.showConfirmDialog({
          title: 'Delete unit?',
          message: `Are you sure you want to delete ${unit.unitName || 'this unit'}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
          await deleteDoc(doc(db, 'flaggedUnits', unit.id));
          
          // Log the audit event
          await this.logAuditEvent(
            this.auditActions.DELETE,
            {
              unitName: unit.unitName,
              agencyId: unit.agencyId,
              tenantRef: unit.tenantRef,
              flagReason: unit.flagReason,
              missedPaymentFlag: unit.missedPaymentFlag
            },
            this.resourceTypes.UNIT,
            unit.id
          )
          
          // Remove from local array
          const index = this.units.findIndex(u => u.id === unit.id);
          if (index > -1) {
            this.units.splice(index, 1);
            this.filterUnits();
            this.showSuccessDialog(`Flagged unit for ${unit.unitName} deleted successfully!`, 'Success!', 'Continue');
          }
        } catch (error) {
          console.error('Error deleting flagged unit:', error);
          this.showErrorDialog('Failed to delete flagged unit. Please try again.');
        }
    },
    addFlaggedUnit() {
      this.$router.push('/add-flagged-unit');
    },
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          // Agency users and Agency Admin users can only see their own agency
          let agencyData = null;
          
          if (userType === 'Agency') {
            // For Agency users, use their own document
            const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (agencyDoc.exists()) {
              agencyData = {
                id: agencyDoc.id,
                ...agencyDoc.data()
              };
            }
          } else if (userType === 'Admin' && currentUser.adminScope === 'agency') {
            // For Agency Admin users, fetch their managed agency
            if (currentUser.managedAgencyId) {
              const agencyDoc = await getDoc(doc(db, 'users', currentUser.managedAgencyId));
              if (agencyDoc.exists()) {
                agencyData = {
                  id: agencyDoc.id,
                  ...agencyDoc.data()
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
          console.log('Agency user - own agency loaded:', this.agencies);
        } else {
          // Super Admin and Admin users can see all agencies
          const agenciesQuery = query(
            collection(db, 'users'),
            where('userType', '==', 'Agency')
          );
          
          const querySnapshot = await getDocs(agenciesQuery);
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('All agencies fetched:', this.agencies);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        this.agenciesLoading = false;
      }
    },
    
    async fetchFlaggedUnits(agencyId = null) {
      // Clean up previous listener
      if (this.flaggedUnsubscribe) {
        try { this.flaggedUnsubscribe(); } catch(_) {}
        this.flaggedUnsubscribe = null;
      }
      this.unitsLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        let unitsQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see their own flagged units
          unitsQuery = query(
            collection(db, 'flaggedUnits'),
            where('agencyId', '==', currentUser.uid)
          );
        } else if (agencyId) {
          // Super Admin/Admin users query flagged units for specific agency
          unitsQuery = query(
            collection(db, 'flaggedUnits'),
            where('agencyId', '==', agencyId)
          );
        } else {
          // Super Admin/Admin users query all flagged units when no agency selected
          unitsQuery = collection(db, 'flaggedUnits');
        }
        
        // Live subscribe to flagged units
        this.flaggedUnsubscribe = onSnapshot(unitsQuery, async (querySnapshot) => {
          try {
            const unitsData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Resolve property types for each flagged unit (async)
            const enriched = await Promise.all(
              unitsData.map(async (unit) => {
                try {
                  if (unit.unitId) {
                    const propertyType = await this.resolvePropertyTypeFromUnit(unit.unitId);
                    return { ...unit, propertyType };
                  } else if (unit.unitName) {
                    const uq = query(collection(db, 'units'), where('unitName', '==', unit.unitName));
                    const uSnap = await getDocs(uq);
                    if (!uSnap.empty) {
                      const unitDoc = uSnap.docs[0];
                      const propertyType = await this.resolvePropertyTypeFromUnit(unitDoc.id);
                      return { ...unit, propertyType };
                    }
                  }
                  return { ...unit, propertyType: 'residential' };
                } catch (e) {
                  console.error(`Error resolving property type for unit ${unit.id}:`, e);
                  return { ...unit, propertyType: 'residential' };
                }
              })
            );
            this.units = enriched;
            this.filterUnits();
          } finally {
            this.unitsLoading = false;
          }
        });
        console.log('Subscribed to flagged units');
      } catch (error) {
        console.error('Error fetching flagged units:', error);
        this.unitsLoading = false;
      } finally {
        // Listener controls loading state on first snapshot
      }
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }
      
      if (agencyId) {
        // Fetch flagged units for selected agency
        this.fetchFlaggedUnits(agencyId);
        this.refreshActiveUnitsCount(agencyId);
      } else {
        // Fetch all flagged units when no agency is selected
        this.fetchFlaggedUnits();
        this.refreshActiveUnitsCount();
      }
    }
  },
  async mounted() {
    document.title = "Flagged Units - Depsure";
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch flagged units based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own flagged units
      await this.fetchFlaggedUnits();
      await this.refreshActiveUnitsCount();
    } else {
      const appStore = useAppStore();
      const globalId = appStore.currentAgency?.id || null;
      if (globalId) {
        this.selectedAgency = globalId;
        await this.fetchFlaggedUnits(globalId);
        await this.refreshActiveUnitsCount(globalId);
      } else {
        // Super Admin/Admin users get all flagged units initially
        await this.fetchFlaggedUnits();
        if (this.selectedAgency) await this.refreshActiveUnitsCount(this.selectedAgency);
      }
    }
  }
  ,
  unmounted() {
    if (this.flaggedUnsubscribe) {
      try { this.flaggedUnsubscribe(); } catch(_) {}
      this.flaggedUnsubscribe = null;
    }
  }
};
</script>

<style scoped>
/* Reuse styles from previous pages */

.view-agency-page {
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

.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0;
  position: relative;
  min-height: 220px;
}

/* New absolute background layer so image always shows */
.agency-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.no-gutters {
  --v-gutter-x: 0;
  --v-gutter-y: 0;
  margin: 0 !important;
}

.agency-logo-black {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agency-details-black {
  margin-bottom: 16px;
}

/* Dark right-to-left gradient overlay so info sits on dark side */
.agency-info-card-black::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to left, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.0) 100%);
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

.detail-item-black {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #ffffff;
}

.agency-description-black {
  font-size: 1rem;
  line-height: 1.6;
  color: #e0e0e0;
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
  height: 100%;
}

.action-btn {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:deep(.custom-header .v-data-table-header) {
  background-color: #000000 !important;
}

:deep(.custom-header .v-data-table-header th) {
  background-color: #000000 !important;
  color: white !important;
}

:deep(.custom-header .v-data-table-header .v-data-table-header__content) {
  color: white !important;
}

/* Month input UX tweaks */
.month-input { min-width: 220px; }
:deep(.month-input .v-field-label) { white-space: nowrap; }

/* Clean agency name-only hero with image (no overlay) */
.agency-hero-card { position: relative; border-radius: 12px; overflow: hidden; min-height: 180px; }
.agency-hero-bg { position: absolute; inset: 0; background-position: center; background-size: cover; background-repeat: no-repeat; }
.agency-hero-center { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center; padding: 0 16px; color: #fff; font-weight: 800; font-size: 1.6rem; text-align: center; letter-spacing: 0.3px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }

/* Custom month menu styling */
.month-menu {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
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
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.08);
}
.month-menu__actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .view-agency-page {
    padding: 10px;
  }

  .back-btn {
    width: 140px;
    height: 40px;
  }

  .action-btn {
    font-size: 0.7rem;
    padding: 6px 8px;
  }

  .agency-info-card-black {
    text-align: center;
  }

  .agency-content-right {
    width: 100%;
  }

  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px;
    object-fit: cover;
  }
}
</style>

