<template>
  <v-app>
    <NavDrawer v-if="showDrawer" />
    <AppBar v-if="showDrawer" />
    <router-view />
    <GlobalNotification />
    <GlobalDialogs />
  </v-app>
</template>

<script setup>
import NavDrawer from '@/components/NavDrawer.vue'
import AppBar from '@/components/AppBar.vue'
import GlobalNotification from '@/components/GlobalNotification.vue'
import GlobalDialogs from '@/components/GlobalDialogs.vue'
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Show drawer only on non-login routes
const showDrawer = computed(() => route.path !== '/')

// Initialize authentication state
onMounted(() => {
  appStore.initializeAuth()
})

// Protected routes list
const protectedRoutes = [
  '/agency', '/active-units', '/notices', '/flagged-units', 
  '/maintenance', '/inspections', '/vacancies', '/user-management',
  '/audit-trail', '/dashboard', '/add-user', '/add-unit', '/add-notice', '/add-flagged-unit',
  '/profile', '/chat', '/onboard-units'
]

// Computed to check if current route is protected
const isProtectedRoute = computed(() => {
  return protectedRoutes.some(protectedRoute => route.path.startsWith(protectedRoute))
})

// Role-based access
const roleProtectedRoutes = {
  '/user-management': ['Super Admin', 'Admin'],
  '/audit-trail': ['Super Admin'],
  '/archived-units': ['Super Admin'],
  '/view-archived-unit-': ['Super Admin'],
  '/add-user': ['Super Admin', 'Admin'],
  '/add-agency': ['Super Admin'],
  '/add-unit': ['Super Admin', 'Admin', 'Agency'],
  '/add-notice': ['Super Admin', 'Admin', 'Agency'],
  // Only Agency users and Agency Admin users can flag units
  '/add-flagged-unit': ['Agency', 'Admin'],
  '/add-maintenance': ['Super Admin', 'Admin', 'Agency'],
  '/add-inspection': ['Super Admin', 'Admin', 'Agency'],
  '/add-vacancy': ['Super Admin', 'Admin', 'Agency']
}

// Routes that require specific admin scope (not just any Admin)
const scopeRestrictedRoutes = {
  '/user-management': ['Super Admin', 'Admin'], // Only Super Admin and Depsure Admin
  '/add-user': ['Super Admin', 'Admin'], // Only Super Admin and Depsure Admin
  '/add-flagged-unit': ['Admin'], // Only Agency Admin (not Depsure Admin)
}

// Routes that require specific admin scope
const scopeProtectedRoutes = {
  '/agency': ['Super Admin', 'Admin'], // Only Super Admin and Depsure Admin
}

// Agency-specific routes
const agencyProtectedRoutes = [
  '/edit-agency-',
  '/view-agency-'
]

// Watch route changes to check authentication and authorization
watch(() => route.path, (newPath) => {
  // Redirect to login if not logged in
  if (newPath !== '/' && !appStore.isLoggedIn) {
    router.push('/')
    return
  }

  // Role-based access check
  const userType = appStore.userType
  const userData = appStore.currentUser
  const requiredRoles = roleProtectedRoutes[newPath]

  if (requiredRoles && !requiredRoles.includes(userType)) {
    router.push('/dashboard')
    return
  }

  // Scope-based access check (for routes that require specific admin scope)
  const requiredScopeRoles = scopeProtectedRoutes[newPath]
  if (requiredScopeRoles && requiredScopeRoles.includes(userType)) {
    // Check if it's an Admin user and verify their scope
    if (userType === 'Admin') {
      const adminScope = userData?.adminScope
      if (adminScope === 'agency') {
        // Agency Admin should not access agency management page
        router.push('/active-units')
        return
      }
    }
  }

  // Scope-restricted routes (routes that require specific admin scope)
  const scopeRestrictedRoute = scopeRestrictedRoutes[newPath]
  if (scopeRestrictedRoute && scopeRestrictedRoute.includes(userType)) {
    // Check if it's an Admin user and verify their scope
    if (userType === 'Admin') {
      const adminScope = userData?.adminScope
      if (newPath === '/add-flagged-unit') {
        // Only Agency Admin users can access add-flagged-unit
        if (adminScope !== 'agency') {
          router.push('/active-units')
          return
        }
      } else {
        // For other scope-restricted routes, only Depsure Admin can access
        if (adminScope === 'agency') {
          router.push('/active-units')
          return
        }
      }
    }
  }

  // Agency-specific route protection
  const isAgencyRoute = agencyProtectedRoutes.some(route => newPath.startsWith(route))
  if (isAgencyRoute && userType === 'Agency') {
    router.push('/active-units')
    return
  }
}, { immediate: true })
</script>

