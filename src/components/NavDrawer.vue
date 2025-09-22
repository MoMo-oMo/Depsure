<template>
  <v-navigation-drawer
    v-model="isOpen"
    app
    width="240"
    :temporary="!isDesktop"
    color="#000000"
    theme="dark"
  >
    <div class="drawer-content">
             <!-- Profile / Header -->
       <div class="drawer-header clickable" :style="headerStyle" @click="navigateToProfile">
         <div class="header-bg"></div>
         <div class="header-fade"></div>
         <div class="header-content">
           <v-avatar size="56">
             <v-img :src="userAvatar" alt="User" />
           </v-avatar>
           <div class="user-meta">
             <div class="name">{{ userName }}</div>
             <div class="user-type">{{ userType }}</div>
           </div>
         </div>
       </div>

             <!-- Menu -->
       <v-list
         v-model:selected="selected"
         density="comfortable"
         nav
         color="transparent"
         active-class="pill-active"
         class="drawer-list"
       >
         <v-list-item
           v-if="canAccessUserManagement"
           prepend-icon="mdi-account-group"
           title="USER MANAGEMENT"
           value="user-management"
           @click="navigateTo('user-management')"
         />
         <v-list-item
           v-if="canAccessAuditTrail"
           prepend-icon="mdi-clipboard-list"
           title="AUDIT TRAIL"
           value="audit-trail"
           @click="navigateTo('audit-trail')"
         />
        <v-list-item
          v-if="canAccessAgencyPage"
          prepend-icon="mdi-domain"
          title="AGENCY"
          value="agency"
          @click="navigateTo('agency')"
        />
        <v-list-item
          prepend-icon="mdi-home"
          title="ACTIVE UNITS"
          value="active-units"
          @click="navigateTo('active-units')"
        />
  
        <v-list-item
          prepend-icon="mdi-bell"
          title="NOTICES"
          value="notices"
          @click="navigateTo('notices')"
        />
        <v-list-item
          prepend-icon="mdi-flag"
          title="FLAGGED UNITS"
          value="flagged-units"
          @click="navigateTo('flagged-units')"
        />
        <v-list-item
          prepend-icon="mdi-wrench"
          title="MAINTENANCE"
          value="maintenance"
          @click="navigateTo('maintenance')"
        />
        <v-list-item
          prepend-icon="mdi-clipboard-check"
          title="INSPECTIONS"
          value="inspections"
          @click="navigateTo('inspections')"
        />
        <v-list-item
          prepend-icon="mdi-home-outline"
          title="VACANCIES"
          value="vacancies"
          @click="navigateTo('vacancies')"
        />
  
      </v-list>

      <!-- Footer / Logout -->
      <div class="drawer-footer">
        <v-btn 
          color="red" 
          variant="tonal" 
          block 
          class="footer-btn" 
          @click="onLogout"
          :loading="logoutLoading"
        >
          {{ logoutLoading ? 'Logging out...' : 'Logout' }}
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useDrawer } from '@/composables/useDrawer'
import { useNav } from '@/composables/useNav'
import { useAppStore } from '@/stores/app'
import { useNotification } from '@/composables/useNotification'
import { useAuditTrail } from '@/composables/useAuditTrail'

