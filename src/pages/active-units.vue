<template>
  <div class="view-agency-page">
    <v-container fluid>
      <!-- Filters and Add Unit Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search properties..."
            prepend-inner-icon="mdi-magnify"
            flat="true"
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterProperties"
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

      <!-- Property Type filter -->
      <v-col cols="12" md="2" lg="2" class="pa-4">
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
          @update:model-value="filterProperties"
        />
      </v-col>

      <!-- Flagged filter -->
      <v-col cols="12" md="2" lg="2" class="pa-4">
        <v-select
          v-model="flaggedFilter"
          :items="flaggedFilterOptions"
          item-title="title"
          item-value="value"
          label="Flagged"
          density="comfortable"
          variant="outlined"
          hide-details
          class="custom-input top-filter"
          @update:model-value="filterProperties"
        />
      </v-col>

        

        <!-- Add Unit Button - Only visible to Super Admin -->
        <v-col cols="12" md="2" lg="2" class="pa-4 d-flex align-center" v-if="isSuperAdmin">
          <v-btn
            icon="mdi-plus"
            variant="outlined"
            color="primary"
            @click="addUnit"
            class="back-btn"
          >
            Add Unit
          </v-btn>
        </v-col>
      </v-row>

      <!-- Agency Info Card (only when selected) -->
      <v-row class="mb-6" v-if="selectedAgencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
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
      

      <!-- Properties Table -->
      <v-row>
        <v-col cols="12" class="pa-4">
          <!-- Properties Table -->
          <v-data-table
            :headers="tableHeaders"
            :items="filteredProperties"
            :search="searchQuery"
            class="custom-header"
            density="comfortable"
            hover
            :loading="propertiesLoading"
            no-data-text="No data available"
          >
            <!-- Super Admin: Flagged indicator column (click to view flagged entry) -->
            <template v-slot:item.flag="{ item }" v-if="isSuperAdmin">
              <v-btn
                variant="text"
                size="small"
                :color="isUnitFlagged(item) ? 'error' : 'success'"
                :icon="true"
                :disabled="!isUnitFlagged(item)"
                :title="isUnitFlagged(item) ? 'View flagged unit' : 'Not flagged'"
                @click="gotoFlaggedUnit(item)"
              >
                <v-icon>
                  {{ isUnitFlagged(item) ? 'mdi-flag' : 'mdi-flag-outline' }}
                </v-icon>
              </v-btn>
            </template>
            <!-- Missed Rent (Yes + months) column -->
            <template v-slot:item.monthsMissed="{ item }">
              <v-chip
                :color="(item.monthsMissed || 0) > 0 ? 'error' : 'success'"
                size="small"
                variant="tonal"
                :title="(item.monthsMissed || 0) > 0 
                  ? `${item.monthsMissed} ${(item.monthsMissed === 1 ? 'month' : 'months')} missed` 
                  : 'No missed rent'"
              >
                {{ (item.monthsMissed || 0) > 0 
                  ? `Yes - ${item.monthsMissed} ${(item.monthsMissed === 1 ? 'month' : 'months')}` 
                  : 'No' }}
              </v-chip>
            </template>
            <template v-slot:item.propertyType="{ item }">
              <v-chip 
                :color="getColor(item.propertyType)" 
                size="small"
                variant="elevated"
              >
                {{ getLabel(item.propertyType) }}
              </v-chip>
            </template>
            <!-- Truncate long property names for alignment -->
            <template v-slot:item.propertyName="{ item }">
              <span class="truncate-cell" :title="item.propertyName">{{ item.propertyName }}</span>
            </template>
            <template v-slot:item.paidOut="{ item }">
              <v-chip :color="item.paidOut === 'Yes' ? 'success' : 'error'" size="small">
                {{ item.paidOut }}
              </v-chip>
            </template>
            <template v-slot:item.maintenanceAmount="{ item }">
              <span class="font-weight-medium">
                R{{ item.maintenanceAmount.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.paidTowardsFund="{ item }">
              <span class="font-weight-medium">
                R{{ item.paidTowardsFund.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.amountToBePaidOut="{ item }">
              <span class="font-weight-medium">
                R{{ item.amountToBePaidOut.toLocaleString() }}
              </span>
            </template>
            <template v-slot:item.actions="{ item }">
            <div class ="v-data-table_actions-cell">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="black"
                @click="viewProperty(item)"
                class="action-btn"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="black"
                @click="editProperty(item)"
                class="action-btn"
              />
              <v-btn
                :title="'Move to Vacancies'"
                icon="mdi-arrow-right-bold-box"
                size="small"
                variant="text"
                color="black"
                @click="moveToVacancies(item)"
                class="action-btn"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteProperty(item)"
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
import { collection, getDocs, query, where, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: "ActiveUnitsPage",
  setup() {
    const appStore = useAppStore()
    const { showConfirmDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getOptions, getLabel, getColor } = usePropertyType()
    return { appStore, showConfirmDialog, logAuditEvent, auditActions, resourceTypes, getOptions, getLabel, getColor }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: this.getCurrentMonth(),
      monthMenu: false,
      tempMonth: this.getCurrentMonth(),
      propertyTypeFilter: null,
      flaggedFilter: 'all',
      filteredProperties: [],
      selectedAgency: null,
      agencies: [],
      agenciesLoading: false,
      properties: [],
      propertiesLoading: false,
      // Maps for quick flagged lookup (store flagged docId for navigation)
      flaggedUnitMap: {}, // by unitId -> flaggedDocId
      flaggedUnitNamesMap: {}, // by unitName (lowercased) -> flaggedDocId
      headers: [
        { title: "TENANT REF", key: "tenantRef", sortable: true },
        { title: "PROPERTY NAME", key: "propertyName", sortable: true },
        { title: "PROPERTY TYPE", key: "propertyType", sortable: true, align: "center" },
        { title: "MISSED RENT", key: "monthsMissed", sortable: true, align: "center" },
        // {
        //   title: "LEASE STARTING DATE",
        //   key: "leaseStartDate",
        //   sortable: true,
        //   align: "center",
        // },
        // {
        //   title: "LEASE END DATE",
        //   key: "leaseEndDate",
        //   sortable: true,
        //   align: "center",
        // },

        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ],
    };
  },
  computed: {
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
    globalAgencyId() {
      const appStore = useAppStore();
      return appStore.currentAgency?.id || null;
    },
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.id === this.selectedAgency) || null;
    },
    activeUnitsCount() {
      // When an agency is selected or for agency users, properties array is scoped accordingly
      return Array.isArray(this.properties) ? this.properties.length : 0;
    },
    isAgencyUser() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Agency';
    },
    isSuperAdmin() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Super Admin';
    },
    // Build table headers dynamically to include Flag column for Super Admin
    tableHeaders() {
      const base = [...this.headers];
      if (this.isSuperAdmin) {
        // Insert the flagged column at the start
        return [
          { title: 'FLAGGED', key: 'flag', sortable: false, align: 'center' },
          ...base
        ];
      }
      return base;
    },
    propertyTypeFilterOptions() {
      return [
        { value: null, title: 'All Types' },
        ...this.getOptions()
      ];
    },
    flaggedFilterOptions() {
      return [
        { value: 'all', title: 'All' },
        { value: 'only', title: 'Only Flagged' }
      ];
    }
  },
  methods: {
    onMonthMenuToggle(open) {
      if (open) {
        this.tempMonth = this.monthFilter || ''
      }
    },
    applyMonth() {
      this.monthFilter = this.tempMonth || ''
      this.filterProperties()
      this.monthMenu = false
    },
    clearMonth() {
      this.tempMonth = ''
      this.monthFilter = ''
      this.filterProperties()
      this.monthMenu = false
    },
    openMonthPicker() {
      const el = this.$refs.monthInput?.$el?.querySelector('input');
      if (el) {
        if (typeof el.showPicker === 'function') el.showPicker();
        else el.focus();
      }
    },
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },
    filterProperties() {
      this.filteredProperties = this.properties.filter((property) => {
        const textMatch =
          property.tenantRef
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.propertyName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.newOccupation
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.contractorRequested
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          property.paidOut
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        // Property Type filter
        let propertyTypeMatch = true;
        if (this.propertyTypeFilter) {
          propertyTypeMatch = property.propertyType === this.propertyTypeFilter;
        }

        // Month filter - now filtering by createdAt date
        let monthMatch = true;
        if (this.monthFilter) {
          // Handle Firestore Timestamp objects
          let propertyDate;
          if (property.createdAt && property.createdAt.toDate) {
            // Firestore Timestamp object
            propertyDate = property.createdAt.toDate();
          } else if (property.createdAt) {
            // Regular Date object or date string
            propertyDate = new Date(property.createdAt);
          } else {
            // No createdAt date, skip this property
            return textMatch && propertyTypeMatch;
          }
          
          const filterDate = new Date(this.monthFilter + "-01");
          const propertyMonth = `${propertyDate.getFullYear()}-${String(
            propertyDate.getMonth() + 1
          ).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(
            filterDate.getMonth() + 1
          ).padStart(2, "0")}`;

          monthMatch = propertyMonth === filterMonth;
        }

        // Flagged filter
        let flaggedMatch = true;
        if (this.flaggedFilter === 'only') {
          flaggedMatch = this.isUnitFlagged(property);
        }

        return textMatch && propertyTypeMatch && monthMatch && flaggedMatch;
      });
    },
    isUnitFlagged(item) {
      // Prefer ID-based match; fallback to name-based
      if (item?.id && this.flaggedUnitMap[item.id]) return true;
      // Check boolean flag on unit, if present
      if (item?.isFlagged === true || item?.isFlagged === 'Yes') return true;
      const name = (item?.unitName || item?.propertyName || '').toLowerCase();
      if (name && this.flaggedUnitNamesMap[name]) return true;
      return false;
    },
    getFlaggedDocIdForUnit(item) {
      if (!item) return null;
      if (item.id && this.flaggedUnitMap[item.id]) return this.flaggedUnitMap[item.id];
      const name = (item.unitName || item.propertyName || '').toLowerCase();
      if (name && this.flaggedUnitNamesMap[name]) return this.flaggedUnitNamesMap[name];
      return null;
    },
    gotoFlaggedUnit(item) {
      const flaggedId = this.getFlaggedDocIdForUnit(item);
      if (!flaggedId) return;
      this.$router.push(`/view-flagged-unit-${flaggedId}`);
    },
    viewProperty(property) {
      console.log("Viewing property:", property);
      this.$router.push(`/view-property-${property.id}`);
    },
    editProperty(property) {
      console.log("Editing property:", property);
      this.$router.push(`/edit-property-${property.id}`);
    },
    async deleteProperty(item) {
      try {
        await this.showConfirmDialog({
          title: 'Delete Unit?',
          message: `Are you sure you want to delete ${item.propertyName || item.unitName || 'this unit'}? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
        
        // If user confirms, proceed: remove from active units only
        const unitRef = doc(db, 'units', item.id)
        
        // Log delete action
        await this.logAuditEvent(
          this.auditActions.DELETE,
          {
            unitId: item.id,
            unitName: item.propertyName || item.unitName,
            tenantRef: item.tenantRef,
            agencyId: item.agencyId
          },
          this.resourceTypes.UNIT,
          item.id
        )
        
        // Delete from original units collection
        await deleteDoc(unitRef)
        
        // Remove from local arrays
        this.properties = this.properties.filter(prop => prop.id !== item.id)
        this.filteredProperties = this.filteredProperties.filter(prop => prop.id !== item.id)
        
        // Show success message
        this.$nextTick(() => {
          console.log('Unit archived successfully')
        })
        
      } catch (error) {
        if (error.message !== 'User cancelled') {
          console.error('Error archiving unit:', error)
        }
      }
    },
    async moveToVacancies(item) {
      try {
        await this.showConfirmDialog({
          title: 'Move to Vacancies?',
          message: `Move ${item.propertyName || item.unitName || 'this unit'} to Vacancies and remove it from Active Units?`,
          confirmText: 'Move',
          cancelText: 'Cancel',
          color: '#000000'
        })

        // Create vacancy entry
        const vacancyData = {
          agencyId: item.agencyId || this.appStore.currentAgency?.id || '',
          unitId: item.id,
          unitName: item.propertyName || item.unitName || '',
          dateVacated: new Date().toISOString().slice(0, 10),
          newTenantFound: 'No',
          moveInDate: null,
          propertyManager: item.propertyManager || '',
          contactNumber: item.contactNumber || '',
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await addDoc(collection(db, 'vacancies'), vacancyData)

        // Log audit event
        await this.logAuditEvent(
          this.auditActions.UPDATE,
          {
            unitId: item.id,
            unitName: item.propertyName || item.unitName,
            agencyId: item.agencyId,
            transitionedToVacancy: true,
            vacancy: {
              dateVacated: vacancyData.dateVacated,
              newTenantFound: 'No'
            }
          },
          this.resourceTypes.UNIT,
          item.id
        )

        // Remove from active units
        await deleteDoc(doc(db, 'units', item.id))
        this.properties = this.properties.filter(prop => prop.id !== item.id)
        this.filteredProperties = this.filteredProperties.filter(prop => prop.id !== item.id)
      } catch (error) {
        if (error.message !== 'User cancelled') {
          console.error('Error moving unit to vacancies:', error)
        }
      }
    },
    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency') {
          // Agency users can only see their own agency
          const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (agencyDoc.exists()) {
            const agencyData = agencyDoc.data();
            this.agencies = [{
              id: agencyDoc.id,
              ...agencyData
            }];
            // Pre-select the agency for agency users
            this.selectedAgency = agencyDoc.id;
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

    async fetchProperties(agencyId = null) {
      this.propertiesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        let unitsQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see their own units
          unitsQuery = query(
            collection(db, 'units'),
            where('agencyId', '==', currentUser.uid)
          );
        } else if (agencyId) {
          // Super Admin/Admin users query units for specific agency
          unitsQuery = query(
            collection(db, 'units'),
            where('agencyId', '==', agencyId)
          );
        } else {
          // Super Admin/Admin users query all units when no agency selected
          unitsQuery = collection(db, 'units');
        }
        
        const querySnapshot = await getDocs(unitsQuery);
        this.properties = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            monthsMissed: (typeof data.monthsMissed === 'number' ? data.monthsMissed : 0)
          }
        });
        
        // If Super Admin, also refresh flagged units map for the same scope
        if (this.isSuperAdmin) {
          await this.fetchFlaggedUnits(agencyId);
        }

        // Apply initial filtering
        this.filterProperties();
        console.log('Properties fetched:', this.properties);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        this.propertiesLoading = false;
      }
    },

    async fetchFlaggedUnits(agencyId = null) {
      try {
        let flaggedQuery;
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;

        if (userType === 'Agency') {
          // Agencies don't need flags here; return early
          this.flaggedUnitMap = {};
          this.flaggedUnitNamesMap = {};
          return;
        }

        if (agencyId) {
          flaggedQuery = query(
            collection(db, 'flaggedUnits'),
            where('agencyId', '==', agencyId)
          );
        } else {
          flaggedQuery = collection(db, 'flaggedUnits');
        }

        const snapshot = await getDocs(flaggedQuery);
        const byId = {};
        const byName = {};
        snapshot.docs.forEach(d => {
          const data = d.data();
          const flaggedDocId = d.id;
          if (data?.unitId) byId[data.unitId] = flaggedDocId;
          const name = (data?.unitName || '').toLowerCase();
          if (name) byName[name] = flaggedDocId;
        });
        this.flaggedUnitMap = byId;
        this.flaggedUnitNamesMap = byName;
      } catch (error) {
        console.error('Error fetching flagged units map:', error);
        this.flaggedUnitMap = {};
        this.flaggedUnitNamesMap = {};
      }
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }
      
      if (agencyId) {
        // Fetch properties for selected agency
        this.fetchProperties(agencyId);
        if (this.isSuperAdmin) this.fetchFlaggedUnits(agencyId);
      } else {
        // Fetch all properties when no agency is selected
        this.fetchProperties();
        if (this.isSuperAdmin) this.fetchFlaggedUnits();
      }
    },
    
    addUnit() {
      console.log("Adding new unit");
      this.$router.push('/add-unit');
    },
  },
  watch: {
    // React to global agency scope changes
    globalAgencyId: {
      immediate: false,
      handler(newId, oldId) {
        if (newId !== oldId) {
          this.selectedAgency = newId || null;
          if (this.isAgencyUser) {
            this.fetchProperties();
          } else {
            this.fetchProperties(newId || undefined);
            if (this.isSuperAdmin) this.fetchFlaggedUnits(newId || undefined);
          }
        }
      }
    }
  },
  async mounted() {
    document.title = "Active Units - Depsure";
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch properties based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own units
      await this.fetchProperties();
    } else {
      // Super Admin/Admin users: if a global agency is selected, scope to it
      if (this.globalAgencyId) {
        this.selectedAgency = this.globalAgencyId;
        await this.fetchProperties(this.globalAgencyId);
        if (this.isSuperAdmin) await this.fetchFlaggedUnits(this.globalAgencyId);
      } else {
        // Otherwise load all
        await this.fetchProperties();
        if (this.isSuperAdmin) await this.fetchFlaggedUnits(this.selectedAgency);
      }
    }
  },
};
</script>

<style scoped>
.view-agency-page {
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

/* Table card styling - less curved */
.table-card {
  border-radius: 6px !important;
}

/* Kill all internal padding on the card shell; v-card-title / v-card-text have their own spacing */
.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0;
  position: relative;
}

/* Background image layer */
.agency-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Remove row/column gutters so the image sits flush with the top/edges */
.no-gutters {
  --v-gutter-x: 0;
  --v-gutter-y: 0;
  margin: 0 !important;
}

/* Make the image fill its column completely with no top padding */
.agency-logo-black {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Right-side details */
.agency-details-black {
  margin-bottom: 16px;
}

/* Dark right-to-left gradient overlay behind info */
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

/* Hero card styles */
.agency-hero-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 220px;
}
.agency-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.agency-hero-gradient { position:absolute; inset:0; background: linear-gradient(to left, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0)); }
.agency-hero-content {
  position: relative;
  z-index: 1;
  padding: 16px;
}
.agency-hero-title { font-size: 1.75rem; font-weight: 700; margin-bottom: 8px; }
.agency-hero-details .detail-item-black { color: #ffffff; }

/* Search field styling to match agency page */
.custom-input .v-field {
  border-radius: 8px;
}

.search-field {
  max-width: 300px;
}

/* Truncate long table cell values without breaking layout */
.truncate-cell {
  display: inline-block;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

/* Avoid month input truncation */
.month-input :deep(input) {
  min-width: 160px;
}

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

/* Action Button Styling */
.action-btn {
  margin: 0 4px;
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

/* Custom table header styling - black headers */
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-agency-page {
    padding: 10px;
  }
  
  .search-field {
    max-width: 100%;
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

  /* Full-bleed image on mobile as well */
  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px; /* give it a nice visible height when stacked */
    object-fit: cover;
  }
}
</style>