<style>
/* Table header styles */
.custom-header .v-data-table__thead {
  background-color: #000 !important;
  border-collapse: separate;
  overflow: hidden;

}
.custom-header .v-data-table__th {
  background-color:#000 !important;
  white-space: nowrap;
  font-weight: 700 !important;
  color: white !important;
  text-transform: none;
}
.custom-header .v-data-table__th:first-child {
  border-top-left-radius: 12px !important;
}
.custom-header .v-data-table__th:last-child {
  border-top-right-radius: 12px !important;
}
.custom-header .v-data-table__tr:nth-child(odd) {
  background-color: white !important;
}
.custom-header .v-data-table__tr:nth-child(even) {
  background-color: #f2f2f2 !important;
}

/* Responsive utilities */
.text-responsive { font-size: clamp(0.875rem, 2.5vw, 1rem); }
.heading-responsive { font-size: clamp(1.25rem, 4vw, 2rem); }
.padding-responsive { padding: clamp(0.5rem, 2vw, 1.5rem); }
.margin-responsive { margin: clamp(0.5rem, 2vw, 1rem); }

/* Vuetify component overrides */
:deep(.v-btn) { font-size: 0.75rem !important; min-height: 32px !important; padding: 0.375rem 0.75rem !important; }
:deep(.v-btn--size-large) { font-size: 0.875rem !important; min-height: 40px !important; padding: 0.5rem 1rem !important; }
:deep(.v-data-table) { font-size: 0.75rem !important; }
:deep(.v-data-table .v-data-table__th) { font-size: 0.75rem !important; font-weight: 700 !important; padding: 0.5rem !important; text-align: center !important; }
/* Ensure Vuetify 3 table headers are bold as well */
:deep(.v-data-table .v-data-table-header th),
:deep(.custom-header .v-data-table-header th) {
  font-weight: 700 !important;
}
/* Target the header content wrapper to override its default weight */
:deep(.v-data-table .v-data-table-header .v-data-table-header__content),
:deep(.custom-header .v-data-table-header .v-data-table-header__content) {
  font-weight: 700 !important;
}
/* Extra safety: cover Vuetify 3 table markup paths */
:deep(.v-data-table__thead .v-data-table__th),
:deep(.v-data-table .v-data-table__thead .v-data-table__th) {
  font-weight: 700 !important;
}
:deep(.v-data-table .v-table thead th),
:deep(.v-table thead th) {
  font-weight: 700 !important;
}
/* Explicitly hit the classes you listed so all header variants are bold */
:deep(.v-data-table .v-data-table-header th.v-data-table__th),
:deep(.v-data-table .v-data-table-header th.v-data-table__th--sortable),
:deep(.v-data-table .v-data-table-header .v-data-table-column--align-start),
:deep(.v-table thead th.v-data-table__th),
:deep(.v-table thead th.v-data-table__th--sortable),
:deep(.v-table thead th .v-data-table-column--align-start) {
  font-weight: 700 !important;
}
:deep(.v-data-table .v-data-table__td) { font-size: 0.75rem !important; padding: 0.5rem !important; text-align: center !important; }
:deep(.v-data-table .v-data-table__actions-cell) { display: flex; justify-content: center; align-items: center; gap: 4px; height: 100%; }
:deep(.v-text-field .v-field__input) { font-size: 0.875rem !important; min-height: 36px !important; }
:deep(.v-text-field .v-field-label) { font-size: 0.75rem !important; }
:deep(.v-card-title) { font-size: 1rem !important; font-weight: 600 !important; padding: 1rem !important; }
:deep(.v-card-text) { font-size: 0.875rem !important; padding: 0.75rem 1rem !important; }
:deep(.v-chip) { font-size: 0.6875rem !important; height: 24px !important; }
:deep(.v-select .v-field__input), :deep(.v-textarea .v-field__input) { font-size: 0.875rem !important; }

/* Form styling */
:deep(.v-field--variant-solo) { border-radius: 6px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; }
:deep(.v-field--variant-solo .v-field__overlay) { background-color: #f8f9fa !important; }

/* Dialog styling */
:deep(.v-dialog .v-card) { border-radius: 8px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }

/* Router transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }
</style>
