<template>
  <div class="dashboard-page">
    <v-container fluid>
      <!-- Welcome Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="welcome-card">
            <v-card-title class="text-h4">
              Welcome, {{ userName }}!
            </v-card-title>
            <v-card-text class="text-h6">
              User Type: {{ userType }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row>
        <v-col v-if="canAccessUserManagement" cols="12" lg="4" md="6">
          <v-card class="action-card" @click="navigateTo('user-management')">
            <v-card-title>
              <v-icon class="mr-2" icon="mdi-account-group" />
              User Management
            </v-card-title>
            <v-card-text>
              Manage users and their permissions
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4" md="6">
          <v-card class="action-card" @click="navigateTo('agency')">
            <v-card-title>
              <v-icon class="mr-2" icon="mdi-domain" />
              Agencies
            </v-card-title>
            <v-card-text>
              View and manage property agencies
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4" md="6">
          <v-card class="action-card" @click="navigateTo('active-units')">
            <v-card-title>
              <v-icon class="mr-2" icon="mdi-home" />
              Active Units
            </v-card-title>
            <v-card-text>
              View all active property units
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4" md="6">
          <v-card class="action-card" @click="navigateTo('notices')">
            <v-card-title>
              <v-icon class="mr-2" icon="mdi-bell" />
              Notices
            </v-card-title>
            <v-card-text>
              Manage property notices
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4" md="6">
          <v-card class="action-card" @click="navigateTo('flagged-units')">
            <v-card-title>
              <v-icon class="mr-2" icon="mdi-flag" />
              Flagged Units
            </v-card-title>
            <v-card-text>
              View flagged property units
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4" md="6">
          <v-card class="action-card" @click="navigateTo('maintenance')">
            <v-card-title>
              <v-icon class="mr-2" icon="mdi-wrench" />
              Maintenance
            </v-card-title>
            <v-card-text>
              Manage maintenance requests
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'DashboardPage',
    setup () {
      const router = useRouter()
      const appStore = useAppStore()

      const userName = computed(() => appStore.userName)
      const userType = computed(() => appStore.userType)

      // Role-based access control
      const canAccessUserManagement = computed(() => {
        return userType.value === 'Super Admin' || userType.value === 'Admin'
      })

      const navigateTo = route => {
        router.push(`/${route}`)
      }

      return {
        userName,
        userType,
        navigateTo,
        canAccessUserManagement,
      }
    },
    mounted () {
      document.title = 'Dashboard - Depsure'
    },
  }
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f6f7fa;
}

.welcome-card {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  color: white;
  border-radius: 12px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.action-card .v-card-title {
  color: #000;
  font-weight: 600;
}

.action-card .v-card-text {
  color: #666;
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 10px;
  }
}
</style>
