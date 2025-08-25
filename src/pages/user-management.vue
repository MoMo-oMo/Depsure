<template>
  <div class="user-management-page">
    <v-container fluid>
      <!-- Filters and Add User Button -->
      <v-row class="mb-4">
        <!-- Search -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            label="Search users..."
            prepend-inner-icon="mdi-magnify"
            flat
            density="comfortable"
            variant="outlined"
            clearable
            hide-details
            dense
            class="custom-input"
            @input="filterUsers"
          />
        </v-col>

        <!-- Date filter -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model="dateFilter"
            label="Filter by date added"
            prepend-inner-icon="mdi-calendar"
            flat
            density="comfortable"
            variant="outlined"
            type="date"
            hide-details
            dense
            class="custom-input"
            @input="filterUsers"
          />
        </v-col>

        <!-- User Type Filter -->
        <v-col cols="12" md="3">
          <v-select
            v-model="userTypeFilter"
            label="Filter by user type"
            prepend-inner-icon="mdi-account-group"
            flat
            density="comfortable"
            variant="outlined"
            :items="['All', 'Agency', 'Admin', 'Super Admin']"
            hide-details
            dense
            class="custom-input"
            @update:model-value="filterUsers"
          />
        </v-col>

        <!-- Add User Button -->
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn @click="addUser" class="back-btn">
            Add User
          </v-btn>
        </v-col>
      </v-row>

      <!-- User Table -->
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :loading="loading"
            class="custom-header"
            density="comfortable"
            hover
            no-data-text="No data available"
          >
            <!-- User Type -->
            <template v-slot:item.userType="{ item }">
              <v-chip 
                :color="getUserTypeColor(item.userType)"
                size="small"
                variant="tonal"
              >
                {{ item.userType }}
              </v-chip>
            </template>

            <!-- Status -->
            <template v-slot:item.status="{ item }">
              <v-chip 
                :color="item.status === 'Active' ? 'success' : 'error'"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Date Added -->
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>

            <!-- Action Buttons -->
            <template v-slot:item.actions="{ item }">
              <div class="action-btn-container">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  color="black"
                  @click="viewUser(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="black"
                  @click="editUser(item)"
                  class="action-btn"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteUser(item)"
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
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useCustomDialogs } from '@/composables/useCustomDialogs'

export default {
  name: "UserManagement",
  setup() {
    const { showErrorDialog } = useCustomDialogs()
    return { showErrorDialog }
  },
  data() {
    return {
      searchQuery: "",
      dateFilter: "",
      userTypeFilter: "All",
      filteredUsers: [],
      users: [],
      loading: false,
      headers: [
        { title: "Name", key: "displayName", sortable: true },
        { title: "Email", key: "email", sortable: true },
        { title: "User Type", key: "userType", sortable: true, align: "center" },
        { title: "Status", key: "status", sortable: true, align: "center" },
        { title: "Date Added", key: "createdAt", sortable: true, align: "center" },
        { title: "Actions", key: "actions", sortable: false, align: "center" },
      ]
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = dateString instanceof Date ? dateString : dateString.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    getUserTypeColor(userType) {
      const colors = {
        'Agency': 'primary',
        'Admin': 'warning',
        'Super Admin': 'error'
      };
      return colors[userType] || 'default';
    },
    
    filterUsers() {
      this.filteredUsers = this.users.filter(user => {
        const textMatch = user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                         (user.displayName && user.displayName.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        let dateMatch = true;
        if (this.dateFilter && user.createdAt) {
          const userDate = user.createdAt instanceof Date ? user.createdAt : user.createdAt.toDate();
          const filterDate = new Date(this.dateFilter);
          dateMatch = userDate.toDateString() === filterDate.toDateString();
        }
        
        let typeMatch = true;
        if (this.userTypeFilter !== 'All') {
          typeMatch = user.userType === this.userTypeFilter;
        }
        
        return textMatch && dateMatch && typeMatch;
      });
    },
    
    viewUser(user) { 
      this.$router.push(`/view-user-${user.id}`); 
    },
    
    editUser(user) { 
      this.$router.push(`/edit-user-${user.id}`); 
    },
    
         async deleteUser(user) {
       if (confirm(`Delete user ${user.email}?`)) {
         try {
           await deleteDoc(doc(db, 'users', user.id));
           const index = this.users.findIndex(u => u.id === user.id);
           if (index > -1) this.users.splice(index, 1);
           this.filterUsers();
         } catch (error) {
           console.error('Error deleting user:', error);
           this.showErrorDialog('Failed to delete user. Please try again.', 'Error', 'OK');
         }
       }
     },
    
    addUser() { 
      this.$router.push('/add-user'); 
    },
    
         async fetchUsers() {
       this.loading = true;
       try {
         const querySnapshot = await getDocs(collection(db, 'users'));
         this.users = querySnapshot.docs.map(doc => {
           const userData = doc.data();
           return {
             id: doc.id,
             ...userData,
             displayName: this.getDisplayName(userData)
           };
         });
         this.filteredUsers = this.users;
       } catch (error) {
         console.error('Error fetching users:', error);
       } finally {
         this.loading = false;
       }
     },

     getDisplayName(user) {
       // If user is an Agency type, show agency name
       if (user.userType === 'Agency') {
         return user.agencyName || 'Unknown Agency';
       }
       
       // For Super Admin, Admin, and normal users, show firstName lastName
       if (user.firstName && user.lastName) {
         return `${user.firstName} ${user.lastName}`;
       } else if (user.firstName) {
         return user.firstName;
       } else if (user.lastName) {
         return user.lastName;
       }
       
       // Fallback for users without name fields
       return user.email || 'Unknown User';
     },
  },
  
  async mounted() { 
    await this.fetchUsers();
  }
};
</script>

<style scoped>
.user-management-page { 
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.5); 
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.2); 
}

:deep(.custom-header .v-data-table-header) { 
  background: #000; 
  color: white; 
}

@media(max-width: 768px) { 
  .back-btn { 
    width: 140px; 
    height: 40px; 
  } 
  
  .action-btn { 
    font-size: 0.7rem; 
  } 
}
</style>
