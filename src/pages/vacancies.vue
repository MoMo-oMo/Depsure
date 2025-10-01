<template>
  <div class="view-vacancy-page">
    <v-container fluid>
      <!-- Filters and Action Buttons -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="3" lg="3">
          <v-text-field
            v-model="searchQuery"
            label="Search vacancy entries..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input top-filter"
            @input="filterVacancies"
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
            class="custom-input top-filter"
            @update:model-value="filterVacancies"
          />
        </v-col>

        <!-- Month filter -->
        <v-col cols="12" md="2" lg="3">
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
                label="Filter by creation month"
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

        <!-- Export to Excel Button -->
        <v-col cols="12" md="2" lg="2" class="d-flex align-center">
          <v-btn @click="exportToExcel" class="export-btn">
            Export to Excel
          </v-btn>
        </v-col>

        <!-- Add Vacancy Button - Only visible to Agency users -->
        <v-col cols="12" md="2" lg="2" class="d-flex align-center" v-if="isAgencyUser">
          <v-btn @click="addVacancy" class="back-btn">
            Add Vacancy
          </v-btn>
        </v-col>
      </v-row>

      <!-- Clean Agency Header -->
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

      <!-- Vacancy Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredVacancies"
            :loading="vacanciesLoading"
            class="custom-header"
            density="comfortable"
            hover
            no-data-text="No data available"
          >
            <!-- Date Vacated -->
            <template v-slot:item.dateVacated="{ item }">
              {{ formatDate(item.dateVacated) }}
            </template>

            <!-- Move In Date -->
            <template v-slot:item.moveInDate="{ item }">
              {{ item.moveInDate ? formatDate(item.moveInDate) : 'Not specified' }}
            </template>

            <!-- Property Type -->
            <template v-slot:item.propertyType="{ item }">
              <v-chip
                :color="getPropertyTypeColor(item.propertyType)"
                size="small"
                variant="outlined"
              >
                {{ getPropertyTypeLabel(item.propertyType) }}
              </v-chip>
            </template>

            <!-- Action Buttons -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="#757575"
                  @click="viewVacancy(item)"
                  class="action-btn"
                />
                <!-- Move Back to Onboarded Units - Admin Only -->
                <v-btn
                  v-if="canMoveToActive"
                  icon="mdi-home-import-outline"
                  size="small"
                  variant="text"
                  color="#757575"
                  @click="moveToOnboardedUnits(item)"
                  class="action-btn"
                  title="Move back to Onboarded Units"
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
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, getDoc, updateDoc } from 'firebase/firestore'
import { useAppStore } from '@/stores/app'
import { usePropertyType } from '@/composables/usePropertyType'
import heroBg from '@/assets/title.png'
import * as XLSX from 'xlsx'

