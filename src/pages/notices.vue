<template>
  <div class="view-agency-page">
    <v-container fluid>
      <!-- Filters and Add Notice Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search notices..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterProperties"
          />
        </v-col>

        <!-- Agency Select removed for consistency across pages -->

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
              <input type="month" :value="tempMonth" @input="(e)=>{ tempMonth = e.target.value }" class="month-menu__input" />
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

        <!-- Add Notice Button - Only visible to Agency users -->
        <v-col cols="12" md="2" lg="2" class="pa-4 d-flex align-center" v-if="false && isAgencyUser">
          <v-btn @click="addNotice" class="back-btn">
            Add Notice
          </v-btn>
        </v-col>
      </v-row>

      <!-- Clean Agency Header (static image, centered title) -->
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
                      <span>Reg No: {{ selectedAgencyDetails.regNo || 'â€”' }}</span>
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

      <!-- Notices Table -->
      <v-row>
        <v-col cols="12" class="pa-4">
          <!-- Notices Table -->
          <v-data-table
            :headers="headers"
            :items="filteredProperties"
            :search="searchQuery"
            class="custom-header"
            density="comfortable"
            hover
            :loading="propertiesLoading"
            no-data-text="No data available"
          >
            <template v-slot:item.propertyType="{ item }">
              <v-chip 
                :color="getColor(item.propertyType)" 
                size="small"
                variant="elevated"
              >
                {{ getLabel(item.propertyType) }}
              </v-chip>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip 
                :color="item.status === 'Active' ? 'success' : item.status === 'Completed' ? 'grey' : 'warning'" 
                size="small"
                variant="elevated"
              >
                {{ item.status || 'Active' }}
              </v-chip>
            </template>
            <template v-slot:item.monthsMissedRent="{ item }">
              <span>{{ item.monthsMissedRent || 0 }}</span>
            </template>

            <!-- Centered Action Buttons -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewProperty(item)"
                  class="action-btn"
                  title="View"
                />
                <v-btn
                  v-if="isAgencyUser || userType === 'Admin'"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editProperty(item)"
                  class="action-btn"
                  title="Edit"
                />
                <!-- Admin: Move to Vacancies -->
                <v-btn
                  v-if="!isAgencyUser"
                  icon="mdi-arrow-right-bold-box"
                  size="small"
                  variant="text"
                  color="black"
                  @click="moveToVacancies(item)"
                  class="action-btn"
                  title="Move to Vacancies"
                />
                <!-- Delete Notice -->
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteProperty(item)"
                  class="action-btn"
                  title="Delete Notice"
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
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { db } from '@/firebaseConfig'
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { usePropertyType } from '@/composables/usePropertyType'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { useNoticeVacancyAutomation } from '@/composables/useNoticeVacancyAutomation'
const heroBg = 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'