export default {
  name: 'NavDrawer',
  setup() {
    const { mdAndUp } = useDisplay()
    const isDesktop = computed(() => mdAndUp.value)
    const { isOpen } = useDrawer()
    const router = useRouter()
    const { selectedKey, setSelected } = useNav()
    const appStore = useAppStore()
    const { showSuccess, showError } = useNotification()
    const { logAuditEvent, auditActions } = useAuditTrail()
    
    const logoutLoading = ref(false)
    
    const selected = computed({
      get: () => [selectedKey.value],
      set: (values) => {
        const value = Array.isArray(values) ? values[0] : values
        if (value) setSelected(value)
      }
    })

    // Get user data from Pinia store
    const userName = computed(() => appStore.userName)
    const userType = computed(() => appStore.userType)
    const userAvatar = computed(() => appStore.userAvatar)
    
    // Role-based access control
    const canAccessUserManagement = computed(() => {
      // Only Super Admin and Depsure Admin can access user management
      return userType.value === 'Super Admin' || 
             (userType.value === 'Admin' && appStore.currentUser?.adminScope === 'depsure')
    })

    const canAccessAuditTrail = computed(() => {
      return userType.value === 'Super Admin'
    })

    const isAgencyUser = computed(() => {
      return userType.value === 'Agency'
    })

    const isAgencyAdmin = computed(() => {
      return userType.value === 'Admin' && appStore.currentUser?.adminScope === 'agency'
    })

    const canAccessAgencyPage = computed(() => {
      // Only Super Admin and Depsure Admin can access the agencies page
      return userType.value === 'Super Admin' || 
             (userType.value === 'Admin' && appStore.currentUser?.adminScope === 'depsure')
    })

    const headerImage = ref('https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800')

    const headerStyle = computed(() => ({
      backgroundImage: `url(${headerImage.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }))

    async function onLogout() {
      logoutLoading.value = true
      try {
        // Log audit event before logout
        await logAuditEvent(
          auditActions.LOGOUT,
          { 
            logoutMethod: 'manual',
            userType: userType.value
          },
          'USER',
          appStore.userId
        )
        
        const success = await appStore.logout()
        if (success) {
          showSuccess('Logged out successfully')
          router.push('/')
        } else {
          showError('Failed to logout. Please try again.')
        }
      } catch (error) {
        console.error('Logout error:', error)
        showError('An error occurred during logout')
      } finally {
        logoutLoading.value = false
      }
    }

         function navigateTo(route) {
       router.push(`/${route}`)
     }

     function navigateToProfile() {
       router.push('/profile')
     }

     return {
       isDesktop,
       isOpen,
       selected,
       userName,
       userType,
       userAvatar,
       headerStyle,
       logoutLoading,
       onLogout,
       navigateTo,
       navigateToProfile,
       canAccessUserManagement,
       canAccessAuditTrail,
       isAgencyUser,
       isAgencyAdmin,
       canAccessAgencyPage
     }
  }
}
</script>

<style scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  position: relative;
  padding: 16px;
  height: 96px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.drawer-header.clickable:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.header-bg {
  position: absolute;
  inset: 0;
  background-color: rgba(0,0,0,0.55);
}

.header-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.0) 100%);
  pointer-events: none;
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.user-meta {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}

.name {
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.user-type {
  opacity: 0.8;
  font-size: clamp(0.7rem, 1.2vw, 0.82rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
  color: white;
  font-weight: 500;
}

.drawer-footer {
  margin-top: auto;
  padding: 16px;
}

.footer-btn {
  text-transform: none;
}

.drawer-list {
  padding: 4px 8px 16px 8px;
  flex: 1 1 auto;
  overflow-y: auto;
}

.drawer-list :deep(.v-list-item) {
  margin: 4px 10px;
  border-radius: 12px;
  transition: background-color .2s ease, color .2s ease;
  min-height: 44px;
}

/* White text + icons by default */
.drawer-list :deep(.v-list-item-title),
.drawer-list :deep(.v-list-item-subtitle),
.drawer-list :deep(.v-icon) {
  color: rgba(255,255,255,0.85) !important;
}

/* Hover effect */
.drawer-list :deep(.v-list-item:hover) {
  background-color: rgba(255,255,255,0.08);
}

/* Active state */
.drawer-list :deep(.v-list-item--active) {
  background-color: #ffffff !important;
}

.drawer-list :deep(.v-list-item--active .v-list-item-title),
.drawer-list :deep(.v-list-item--active .v-list-item-subtitle),
.drawer-list :deep(.v-list-item--active .v-icon) {
  color: #000000 !important;
}
</style>
