<template>
  <div class="view-agency-page">
    <v-container fluid>
      
      <!-- Filters and Add Flagged Unit Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="2" class="pa-4">
          <v-text-field
            v-model="searchQuery"
            label="Search flagged units..."
            prepend-inner-icon="mdi-magnify"
            flat="true"
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input"
            @input="filterUnits"
          />
        </v-col>

        <!-- Agency Select -->
        <v-col v-if="!isAgencyUser" cols="12" md="2" lg="2" class="pa-4">
          <v-select
            v-model="selectedAgency"
            :items="agencies"
            item-title="agencyName"
            item-value="id"
            label="Select Agency"
            prepend-inner-icon="mdi-domain"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
            :loading="agenciesLoading"
            class="custom-input"
            @update:model-value="onAgencyChange"
          />
        </v-col>

        <!-- Property Type Filter -->
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
            clearable
            class="custom-input"
            @update:model-value="filterUnits"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="2" lg="2" class="pa-4">
          <v-text-field
            v-model="monthFilter"
            label="Filter by month"
            prepend-inner-icon="mdi-calendar"
            flat="true"
            density="comfortable"
            variant="outlined"
            type="month"
            hide-details
            dense
            class="custom-input"
            @input="filterUnits"
          />
        </v-col>

        <!-- Add Flagged Unit Button - Only visible to Agency users -->
        <v-col cols="12" md="3" lg="3" class="pa-4 d-flex align-center" v-if="isAgencyUser">
          <v-btn @click="addFlaggedUnit" class="back-btn">
            Add Flagged Unit
          </v-btn>
        </v-col>
      </v-row>

      <!-- Agency Info Card (only when selected) -->
      <v-row class="mb-6" v-if="selectedAgencyDetails">
        <v-col cols="12">
          <v-card class="agency-info-card-black">
            <v-row align="stretch" class="no-gutters">
              <v-col cols="12" md="3" class="pa-0 ma-0">
                <v-img
                  :src="selectedAgencyDetails.profileImageUrl || selectedAgencyDetails.profileImage || 'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'"
                  :alt="selectedAgencyDetails.agencyName"
                  height="100%"
                  cover
                  class="agency-logo-black"
                />
              </v-col>
              <v-col cols="12" md="9">
                <v-card-title class="text-white text-h4 mb-2">
                  {{ selectedAgencyDetails.agencyName }}
                </v-card-title>
                <v-card-text class="text-white">
                  <div class="agency-details-black">
                    <div class="detail-item-black">
                      <v-icon icon="mdi-map-marker" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.location || 'Location not specified' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-calendar" class="mr-2 text-white" />
                      <span>Established: {{ selectedAgencyDetails.establishedYear || 'Year not specified' }}</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-home" class="mr-2 text-white" />
                      <span>{{ selectedAgencyDetails.numberOfProperties || 0 }} Properties</span>
                    </div>
                    <div class="detail-item-black">
                      <v-icon icon="mdi-star" class="mr-2 text-white" />
                      <span>Rating: {{ selectedAgencyDetails.rating || 'Not rated' }}</span>
                    </div>
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <p class="agency-description-black">
                    {{ selectedAgencyDetails.agencyDescription || selectedAgencyDetails.agencyTagline || 'No description available' }}
                  </p>
                </v-card-text>
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
              <span class="font-weight-medium">{{ item.noticeToVacateGiven }}</span>
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
                  v-if="!isSuperAdmin"
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
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { useCustomDialogs } from '@/composables/useCustomDialogs'
import { useAppStore } from '@/stores/app'
import { useAuditTrail } from '@/composables/useAuditTrail'
import { usePropertyType } from '@/composables/usePropertyType'

export default {
  name: "FlaggedUnitsPage",
  setup() {
    const { showConfirmDialog } = useCustomDialogs()
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail()
    const { getLabel, getColor, getOptions, resolvePropertyTypeFromUnit } = usePropertyType()
    return { 
      showConfirmDialog, 
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
      selectedAgency: null,
      propertyTypeFilter: null,
      filteredUnits: [],
      agencies: [],
      agenciesLoading: false,
      units: [],
      unitsLoading: false,
      headers: [
        { title: "Unit Name", key: "unitName", sortable: true },
        { title: "Missed Payment Flag", key: "missedPaymentFlag", sortable: true, align: "center" },
        { title: "Notice To Vacate Given", key: "noticeToVacateGiven", sortable: true, align: "center" },
        { title: "Property Type", key: "propertyType", sortable: true, align: "center" },
        { title: "Notes", key: "notes", sortable: true },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ]
    };
  },
  computed: {
    selectedAgencyDetails() {
      return this.agencies.find((a) => a.id === this.selectedAgency) || null;
    },
    isAgencyUser() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === 'Agency';
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
    
    async fetchFlaggedUnits(agencyId = null) {
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
        
        const querySnapshot = await getDocs(unitsQuery);
        const unitsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Resolve property types for each flagged unit
        this.units = await Promise.all(
          unitsData.map(async (unit) => {
            try {
              // Try to resolve property type from unitId first
              if (unit.unitId) {
                const propertyType = await this.resolvePropertyTypeFromUnit(unit.unitId);
                return { ...unit, propertyType };
              }
              // If no unitId, try to resolve from unitName (fallback)
              else if (unit.unitName) {
                // Query units collection to find the unit by name
                const unitsQuery = query(
                  collection(db, 'units'),
                  where('unitName', '==', unit.unitName)
                );
                const unitSnapshot = await getDocs(unitsQuery);
                if (!unitSnapshot.empty) {
                  const unitDoc = unitSnapshot.docs[0];
                  const propertyType = await this.resolvePropertyTypeFromUnit(unitDoc.id);
                  return { ...unit, propertyType };
                }
              }
              // Default to OTHER if no unit found
              return { ...unit, propertyType: 'OTHER' };
            } catch (error) {
              console.error(`Error resolving property type for unit ${unit.id}:`, error);
              return { ...unit, propertyType: 'OTHER' };
            }
          })
        );
        
        // Apply initial filtering
        this.filterUnits();
        console.log('Flagged units fetched:', this.units);
        console.log('User type:', userType, 'Agency ID filter:', agencyId);
      } catch (error) {
        console.error('Error fetching flagged units:', error);
      } finally {
        this.unitsLoading = false;
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
      } else {
        // Fetch all flagged units when no agency is selected
        this.fetchFlaggedUnits();
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
    } else {
      // Super Admin/Admin users get all flagged units initially
      await this.fetchFlaggedUnits();
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

  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px;
    object-fit: cover;
  }
}
</style>
