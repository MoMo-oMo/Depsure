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
      <div class="drawer-header" :style="headerStyle">
        <div class="header-bg"></div>
        <div class="header-fade"></div>
        <div class="header-content">
          <v-avatar size="56">
            <v-img :src="user.avatar" alt="User" />
          </v-avatar>
          <div class="user-meta">
            <div class="name">{{ user.name }}</div>
            <div class="email">{{ user.email }}</div>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <v-list
        v-model:selected="selected"
        density="comfortable"
        nav
        color="transparent"
        class="drawer-list"
      >
        <v-list-item
          prepend-icon="mdi-domain"
          title="AGENCY"
          :class="{ 'pill-active': selected.includes('agency') }"
          value="agency"
          @click="navigateTo('agency')"
        />
        <v-list-item
          prepend-icon="mdi-home"
          title="ACTIVE UNITS"
          :class="{ 'pill-active': selected.includes('active-units') }"
          value="active-units"
          @click="navigateTo('active-units')"
        />
  
        <v-list-item
          prepend-icon="mdi-bell"
          title="NOTICES"
          :class="{ 'pill-active': selected.includes('notices') }"
          value="notices"
          @click="navigateTo('notices')"
        />
        <v-list-item
          prepend-icon="mdi-flag"
          title="FLAGGED UNITS"
          :class="{ 'pill-active': selected.includes('flagged-units') }"
          value="flagged-units"
          @click="navigateTo('flagged-units')"
        />
        <v-list-item
          prepend-icon="mdi-wrench"
          title="MAINTENANCE"
          :class="{ 'pill-active': selected.includes('maintenance') }"
          value="maintenance"
          @click="navigateTo('maintenance')"
        />
        <v-list-item
          prepend-icon="mdi-clipboard-check"
          title="INSPECTIONS"
          :class="{ 'pill-active': selected.includes('inspections') }"
          value="inspections"
          @click="navigateTo('inspections')"
        />
        <v-list-item
          prepend-icon="mdi-home-outline"
          title="VACANCIES"
          :class="{ 'pill-active': selected.includes('vacancies') }"
          value="vacancies"
          @click="navigateTo('vacancies')"
        />
      </v-list>

      <!-- Footer / Logout -->
      <div class="drawer-footer">
        <v-btn color="red" variant="tonal" block class="footer-btn" @click="onLogout">Logout</v-btn>
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

export default {
  name: 'NavDrawer',
  setup() {
    const { mdAndUp } = useDisplay()
    const isDesktop = computed(() => mdAndUp.value)
    const { isOpen } = useDrawer()
    const router = useRouter()
    const { selectedKey, setSelected } = useNav()
    const selected = computed({
      get: () => [selectedKey.value],
      set: (values) => {
        const value = Array.isArray(values) ? values[0] : values
        if (value) setSelected(value)
      }
    })

    const user = reactive({
      name: 'Angela Mayer',
      email: 'angela@example.com',
      avatar: 'https://i.pravatar.cc/100?img=5',
      score: 2100,
      created: 1265,
      downloaded: 72,
      uploaded: 256,
      wallet: '0.023456 BTC'
    })

    const headerImage = ref('https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800')

    const headerStyle = computed(() => ({
      backgroundImage: `url(${headerImage.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }))

    function onLogout() {
      router.push('/')
    }

    function navigateTo(route) {
      router.push(`/${route}`)
    }

    return {
      isDesktop,
      isOpen,
      selected,
      user,
      headerStyle,
      onLogout,
      navigateTo
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

.email {
  opacity: 0.8;
  font-size: clamp(0.7rem, 1.2vw, 0.82rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
  color: white;
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
.pill-active {
  background-color: #ffffff !important;
}

.pill-active :deep(.v-list-item-title),
.pill-active :deep(.v-list-item-subtitle),
.pill-active :deep(.v-icon) {
  color: #000000 !important;
}
</style>