export default {
  name: "NoticePage",
  setup() {
    const { showSuccessDialog, showErrorDialog, showConfirmDialog } = useCustomDialogs()
    const { getOptions, getLabel, getColor, resolvePropertyTypeFromUnit } = usePropertyType()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { runAutomation } = useNoticeVacancyAutomation()
    return { showSuccessDialog, showErrorDialog, showConfirmDialog, getOptions, getLabel, getColor, resolvePropertyTypeFromUnit, logAuditEvent, auditActions, resourceTypes, runAutomation }
  },
  data() {
    return {
      searchQuery: "",
      monthFilter: '',
      monthMenu: false,
      tempMonth: '',
      propertyTypeFilter: null,
      filteredProperties: [],
      selectedAgency: null,
      agencies: [],
      agenciesLoading: false,
      properties: [],
      propertiesLoading: false,
      activeUnitsCount: 0,
      headers: [
        { title: "UNIT NAME", key: "unitName", sortable: true },
        { title: "PROPERTY TYPE", key: "propertyType", sortable: true, align: "center" },
        { title: "STATUS", key: "status", sortable: true, align: "center" },
        { title: "NOTICE GIVEN", key: "noticeGivenDate", sortable: true, align: "center" },
        { title: "LEASE END DATE", key: "leaseEndDate", sortable: true, align: "center" },
        { title: "MONTH'S MISSED RENT", key: "monthsMissedRent", sortable: true, align: "center" },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ],
    };
  },
  computed: {
    agencyHeroBgStyle() {
      return { background: `url(${heroBg}) center/cover no-repeat` }
    },
    heroTitle() {
      return 'Notices'
    },
    agencyCardBgStyle() {
      const url = this.selectedAgencyDetails?.profileImageUrl || this.selectedAgencyDetails?.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
      return {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    monthFilterLabel() {
      if (!this.monthFilter) return 'All Months'
      try {
        const [yy, mm] = String(this.monthFilter).split('-')
        const d = new Date(Number(yy), Number(mm) - 1, 1)
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      } catch { return this.monthFilter }
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
      console.log('Notices - User Type:', userType, 'Is Super Admin:', userType === 'Super Admin');
      return userType === 'Super Admin';
    },
    userType() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType;
    },
    propertyTypeFilterOptions() {
      return [
        { value: null, title: 'All Types' },
        ...this.getOptions()
      ];
    }
  },
  methods: {
    onMonthMenuToggle(open) {
      if (open) this.tempMonth = this.monthFilter || ''
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
    filterProperties() {
      this.filteredProperties = this.properties.filter((property) => {
        const textMatch =
          property.unitName.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        // Property Type filter
        let propertyTypeMatch = true;
        if (this.propertyTypeFilter) {
          propertyTypeMatch = property.propertyType === this.propertyTypeFilter;
        }
        
        // Month filter - use noticeGivenDate first, then vacateDate, then createdAt
        let monthMatch = true;
        if (this.monthFilter) {
          let propertyDate = null;
          const candidate = property.noticeGivenDate || property.vacateDate || property.createdAt;
          if (candidate && candidate.toDate) {
            propertyDate = candidate.toDate();
          } else if (candidate) {
            propertyDate = new Date(candidate);
          }
          if (!propertyDate || isNaN(propertyDate.getTime())) {
            return textMatch && propertyTypeMatch; // no comparable date, ignore month filter for this row
          }
          const filterDate = new Date(this.monthFilter + "-01");
          const propertyMonth = `${propertyDate.getFullYear()}-${String(propertyDate.getMonth() + 1).padStart(2, "0")}`;
          const filterMonth = `${filterDate.getFullYear()}-${String(filterDate.getMonth() + 1).padStart(2, "0")}`;
          monthMatch = propertyMonth === filterMonth;
        }
        return textMatch && propertyTypeMatch && monthMatch;
      });
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
          console.log('Fetching agencies...');
          const agenciesQuery = query(collection(db, 'users'), where('userType', '==', 'Agency'));
          const agenciesSnapshot = await getDocs(agenciesQuery);
          
          this.agencies = agenciesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('All agencies loaded:', this.agencies);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        this.agenciesLoading = false;
      }
    },
    
    async fetchNotices(agencyId = null) {
      this.propertiesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        console.log('Fetching notices...');
        let noticesQuery;
        
        if (userType === 'Agency') {
          // Agency users can only see their own notices
          noticesQuery = query(collection(db, 'notices'), where('agencyId', '==', currentUser.uid));
        } else if (agencyId) {
          // Super Admin/Admin users query notices for specific agency
          noticesQuery = query(collection(db, 'notices'), where('agencyId', '==', agencyId));
        } else {
          // Super Admin/Admin users query all notices when no agency selected
          noticesQuery = collection(db, 'notices');
        }
        
        const noticesSnapshot = await getDocs(noticesQuery);
        
        // First, get all notices
        const notices = noticesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Resolve property types for each notice
        const noticesWithPropertyTypes = await Promise.all(
          notices.map(async (notice) => {
            try {
              // Try to resolve property type from unitId if available
              if (notice.unitId) {
                const propertyType = await this.resolvePropertyTypeFromUnit(notice.unitId);
                return { ...notice, propertyType };
              }
              // If no unitId, try to resolve from unitName by finding the unit
              else if (notice.unitName) {
                // Find the unit by name in the units collection
                const unitsQuery = query(
                  collection(db, 'units'),
                  where('propertyName', '==', notice.unitName)
                );
                const unitsSnapshot = await getDocs(unitsQuery);
                if (!unitsSnapshot.empty) {
                  const unitDoc = unitsSnapshot.docs[0];
                  const unitData = unitDoc.data();
                  return { ...notice, propertyType: unitData.propertyType || 'residential' };
                }
              }
              // Default to residential if we can't resolve
              return { ...notice, propertyType: 'residential' };
            } catch (error) {
              console.error('Error resolving property type for notice:', notice.id, error);
              return { ...notice, propertyType: 'residential' };
            }
          })
        );
        
        // Only show active notices in the list; hide completed/archived
        this.properties = noticesWithPropertyTypes.filter(n => (n.status || 'Active') === 'Active');
        console.log('Notices loaded with property types:', this.properties);
        console.log('Number of notices found:', this.properties.length);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
        
        // Log the first notice structure if available
        if (this.properties.length > 0) {
          console.log('First notice structure:', this.properties[0]);
        }
        
        // Apply filters after loading
        this.filterProperties();
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        this.propertiesLoading = false;
      }
    },
    
    onAgencyChange(agencyId) {
      console.log('Agency changed to:', agencyId);
      if (this.isAgencyUser) {
        // Agency users can't change agency selection
        return;
      }
      
      this.fetchNotices(agencyId);
      this.refreshActiveUnitsCount(agencyId);
    },
    
    viewProperty(property) { this.$router.push(`/view-notice-${property.id}`); },
    editProperty(property) { this.$router.push(`/edit-notice-${property.id}`); },
    
    async moveToVacancies(notice) {
      const normalizeString = (value) => {
        if (typeof value !== 'string') return '';
        return value.replace(/\s+/g, ' ').trim();
      };
      const normalizeForMatch = (value) => normalizeString(value).toLowerCase();

      const rawUnitName = notice?.unitName ?? '';
      const normalizedUnitName = normalizeString(rawUnitName);
      const rawPropertyName = notice?.propertyName ?? '';
      const normalizedPropertyName = normalizeString(rawPropertyName);
      const displayUnitName = normalizedUnitName || normalizedPropertyName || rawUnitName || rawPropertyName || 'this unit';

      try {
        await this.showConfirmDialog({
          title: 'Process Notice?',
          message: `Move unit "${displayUnitName}" to Vacancies and delete this notice?`,
          confirmText: 'Process',
          cancelText: 'Cancel',
          color: '#000000'
        })
      } catch (_) {
        return
      }
      
      try {
        const nameCandidates = Array.from(
          new Set(
            [rawUnitName, normalizedUnitName, rawPropertyName, normalizedPropertyName]
              .map((value) => (typeof value === 'string' ? value.trim() : value))
              .filter(Boolean)
          )
        );
        const normalizedCandidateSet = new Set(
          [rawUnitName, normalizedUnitName, rawPropertyName, normalizedPropertyName]
            .map(normalizeForMatch)
            .filter(Boolean)
        );

        const tryFindUnitByField = async (field, value) => {
          const snapshot = await getDocs(
            query(collection(db, 'units'), where(field, '==', value))
          );
          return snapshot.empty ? null : snapshot.docs[0];
        };

        let unitDoc = null;

        if (notice.unitId) {
          const unitSnapshot = await getDoc(doc(db, 'units', notice.unitId));
          if (unitSnapshot.exists()) {
            unitDoc = unitSnapshot;
          }
        }

        if (!unitDoc) {
          const noticeTaggedSnapshot = await getDocs(
            query(collection(db, 'units'), where('noticeId', '==', notice.id))
          );
          unitDoc = noticeTaggedSnapshot.empty ? null : noticeTaggedSnapshot.docs[0];
        }

        if (!unitDoc) {
          for (const candidate of nameCandidates) {
            unitDoc = await tryFindUnitByField('unitName', candidate);
            if (unitDoc) break;
            unitDoc = await tryFindUnitByField('propertyName', candidate);
            if (unitDoc) break;
          }
        }

        if (!unitDoc) {
          const unitQueryConstraints = [];
          if (notice.agencyId) {
            unitQueryConstraints.push(where('agencyId', '==', notice.agencyId));
          }
          const fallbackSnapshot = await getDocs(
            unitQueryConstraints.length
              ? query(collection(db, 'units'), ...unitQueryConstraints)
              : collection(db, 'units')
          );

          const normalizedCandidateList = Array.from(normalizedCandidateSet);
          unitDoc = fallbackSnapshot.docs.find((docSnap) => {
            const data = docSnap.data() || {};
            const candidates = [
              normalizeForMatch(data.unitName),
              normalizeForMatch(data.propertyName),
              normalizeForMatch(data.propertyFullName),
              normalizeForMatch(data.property?.name),
              normalizeForMatch(data.property?.fullName),
              normalizeForMatch(data.unitCode),
              normalizeForMatch(data.unitNumber),
              normalizeForMatch(data.address),
              normalizeForMatch(data.addressLine1),
              normalizeForMatch(data.addressLine2)
            ].filter(Boolean);
            if (!candidates.length) return false;
            return candidates.some((candidateValue) =>
              normalizedCandidateList.some((searchValue) => {
                if (!searchValue) return false;
                return (
                  candidateValue === searchValue ||
                  candidateValue.includes(searchValue) ||
                  searchValue.includes(candidateValue)
                );
              })
            );
          }) || null;
        }

        if (!unitDoc) {
          // Check if unit is already archived (if we have a unitId)
          let archivedSnapshot = { empty: true };
          if (notice.unitId) {
            const archivedUnitsQuery = query(
              collection(db, 'archivedUnits'),
              where('originalId', '==', notice.unitId)
            );
            archivedSnapshot = await getDocs(archivedUnitsQuery);
          }
          
          if (!archivedSnapshot.empty) {
            // Unit was already archived, just delete the notice
            this.showErrorDialog(
              'Unit has already been archived. The notice will be deleted.',
              'Unit Already Archived',
              'OK'
            );
            await deleteDoc(doc(db, 'notices', notice.id));
            const index = this.properties.findIndex(p => p.id === notice.id);
            if (index > -1) {
              this.properties.splice(index, 1);
              this.filterProperties();
            }
            return;
          }
          
          // Unit not found anywhere - offer to delete the notice
          try {
            await this.showConfirmDialog({
              title: 'Unit Not Found',
              message: `Unit "${displayUnitName}" not found in Active Units. It may have been deleted or moved. Would you like to delete this notice?`,
              confirmText: 'Delete Notice',
              cancelText: 'Cancel',
              color: '#dc3545'
            });
            
            // User confirmed deletion
            await deleteDoc(doc(db, 'notices', notice.id));
            const index = this.properties.findIndex(p => p.id === notice.id);
            if (index > -1) {
              this.properties.splice(index, 1);
              this.filterProperties();
            }
            this.showSuccessDialog('Notice deleted successfully.', 'Success!', 'Continue');
          } catch (_) {
            // User cancelled
            return;
          }
          return;
        }

        const unitData = unitDoc.data();
        const vacancyChecks = [];

        vacancyChecks.push({ field: 'unitId', value: unitDoc.id });
        vacancyChecks.push({ field: 'noticeId', value: notice.id });
        for (const candidate of nameCandidates) {
          vacancyChecks.push({ field: 'unitName', value: candidate });
        }

        const vacancyCollectionRef = collection(db, 'vacancies');
        for (const { field, value } of vacancyChecks) {
          if (!value) continue;
          const snapshot = await getDocs(query(vacancyCollectionRef, where(field, '==', value)));
          if (!snapshot.empty) {
            this.showErrorDialog('A vacancy already exists for this unit.', 'Already Exists', 'OK');
            return;
          }
        }
        
        const vacancyUnitName =
          (typeof unitData.unitName === 'string' && unitData.unitName.trim()) ||
          normalizedUnitName ||
          normalizedPropertyName ||
          rawUnitName ||
          rawPropertyName ||
          displayUnitName;
        
        // Create vacancy entry
        const normalizeDateValue = (value) => {
          if (!value) return '';
          if (typeof value === 'string') return value;
          if (value instanceof Date) return value.toISOString().slice(0, 10);
          if (value?.toDate) {
            try {
              return value.toDate().toISOString().slice(0, 10);
            } catch {
              return '';
            }
          }
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
        };
        const normalizeCurrency = (value) => {
          if (value === null || value === undefined || value === '') return 0;
          const num = typeof value === 'number' ? value : Number(value);
          return Number.isFinite(num) ? num : 0;
        };
        const normalizePaidOut = (value) => {
          if (value === true || value === 'Yes' || value === 'yes') return 'Yes';
          if (value === false || value === 'No' || value === 'no') return 'No';
          return value || '';
        };

        const vacancyData = {
          // Keep all unit information
          agencyId: notice.agencyId || unitData.agencyId || '',
          unitId: unitDoc.id,
          unitName: vacancyUnitName,
          unitNumber: unitData.unitNumber || '',
          tenantRef: unitData.tenantRef || '',
          propertyType: unitData.propertyType || 'residential',
          propertyManager: unitData.propertyManager || '',
          contactNumber: unitData.contactNumber || '',
          newOccupation: unitData.newOccupation || '',
          contractorRequested: unitData.contractorRequested || '',
          maintenanceAmount: unitData.maintenanceAmount || 0,
          monthsMissed: unitData.monthsMissed || 0,
          
          // Vacancy specific dates
          dateVacated: notice.vacateDate || new Date().toISOString().slice(0, 10),
          leaseStartDate: normalizeDateValue(notice.leaseStartDate || unitData.leaseStartDate),
          moveInDate: null,
          
          // Fields that should be EMPTY initially (as per user request)
          leaseEndDate: '', // Empty - for new tenant
          paidTowardsFund: 0, // Empty
          amountToBePaidOut: 0, // Empty
          newTenantRef: '', // Empty - for new tenant
          notes: '', // Empty
          paidOut: '', // Empty
          
          // System fields
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await addDoc(collection(db, 'vacancies'), vacancyData);
        
        // Update unit status (keep it in active units, don't archive)
        const appStore = useAppStore();
        await updateDoc(doc(db, 'units', unitDoc.id), {
          status: 'Vacancy Created',
          vacancyCreatedAt: new Date(),
          noticeId: null, // Clear the notice reference
          updatedAt: new Date()
        });
        
        // Log audit event
        await this.logAuditEvent(
          this.auditActions.UPDATE,
          {
            noticeId: notice.id,
            unitId: unitDoc.id,
            unitName: vacancyUnitName,
            movedToVacancies: true,
            vacateDate: notice.vacateDate
          },
          this.resourceTypes.UNIT,
          unitDoc.id
        );
        
        // Delete the notice
        await deleteDoc(doc(db, 'notices', notice.id));
        const index = this.properties.findIndex(p => p.id === notice.id);
        if (index > -1) {
          this.properties.splice(index, 1);
          this.filterProperties();
        }
        
        this.showSuccessDialog(`Vacancy created for unit "${displayUnitName}". Notice has been deleted. Unit remains in active units.`, 'Success!', 'Continue');
      } catch (error) {
        console.error('Error processing notice:', error);
        this.showErrorDialog(`Failed to process notice: ${error.message}`, 'Error', 'OK');
      }
    },
    
    async deleteProperty(property) {
      try {
        await this.showConfirmDialog({
          title: 'Delete notice?',
          message: `Are you sure you want to delete notice for ${property.unitName}?`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          color: '#dc3545'
        })
      } catch (_) {
        return
      }
      try {
        console.log('Deleting notice:', property.id);
        await deleteDoc(doc(db, 'notices', property.id));
        const index = this.properties.findIndex((p) => p.id === property.id);
        if (index > -1) {
          this.properties.splice(index, 1);
          this.filterProperties();
        }
        this.showSuccessDialog(`Notice for ${property.unitName} deleted successfully!`, 'Success!', 'Continue');
      } catch (error) {
        console.error('Error deleting notice:', error);
        this.showErrorDialog(`Failed to delete notice: ${error.message}`, 'Error', 'OK');
      }
    },
    addNotice() { this.$router.push('/add-notice'); },
  },
  async mounted() {
    document.title = "Notice Page - Depsure";
    
    // Run automation to check for expired notices (only for non-agency users)
    if (!this.isAgencyUser) {
      try {
        console.log('Running automation to check for expired notices...')
        await this.runAutomation()
      } catch (error) {
        console.error('Automation failed:', error)
      }
    }
    
    // Fetch agencies first
    await this.fetchAgencies();
    
    // Fetch notices based on user role and selected agency
    if (this.isAgencyUser) {
      // Agency users will automatically get their own notices
      await this.fetchNotices();
      await this.refreshActiveUnitsCount();
    } else {
      const appStore = useAppStore();
      const globalId = appStore.currentAgency?.id || null;
      if (globalId) {
        this.selectedAgency = globalId;
        await this.fetchNotices(globalId);
        await this.refreshActiveUnitsCount(globalId);
      } else {
        // Super Admin/Admin users get all notices initially
        await this.fetchNotices();
        if (this.selectedAgency) await this.refreshActiveUnitsCount(this.selectedAgency);
      }
    }
  },
};
</script>

<style scoped>
.view-agency-page { padding: 20px; min-height: 100vh; }

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
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.agency-info-card-black {
  background: linear-gradient(135deg,#000000 0%,#1a1a1a 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  color: white;
  padding: 0;
  min-height: 220px;
  position: relative;
}
.agency-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.agency-info-card-black { position: relative; }
.agency-info-card-black::after { content:''; position:absolute; inset:0; background:linear-gradient(to left, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0)); pointer-events:none; }
.agency-info-card-black .no-gutters, .agency-info-card-black .v-row { position:relative; z-index:1; }
/* Content aligned to the right dark area */
.agency-content-right { margin-left:auto; width:min(720px,55%); padding:16px 16px 24px; text-align:left; }

.no-gutters { --v-gutter-x:0; --v-gutter-y:0; margin:0 !important; }
.agency-logo-black { display:block; width:100%; height:100%; object-fit:cover; }
.agency-details-black { margin-bottom:16px; }
.detail-item-black { display:flex; align-items:center; margin-bottom:12px; font-size:1rem; color:#fff; }
.agency-description-black { font-size:1rem; line-height:1.6; color:#e0e0e0; margin:0; }

.custom-input .v-field { border-radius:8px; }

.action-btn-container { display:flex; justify-content:center; align-items:center; gap:4px; height:100%; }
.action-btn { margin:0; font-size:0.75rem; font-weight:500; text-transform:none; border-radius:6px; transition:all 0.3s ease; }
.action-btn:hover { transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.2); }

/* Clean agency name-only header */
.agency-name-card { border-radius: 10px; border: 1px solid #e9e9e9; background: #fff; }
.agency-name-text { text-align: center; font-weight: 700; font-size: 1.25rem; padding: 12px 16px; color: #111; }

/* Static hero with image, centered title (no overlay) */
.agency-hero-card { position: relative; border-radius: 12px; overflow: hidden; min-height: 180px; }
.agency-hero-bg { position: absolute; inset: 0; background-position: center; background-size: cover; background-repeat: no-repeat; }
.agency-hero-center { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center; padding: 0 16px; color: #fff; font-weight: 800; font-size: 1.6rem; text-align: center; letter-spacing: 0.3px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }

:deep(.custom-header .v-data-table-header) { background-color:#000 !important; }
:deep(.custom-header .v-data-table-header th) { background-color:#000 !important; color:white !important; }
:deep(.custom-header .v-data-table-header .v-data-table-header__content) { color:white !important; }

/* Ensure month input label isn't truncated and calendar is usable */
.month-input { min-width: 220px; }
:deep(.month-input .v-field-label) { white-space: nowrap; }

/* Custom month menu styling */
.month-menu { background:#fff; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.15); padding:12px; min-width:260px; }
.month-menu__title { font-weight:600; margin-bottom:8px; }
.month-menu__input { width:100%; padding:8px 10px; border:1px solid #d0d0d0; border-radius:8px; }
.month-menu__input:focus { outline:none; border-color:#000; box-shadow:0 0 0 2px rgba(0,0,0,0.08); }
.month-menu__actions { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }

@media (max-width:768px){
  .view-agency-page { padding:10px; }
  .back-btn { width:140px; height:40px; }
  .action-btn { font-size:0.7rem; padding:6px 8px; }
  .agency-info-card-black { text-align:center; }
  .agency-logo-black { margin:0; width:100%; height:220px; object-fit:cover; }
  .agency-content-right { width:100%; }
}
</style>