export default {
  name: "ViewVacancies",
  setup() {
    const { showErrorDialog, showConfirmDialog, showSuccessDialog } = useCustomDialogs()
    const { getLabel, getColor, getOptions, resolvePropertyTypeFromUnit } = usePropertyType()
    return { 
      showErrorDialog, 
      showConfirmDialog,
      showSuccessDialog,
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
      filteredVacancies: [],
      vacancies: [],
      agencies: [],
      agenciesLoading: false,
      vacanciesLoading: false,
      activeUnitsCount: 0,
      headers: [
        { title: "UNIT NAME", key: "unitName", sortable: true },
        { title: "DATE VACATED", key: "dateVacated", sortable: true, align: "center" },
        { title: "MOVE IN DATE", key: "moveInDate", sortable: true, align: "center" },
        { title: "PROPERTY TYPE", key: "propertyType", sortable: true, align: "center" },
        { title: "ACTIONS", key: "actions", sortable: false, align: "center" },
      ]
    };
  },
  computed: {
    agencyHeroBgStyle() {
      return { background: `url(${heroBg}) center/cover no-repeat` }
    },
    heroTitle() {
      return this.selectedAgencyDetails?.agencyName || 'Vacancies'
    },
    monthFilterLabel() {
      if (!this.monthFilter) return 'All Months'
      try {
        const [yy, mm] = String(this.monthFilter).split('-')
        const d = new Date(Number(yy), Number(mm) - 1, 1)
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      } catch { return this.monthFilter }
    },
    selectedAgencyDetails() {
      return this.agencies.find(a => a.id === this.selectedAgency) || null;
    },
    isAgencyUser() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return user?.userType === 'Agency' || (user?.userType === 'Admin' && user?.adminScope === 'agency');
    },
    canMoveToActive() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      // Only Super Admin and regular Admin can move units back to active
      return user?.userType === 'Super Admin' || (user?.userType === 'Admin' && user?.adminScope !== 'agency');
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
      if (open) this.tempMonth = this.monthFilter || ''
    },
    applyMonth() {
      this.monthFilter = this.tempMonth || ''
      this.filterVacancies()
      this.monthMenu = false
    },
    clearMonth() {
      this.tempMonth = ''
      this.monthFilter = ''
      this.filterVacancies()
      this.monthMenu = false
    },
    getCurrentMonth() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    filterVacancies() {
      this.filteredVacancies = this.vacancies.filter(vacancy => {
        const textMatch = vacancy.unitName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         (vacancy.propertyManager && vacancy.propertyManager.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                         (vacancy.contactNumber && vacancy.contactNumber.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                         (vacancy.notes && vacancy.notes.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        let agencyMatch = true;
        let monthMatch = true;
        let propertyTypeMatch = true;
        
        if (this.selectedAgency) {
          agencyMatch = vacancy.agencyId === this.selectedAgency;
        }
        
        if (this.propertyTypeFilter) {
          propertyTypeMatch = vacancy.propertyType === this.propertyTypeFilter;
        }
        
        if (this.monthFilter) {
          const vacancyDate = new Date(vacancy.dateVacated);
          const filterDate = new Date(this.monthFilter+"-01");
          monthMatch = vacancyDate.getMonth() === filterDate.getMonth() && vacancyDate.getFullYear() === filterDate.getFullYear();
        }
        
        return textMatch && agencyMatch && monthMatch && propertyTypeMatch;
      });
    },

    async exportToExcel() {
      try {
        // Prepare data for export
        const exportData = this.filteredVacancies.map(vacancy => ({
          'Unit Name': vacancy.unitName,
          'Date Vacated': this.formatDate(vacancy.dateVacated),
          'Move In Date': vacancy.moveInDate ? this.formatDate(vacancy.moveInDate) : 'Not specified',
          'Property Type': this.getPropertyTypeLabel(vacancy.propertyType),
          'Property Manager': vacancy.propertyManager || 'N/A',
          'Contact Number': vacancy.contactNumber || 'N/A',
          'Notes': vacancy.notes || ''
        }));

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vacancies');

        // Set column widths
        const wscols = [
          { wch: 25 }, // Unit Name
          { wch: 15 }, // Date Vacated
          { wch: 15 }, // Move In Date
          { wch: 15 }, // Property Type
          { wch: 20 }, // Property Manager
          { wch: 15 }, // Contact Number
          { wch: 30 }  // Notes
        ];
        ws['!cols'] = wscols;

        // Generate filename with current date
        const today = new Date();
        const filename = `Vacancies_Report_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);

        this.showSuccessDialog('Excel file exported successfully!', 'Success', 'OK');
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        this.showErrorDialog('Failed to export data to Excel. Please try again.', 'Error', 'OK');
      }
    },

    async moveToOnboardedUnits(vacancy) {
      try {
        await this.showConfirmDialog({
          title: 'Move to Onboarded Units?',
          message: `Are you sure you want to move "${vacancy.unitName}" back to Onboarded Units? This indicates a new tenant has been secured.`,
          confirmText: 'Move to Onboarded',
          cancelText: 'Cancel',
          color: 'black'
        })
      } catch (_) {
        return
      }

      try {
        console.log('Moving vacancy to onboarded units:', vacancy);
        
        // Try to find the unit in active units or archived units
        let unitId = vacancy.unitId;
        let unitRef;
        let unitExists = false;
        let unitData = null;
        
        console.log('Step 1: Checking active units by ID:', unitId);
        
        // First, check if we have a unitId and if that document exists in active units
        if (unitId) {
          unitRef = doc(db, 'units', unitId);
          const unitDoc = await getDoc(unitRef);
          if (unitDoc.exists()) {
            console.log('Found unit by ID in active units');
            unitExists = true;
            unitData = unitDoc.data();
          } else {
            console.log('Unit not found by ID in active units');
          }
        }
        
        // If not found by ID, try to find by name in active units
        if (!unitExists && vacancy.unitName) {
          console.log('Step 2: Searching active units by name:', vacancy.unitName);
          
          const unitsQuery = query(
            collection(db, 'units'),
            where('propertyName', '==', vacancy.unitName)
          );
          let unitSnapshot = await getDocs(unitsQuery);
          
          // If not found by propertyName, try unitName field
          if (unitSnapshot.empty) {
            console.log('Not found by propertyName, trying unitName field');
            const unitsQuery2 = query(
              collection(db, 'units'),
              where('unitName', '==', vacancy.unitName)
            );
            unitSnapshot = await getDocs(unitsQuery2);
          }
          
          if (!unitSnapshot.empty) {
            console.log('Found unit by name in active units');
            unitId = unitSnapshot.docs[0].id;
            unitRef = doc(db, 'units', unitId);
            unitExists = true;
            unitData = unitSnapshot.docs[0].data();
          } else {
            console.log('Unit not found in active units by name');
          }
        }
        
        // If still not found in active units, check archived units
        if (!unitExists && vacancy.unitName) {
          console.log('Step 3: Searching archived units for:', vacancy.unitName);
          console.log('Also checking with unitId:', vacancy.unitId);
          
          // Try by originalId first (this is the ID before archiving)
          if (vacancy.unitId) {
            console.log('Searching archived units by originalId:', vacancy.unitId);
            const archivedByIdQuery = query(
              collection(db, 'archivedUnits'),
              where('originalId', '==', vacancy.unitId)
            );
            let archivedSnapshot = await getDocs(archivedByIdQuery);
            console.log('Archived query by originalId returned:', archivedSnapshot.size, 'results');
            
            if (!archivedSnapshot.empty) {
              console.log('Found unit in archived units by originalId! Restoring...');
              // Restore unit from archive
              const archivedDoc = archivedSnapshot.docs[0];
              unitData = { ...archivedDoc.data() };
              
              // Remove archive-specific fields
              delete unitData.originalId;
              delete unitData.archivedAt;
              delete unitData.archivedBy;
              delete unitData.archivedByUserType;
              delete unitData.archivedReason;
              
              // Add back to active units
              unitData.status = 'active';
              unitData.isVacant = false;
              unitData.vacancyEndDate = new Date();
              unitData.updatedAt = new Date();
              
              const newUnitRef = await addDoc(collection(db, 'units'), unitData);
              unitId = newUnitRef.id;
              unitExists = true;
              
              // Delete from archived units
              await deleteDoc(archivedDoc.ref);
              
              console.log(`Unit "${vacancy.unitName}" restored from archive using originalId`);
              
              // Skip the updateDoc below since we already set the status
              unitRef = null;
            }
          }
          
          // If still not found, try by name
          if (!unitExists) {
            const archivedQuery = query(
              collection(db, 'archivedUnits'),
              where('unitName', '==', vacancy.unitName)
            );
            let archivedSnapshot = await getDocs(archivedQuery);
            console.log('Archived query by unitName returned:', archivedSnapshot.size, 'results');
            
            // Also try propertyName in archived
            if (archivedSnapshot.empty) {
              console.log('Trying propertyName in archived units');
              const archivedQuery2 = query(
                collection(db, 'archivedUnits'),
                where('propertyName', '==', vacancy.unitName)
              );
              archivedSnapshot = await getDocs(archivedQuery2);
              console.log('Archived query by propertyName returned:', archivedSnapshot.size, 'results');
            }
            
            if (!archivedSnapshot.empty) {
              console.log('Found unit in archived units by name! Restoring...');
              // Restore unit from archive
              const archivedDoc = archivedSnapshot.docs[0];
              unitData = { ...archivedDoc.data() };
              
              // Remove archive-specific fields
              delete unitData.originalId;
              delete unitData.archivedAt;
              delete unitData.archivedBy;
              delete unitData.archivedByUserType;
              delete unitData.archivedReason;
              
              // Add back to active units
              unitData.status = 'active';
              unitData.isVacant = false;
              unitData.vacancyEndDate = new Date();
              unitData.updatedAt = new Date();
              
              const newUnitRef = await addDoc(collection(db, 'units'), unitData);
              unitId = newUnitRef.id;
              unitExists = true;
              
              // Delete from archived units
              await deleteDoc(archivedDoc.ref);
              
              console.log(`Unit "${vacancy.unitName}" restored from archive`);
              
              // Skip the updateDoc below since we already set the status
              unitRef = null;
            }
          }
        }
        
        if (!unitExists) {
          this.showErrorDialog(
            `Unit "${vacancy.unitName}" not found in active or archived units. Please create the unit first in Onboarded Units.`,
            'Error',
            'OK'
          );
          return;
        }

        // Update unit status if it exists and wasn't just restored from archive
        if (unitRef) {
          await updateDoc(unitRef, {
            status: 'active',
            isVacant: false,
            vacancyEndDate: new Date(),
            updatedAt: new Date()
          });
        }

        // Delete the vacancy record
        await deleteDoc(doc(db, 'vacancies', vacancy.id));

        // Remove from local array
        const index = this.vacancies.findIndex(v => v.id === vacancy.id);
        if (index > -1) this.vacancies.splice(index, 1);
        this.filterVacancies();

        this.showSuccessDialog(`${vacancy.unitName} has been moved back to Onboarded Units successfully!`, 'Success', 'OK');
      } catch (error) {
        console.error('Error moving unit to onboarded:', error);
        this.showErrorDialog(`Failed to move unit: ${error.message}`, 'Error', 'OK');
      }
    },

    viewVacancy(vacancy) { 
      this.$router.push(`/view-vacancy-${vacancy.id}`); 
    },
    
    addVacancy() { 
      this.$router.push('/add-vacancy'); 
    },

    async fetchAgencies() {
      this.agenciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          let agencyData = null;
          
          if (userType === 'Agency') {
            const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (agencyDoc.exists()) {
              agencyData = {
                id: agencyDoc.id,
                ...agencyDoc.data()
              };
            }
          } else if (userType === 'Admin' && currentUser.adminScope === 'agency') {
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
            this.selectedAgency = agencyData.id;
          } else {
            this.agencies = [];
          }
        } else {
          const q = query(collection(db, 'users'), where('userType', '==', 'Agency'));
          const querySnapshot = await getDocs(q);
          this.agencies = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
        this.showErrorDialog('Failed to load agencies. Please try again.', 'Error', 'OK');
      } finally {
        this.agenciesLoading = false;
      }
    },

    async fetchVacancies(agencyId = null) {
      this.vacanciesLoading = true;
      try {
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const userType = currentUser?.userType;
        
        let q;
        
        if (userType === 'Agency' || (userType === 'Admin' && currentUser.adminScope === 'agency')) {
          let targetAgencyId = currentUser.uid;
          
          if (userType === 'Admin' && currentUser.adminScope === 'agency') {
            targetAgencyId = currentUser.managedAgencyId;
          }
          
          if (targetAgencyId) {
            q = query(collection(db, 'vacancies'), where('agencyId', '==', targetAgencyId));
          } else {
            this.vacancies = [];
            this.filteredVacancies = [];
            return;
          }
        } else if (agencyId) {
          q = query(collection(db, 'vacancies'), where('agencyId', '==', agencyId));
        } else {
          q = collection(db, 'vacancies');
        }
        
        const querySnapshot = await getDocs(q);
        const vacanciesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        
        this.vacancies = await Promise.all(
          vacanciesData.map(async (vacancy) => {
            try {
              // If vacancy already has propertyType stored, use it
              if (vacancy.propertyType) {
                return vacancy;
              }
              
              // Try to resolve from active units first
              if (vacancy.unitId) {
                const propertyType = await this.resolvePropertyTypeFromUnit(vacancy.unitId);
                return { ...vacancy, propertyType };
              } else if (vacancy.unitName) {
                const unitsQuery = query(
                  collection(db, 'units'),
                  where('unitName', '==', vacancy.unitName)
                );
                const unitSnapshot = await getDocs(unitsQuery);
                if (!unitSnapshot.empty) {
                  const unitDoc = unitSnapshot.docs[0];
                  const propertyType = await this.resolvePropertyTypeFromUnit(unitDoc.id);
                  return { ...vacancy, unitId: unitDoc.id, propertyType };
                }
              }
              
              // Default to residential if not found
              return { ...vacancy, propertyType: 'residential' };
            } catch (error) {
              // Silently handle errors - unit may be archived
              return { ...vacancy, propertyType: 'residential' };
            }
          })
        );
        
        this.filterVacancies();
      } catch (error) {
        console.error('Error fetching vacancies:', error);
        this.showErrorDialog('Failed to load vacancies. Please try again.', 'Error', 'OK');
      } finally {
        this.vacanciesLoading = false;
      }
    }
  },
  async mounted() {
    await this.fetchAgencies();
    
    if (this.isAgencyUser) {
      await this.fetchVacancies();
    } else {
      const appStore = useAppStore();
      const globalId = appStore.currentAgency?.id || null;
      if (globalId) {
        this.selectedAgency = globalId;
        await this.fetchVacancies(globalId);
      } else {
        await this.fetchVacancies();
      }
    }
  }
};
</script>

<style scoped>
.view-vacancy-page { padding:20px; min-height:100vh; }
.back-btn {
  font-weight: 500; text-transform:none; border-radius:8px; transition: all 0.3s ease;
  background-color:black !important; color:white !important; border:2px solid black !important;
  width:160px; height:44px;
}
.back-btn:hover { background-color:#333 !important; border-color:#333 !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.5); }

.export-btn {
  font-weight: 500; text-transform:none; border-radius:8px; transition: all 0.3s ease;
  background-color:black !important; color:white !important; border:2px solid black !important;
  width:180px; height:44px;
}
.export-btn:hover { background-color:#333 !important; border-color:#333 !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.5); }

.custom-input .v-field { border-radius:8px; }
.action-btn-container { display:flex; justify-content:center; align-items:center; gap:4px; }
.action-btn { font-size:0.75rem; font-weight:500; text-transform:none; border-radius:6px; }
.action-btn:hover { transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.2); }
    
:deep(.custom-header .v-data-table-header) { background:#000; color:white; }

.month-menu { background:#fff; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.15); padding:12px; min-width:260px; }
.month-menu__title { font-weight:600; margin-bottom:8px; }
.month-menu__input { width:100%; padding:8px 10px; border:1px solid #d0d0d0; border-radius:8px; }
.month-menu__input:focus { outline:none; border-color:#000; box-shadow:0 0 0 2px rgba(0,0,0,0.08); }
.month-menu__actions { display:flex; justify-content:space-between; gap:8px; margin-top:10px; }

.agency-hero-card { position: relative; border-radius: 12px; overflow: hidden; min-height: 180px; }
.agency-hero-bg { position: absolute; inset: 0; background-position: center; background-size: cover; background-repeat: no-repeat; }
.agency-hero-center { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center; padding: 0 16px; color: #fff; font-weight: 800; font-size: 1.6rem; text-align: center; letter-spacing: 0.3px; text-shadow: 0 2px 8px rgba(0,0,0,0.5); }

@media(max-width:768px){ 
  .back-btn, .export-btn { width:140px; height:40px; font-size: 0.85rem; } 
  .action-btn { font-size:0.7rem; }
}
</style>