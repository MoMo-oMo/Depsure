<template>
  <div class="agency-page">
    <v-container fluid>
      <!-- Search and Add Agency Section -->
      <v-row class="mb-6 align-center">
        <v-col cols="12" lg="3" md="4">
          <v-text-field
            v-model="searchQuery"
            clearable
            dense
            class="custom-input"
            density="comfortable"
            flat
            hide-details
            label="Search agencies..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @input="filterAgencies"
          />
        </v-col>
        <v-col class="d-flex justify-end" cols="12" lg="2" md="3">
          <!-- <v-btn
            color="primary"
            variant="elevated"
            size="small"
            class="add-agency-btn"
            @click="addNewAgency"
          >
            Add Agency
          </v-btn> -->
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <!-- Loading state -->
          <div v-if="loading" class="pa-4">
            <v-row>
              <v-col
                v-for="n in 8"
                :key="n"
                cols="12"
                lg="3"
                md="4"
                sm="6"
              >
                <v-skeleton-loader type="image, article" />
              </v-col>
            </v-row>
          </div>

          <!-- No agencies found -->
          <div
            v-else-if="filteredAgencies.length === 0"
            class="text-center pa-8"
          >
            <v-icon color="grey" size="64">mdi-domain-off</v-icon>
            <p class="mt-4 text-grey">No agencies found</p>
          </div>

          <!-- Agencies grid -->
          <v-row v-else>
            <v-col
              v-for="(agency, index) in filteredAgencies"
              :key="agency.id"
              cols="12"
              lg="4"
              md="4"
              sm="4"
            >
              <div
                class="business-card"
                :class="{ 'business-card--selected': isCurrentAgency(agency) }"
              >
                <!-- Image section with overlay title -->
                <div class="image-section">
                  <v-btn
                    v-if="canPinAgencies"
                    :class="[
                      'pin-agency-btn',
                      { 'pin-agency-btn--pinned': isPinnedAgency(agency.id) },
                    ]"
                    :color="isPinnedAgency(agency.id) ? 'black' : 'white'"
                    icon
                    size="small"
                    variant="flat"
                    :title="isPinnedAgency(agency.id) ? 'Unpin agency' : 'Pin agency'"
                    @click.stop="togglePinAgency(agency)"
                  >
                    <v-icon>mdi-pin-outline</v-icon>
                  </v-btn>

                  <v-menu
                    v-if="hasAgencyAlerts(agency.id)"
                    content-class="agency-alert-overlay"
                    location="bottom end"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        class="agency-alert-bubble"
                        color="error"
                        size="x-small"
                        variant="flat"
                        :title="agencyAlertSummary(agency.id)"
                        @click.stop
                      >
                        {{ agencyAlertCountDisplay(agency.id) }}
                      </v-btn>
                    </template>

                    <v-card class="agency-alert-menu" elevation="10" theme="dark">
                      <div class="agency-alert-menu__header">
                        <div class="agency-alert-menu__title">
                          {{ agency.agencyName }} notifications
                        </div>
                        <v-btn
                          class="agency-alert-menu__clear-btn"
                          size="x-small"
                          variant="text"
                          @click.stop="markAgencyAlertsSeen(agency.id)"
                        >
                          Mark all viewed
                        </v-btn>
                      </div>
                      <div class="agency-alert-menu__subtitle">
                        Only new activity you have not viewed yet
                      </div>
                      <v-list class="agency-alert-list" density="compact" theme="dark">
                        <v-list-item
                          v-for="alert in agencyAlertItems(agency.id)"
                          :key="`${agency.id}-${alert.key}`"
                          class="agency-alert-item"
                          @click="openAgencyAlert(agency, alert)"
                        >
                          <template #prepend>
                            <v-icon :icon="alert.icon" size="18" />
                          </template>
                          <v-list-item-title class="agency-alert-item__title">
                            {{ alert.label }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="agency-alert-item__subtitle">
                            {{ alert.nextStep }}
                          </v-list-item-subtitle>
                          <template #append>
                            <v-chip
                              class="agency-alert-item__count"
                              color="success"
                              size="x-small"
                              variant="flat"
                            >
                              {{ alert.count }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>

                  <v-img
                    :alt="agency.agencyName"
                    class="card-image"
                    cover
                    :src="
                      agency.profileImageUrl ||
                        agency.profileImage ||
                        'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg'
                    "
                  />
                  <div class="image-overlay">
                    <h2 class="card-headline">
                      {{ agency.agencyName }}
                    </h2>
                  </div>
                </div>

                <!-- Content section -->
                <div class="content-section">
                  <!-- Description -->
                  <p v-if="agency.notes" class="card-description">
                    {{ agency.notes }}
                  </p>

                  <!-- Action Button -->
                  <div class="button-container">
                    <v-btn
                      class="action-btn btn-view"
                      color="white"
                      variant="outlined"
                      @click="viewAgencyDetails(agency)"
                    >
                      View
                    </v-btn>
                    <v-btn
                      class="action-btn btn-select"
                      color="white"
                      @click="selectAgency(agency)"
                    >
                      Select
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where,
  } from 'firebase/firestore'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'AgencyPage',
    data () {
      return {
        agencies: [],
        searchQuery: '',
        filteredAgencies: [],
        loading: false,
        monthFilter: '',
        pinnedAgencyIds: [],
        maintenanceCountsByAgency: {},
        inspectionCountsByAgency: {},
        noticeCountsByAgency: {},
        vacancyCountsByAgency: {},
        liveChatCountsByAgency: {},
        liveChatFallbackCountsByAgency: {},
        hasLiveChatCounterData: false,
        flaggedCountsByAgency: {},
        activitySeenAtByAgency: {},
        agencyAlerts: {},
        activityUnsubscribers: [],
      }
    },
    async mounted () {
      this.loadActivitySeenState()
      await this.loadPinnedAgencies()
      await this.fetchAgencies()
      this.setupAgencyActivityListeners()
    },
    beforeUnmount () {
      this.teardownAgencyActivityListeners()
    },
    computed: {
      canPinAgencies () {
        const appStore = useAppStore()
        const user = appStore.currentUser
        return (
          user?.userType === 'Super Admin'
          || (user?.userType === 'Admin' && user?.adminScope === 'depsure')
        )
      },
    },
    methods: {
      getCurrentMonth () {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}`
      },
      openMonthPicker () {
        const el = this.$refs.monthInput?.$el?.querySelector('input')
        if (el) {
          if (typeof el.showPicker === 'function') el.showPicker()
          else el.focus()
        }
      },
      viewAgencyDetails (agency) {
        // Navigate to the view agency page with agency ID
        this.$router.push(`/view-agency-${agency.id}`)
      },
      setCurrentAgencyContext (agency) {
        const appStore = useAppStore()
        appStore.setCurrentAgency({
          id: agency.id,
          agencyName: agency.agencyName,
          profileImageUrl:
            agency.profileImageUrl || agency.profileImage || null,
          location: agency.location || null,
          establishedYear: agency.establishedYear || null,
          agencyDescription:
            agency.agencyDescription || agency.agencyTagline || null,
        })
      },
      selectAgency (agency) {
        try {
          // Persist current working portfolio globally
          this.setCurrentAgencyContext(agency)
          // Route to Active Units scoped to this agency
          this.$router.push('/active-units')
        } catch (error) {
          console.error('Failed to select agency', error)
        }
      },
      isCurrentAgency (agency) {
        const appStore = useAppStore()
        return appStore.currentAgency?.id === agency?.id
      },
      isPinnedAgency (agencyId) {
        return this.pinnedAgencyIds.includes(agencyId)
      },
      sortAgenciesWithPins (list) {
        const agencies = Array.isArray(list) ? [...list] : []
        if (!this.canPinAgencies || !this.pinnedAgencyIds.length) return agencies

        const pinOrder = new Map(
          this.pinnedAgencyIds.map((id, index) => [id, index]),
        )

        agencies.sort((a, b) => {
          const aPinned = pinOrder.has(a.id)
          const bPinned = pinOrder.has(b.id)
          if (aPinned && bPinned) return pinOrder.get(a.id) - pinOrder.get(b.id)
          if (aPinned !== bPinned) return aPinned ? -1 : 1
          return (a.agencyName || '').localeCompare(b.agencyName || '')
        })

        return agencies
      },
      activityCategories () {
        return [
          'flaggedUnits',
          'maintenance',
          'inspections',
          'notices',
          'vacancies',
          'liveChat',
        ]
      },
      activitySeenStorageKey () {
        const appStore = useAppStore()
        const uid = appStore.userId || appStore.currentUser?.uid || 'anon'
        return `agencyActivitySeen:v2:${uid}`
      },
      toMillis (value) {
        if (!value) return 0
        if (typeof value.toMillis === 'function') return Number(value.toMillis() || 0)
        if (typeof value.toDate === 'function') {
          const date = value.toDate()
          return date instanceof Date ? date.getTime() : 0
        }
        if (value instanceof Date) return value.getTime()
        const date = new Date(value)
        const ms = date.getTime()
        return Number.isFinite(ms) ? ms : 0
      },
      extractActivityTimestamp (payload) {
        const createdAt = this.toMillis(payload?.createdAt)
        const updatedAt = this.toMillis(payload?.updatedAt)
        return Math.max(createdAt, updatedAt)
      },
      loadActivitySeenState () {
        this.activitySeenAtByAgency = {}

        try {
          const raw = localStorage.getItem(this.activitySeenStorageKey())
          if (!raw) return

          const parsed = JSON.parse(raw)
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return

          const normalized = {}
          for (const [agencyId, values] of Object.entries(parsed)) {
            if (!agencyId || !values || typeof values !== 'object' || Array.isArray(values)) continue
            const next = {}
            for (const key of this.activityCategories()) {
              const ms = Number(values[key] || 0)
              if (Number.isFinite(ms) && ms > 0) next[key] = ms
            }
            normalized[agencyId] = next
          }

          this.activitySeenAtByAgency = normalized
        } catch (error) {
          console.warn('Failed to read activity seen state:', error)
        }
      },
      persistActivitySeenState () {
        try {
          localStorage.setItem(
            this.activitySeenStorageKey(),
            JSON.stringify(this.activitySeenAtByAgency || {}),
          )
        } catch (error) {
          console.warn('Failed to persist activity seen state:', error)
        }
      },
      getSeenAt (agencyId, key) {
        const ms = Number(this.activitySeenAtByAgency?.[agencyId]?.[key] || 0)
        return Number.isFinite(ms) && ms > 0 ? ms : 0
      },
      isUnseenActivity (agencyId, key, activityAt) {
        if (!agencyId || !key) return false
        const activityMs = Number(activityAt || 0)
        if (!Number.isFinite(activityMs) || activityMs <= 0) {
          // Older records may not have timestamps; show until this category is marked seen.
          return this.getSeenAt(agencyId, key) === 0
        }
        return activityMs > this.getSeenAt(agencyId, key)
      },
      clearAgencyCountForCategory (agencyId, key) {
        const fieldByCategory = {
          flaggedUnits: 'flaggedCountsByAgency',
          maintenance: 'maintenanceCountsByAgency',
          inspections: 'inspectionCountsByAgency',
          notices: 'noticeCountsByAgency',
          vacancies: 'vacancyCountsByAgency',
          liveChat: 'liveChatCountsByAgency',
        }
        const field = fieldByCategory[key]
        if (!field) return

        this[field] = {
          ...(this[field] || {}),
          [agencyId]: 0,
        }

        if (key === 'liveChat') {
          this.liveChatFallbackCountsByAgency = {
            ...(this.liveChatFallbackCountsByAgency || {}),
            [agencyId]: 0,
          }
        }
      },
      markAgencyCategorySeen (agencyId, key) {
        if (!agencyId || !key) return
        const now = Date.now()
        const current = this.activitySeenAtByAgency?.[agencyId] || {}
        this.activitySeenAtByAgency = {
          ...this.activitySeenAtByAgency,
          [agencyId]: {
            ...current,
            [key]: now,
          },
        }
        this.clearAgencyCountForCategory(agencyId, key)
        this.persistActivitySeenState()
        this.rebuildAgencyAlerts()
      },
      markAgencyAlertsSeen (agencyId) {
        if (!agencyId) return
        const now = Date.now()
        const current = this.activitySeenAtByAgency?.[agencyId] || {}
        const nextSeen = { ...current }
        for (const key of this.activityCategories()) {
          nextSeen[key] = now
          this.clearAgencyCountForCategory(agencyId, key)
        }

        this.activitySeenAtByAgency = {
          ...this.activitySeenAtByAgency,
          [agencyId]: nextSeen,
        }
        this.persistActivitySeenState()
        this.rebuildAgencyAlerts()
      },
      pluralizeLabel (count, singular, plural) {
        return `${count} ${count === 1 ? singular : plural}`
      },
      agencyAlertCount (agencyId) {
        return Number(this.agencyAlerts?.[agencyId]?.totalCount || 0)
      },
      agencyAlertCountDisplay (agencyId) {
        const total = this.agencyAlertCount(agencyId)
        return total > 99 ? '99+' : String(total)
      },
      agencyAlertItems (agencyId) {
        const alerts = this.agencyAlerts?.[agencyId] || {}
        const items = [
          {
            key: 'flaggedUnits',
            icon: 'mdi-flag',
            label: 'Flagged units',
            nextStep: 'Review and move resolved units to active units',
            count: Number(alerts.flaggedUnitsCount || 0),
            route: '/flagged-units',
          },
          {
            key: 'maintenance',
            icon: 'mdi-file-document-edit-outline',
            label: 'Maintenance requests',
            nextStep: 'Open maintenance to review pending requests',
            count: Number(alerts.maintenanceCount || 0),
            route: '/maintenance',
          },
          {
            key: 'inspections',
            icon: 'mdi-home-search-outline',
            label: 'Inspection requests',
            nextStep: 'Open inspections to schedule pending requests',
            count: Number(alerts.inspectionCount || 0),
            route: '/inspections',
          },
          {
            key: 'notices',
            icon: 'mdi-bell-alert-outline',
            label: 'Notices',
            nextStep: 'Open notices to review active notices',
            count: Number(alerts.noticeCount || 0),
            route: '/notices',
          },
          {
            key: 'vacancies',
            icon: 'mdi-home-alert-outline',
            label: 'Vacancies',
            nextStep: 'Open vacancies to review latest activity',
            count: Number(alerts.vacancyCount || 0),
            route: '/vacancies',
          },
          {
            key: 'liveChat',
            icon: 'mdi-message-text-outline',
            label: 'Live chat messages',
            nextStep: 'Open live chat to read and reply',
            count: Number(alerts.liveChatCount || 0),
            route: '/chat',
          },
        ]
        return items.filter(item => item.count > 0)
      },
      openAgencyAlert (agency, alert) {
        if (!agency?.id || !alert) return

        this.markAgencyCategorySeen(agency.id, alert.key)
        this.setCurrentAgencyContext(agency)
        if (alert.key === 'liveChat') {
          this.$router.push({
            path: '/chat',
            query: { agencyId: agency.id },
          })
          return
        }
        this.$router.push(alert.route)
      },
      agencyAlertSummary (agencyId) {
        const alerts = this.agencyAlerts?.[agencyId] || {}
        const items = []
        if (alerts.flaggedUnitsCount > 0) {
          items.push(
            this.pluralizeLabel(
              alerts.flaggedUnitsCount,
              'flagged unit',
              'flagged units',
            ),
          )
        }
        if (alerts.maintenanceCount > 0) {
          items.push(
            this.pluralizeLabel(
              alerts.maintenanceCount,
              'maintenance request',
              'maintenance requests',
            ),
          )
        }
        if (alerts.inspectionCount > 0) {
          items.push(
            this.pluralizeLabel(
              alerts.inspectionCount,
              'inspection request',
              'inspection requests',
            ),
          )
        }
        if (alerts.noticeCount > 0) {
          items.push(
            this.pluralizeLabel(
              alerts.noticeCount,
              'notice',
              'notices',
            ),
          )
        }
        if (alerts.vacancyCount > 0) {
          items.push(
            this.pluralizeLabel(
              alerts.vacancyCount,
              'vacancy',
              'vacancies',
            ),
          )
        }
        if (alerts.liveChatCount > 0) {
          items.push(
            this.pluralizeLabel(
              alerts.liveChatCount,
              'live chat message',
              'live chat messages',
            ),
          )
        }
        return items.length ? items.join(', ') : 'No new activity'
      },
      hasAgencyAlerts (agencyId) {
        return this.agencyAlertCount(agencyId) > 0
      },
      rebuildAgencyAlerts () {
        const next = {}
        for (const agency of this.agencies) {
          const id = agency?.id
          if (!id) continue
          const maintenanceCount = Number(this.maintenanceCountsByAgency?.[id] || 0)
          const inspectionCount = Number(this.inspectionCountsByAgency?.[id] || 0)
          const noticeCount = Number(this.noticeCountsByAgency?.[id] || 0)
          const vacancyCount = Number(this.vacancyCountsByAgency?.[id] || 0)
          const liveChatRealtimeCount = Number(this.liveChatCountsByAgency?.[id] || 0)
          const liveChatFallbackCount = Number(this.liveChatFallbackCountsByAgency?.[id] || 0)
          const liveChatCount = Math.max(liveChatRealtimeCount, liveChatFallbackCount)
          const flaggedUnitsCount = Number(this.flaggedCountsByAgency?.[id] || 0)
          const totalCount
            = maintenanceCount
              + inspectionCount
              + noticeCount
              + vacancyCount
              + liveChatCount
              + flaggedUnitsCount

          if (totalCount > 0) {
            next[id] = {
              maintenanceCount,
              inspectionCount,
              noticeCount,
              vacancyCount,
              liveChatCount,
              flaggedUnitsCount,
              totalCount,
            }
          }
        }
        this.agencyAlerts = next
      },
      teardownAgencyActivityListeners () {
        for (const unsub of this.activityUnsubscribers) {
          try {
            unsub()
          } catch {}
        }
        this.activityUnsubscribers = []
      },
      setupAgencyActivityListeners () {
        this.teardownAgencyActivityListeners()
        if (!this.canPinAgencies) return

        const pushUnsub = (unsub) => {
          if (typeof unsub === 'function') this.activityUnsubscribers.push(unsub)
        }
        const buildUnseenCounts = (snapshot, categoryKey, filterFn = null) => {
          const next = {}
          for (const row of snapshot.docs) {
            const data = row.data() || {}
            if (typeof filterFn === 'function' && !filterFn(data)) continue

            const agencyId = data.agencyId
            if (!agencyId) continue
            const activityAt = this.extractActivityTimestamp(data)
            if (!this.isUnseenActivity(agencyId, categoryKey, activityAt)) continue
            next[agencyId] = Number(next[agencyId] || 0) + 1
          }
          return next
        }

        pushUnsub(
          onSnapshot(
            collection(db, 'maintenance'),
            snapshot => {
              this.maintenanceCountsByAgency = buildUnseenCounts(snapshot, 'maintenance')
              this.rebuildAgencyAlerts()
            },
          ),
        )

        pushUnsub(
          onSnapshot(
            collection(db, 'inspections'),
            snapshot => {
              this.inspectionCountsByAgency = buildUnseenCounts(snapshot, 'inspections')
              this.rebuildAgencyAlerts()
            },
          ),
        )

        pushUnsub(
          onSnapshot(
            collection(db, 'notices'),
            snapshot => {
              this.noticeCountsByAgency = buildUnseenCounts(snapshot, 'notices')
              this.rebuildAgencyAlerts()
            },
          ),
        )

        pushUnsub(
          onSnapshot(
            collection(db, 'vacancies'),
            snapshot => {
              this.vacancyCountsByAgency = buildUnseenCounts(snapshot, 'vacancies')
              this.rebuildAgencyAlerts()
            },
          ),
        )

        pushUnsub(
          onSnapshot(
            collection(db, 'flaggedUnits'),
            snapshot => {
              this.flaggedCountsByAgency = buildUnseenCounts(snapshot, 'flaggedUnits')
              this.rebuildAgencyAlerts()
            },
          ),
        )

        const appStore = useAppStore()
        const uid = appStore.userId || appStore.currentUser?.uid
        if (uid) {
          pushUnsub(
            onSnapshot(collection(db, 'unread', uid, 'chats'), async snapshot => {
              const next = {}
              for (const row of snapshot.docs) {
                const data = row.data() || {}
                let agencyId = data.agencyId
                const count = Number(data.count || data.unreadCount || 0)
                if (!agencyId && row.id) {
                  try {
                    const chatSnap = await getDoc(doc(db, 'chats', row.id))
                    if (chatSnap.exists()) {
                      agencyId = chatSnap.data()?.agencyId || ''
                    }
                  } catch {}
                }
                if (!agencyId || count <= 0) continue
                next[agencyId] = Number(next[agencyId] || 0) + count
              }

              this.hasLiveChatCounterData = Object.keys(next).length > 0
              this.liveChatCountsByAgency = next
              if (
                this.hasLiveChatCounterData
                && Object.keys(this.liveChatFallbackCountsByAgency).length
              ) {
                this.liveChatFallbackCountsByAgency = {}
              }
              this.rebuildAgencyAlerts()
            }),
          )

          pushUnsub(
            onSnapshot(collection(db, 'chats'), async snapshot => {
              if (this.hasLiveChatCounterData) return

              const knownAgencyIds = new Set(
                (this.agencies || []).map(agency => agency?.id).filter(Boolean),
              )
              const next = {}

              await Promise.all(
                snapshot.docs.map(async chatDoc => {
                  const chatData = chatDoc.data() || {}
                  const agencyId = chatData.agencyId
                  if (!agencyId) return
                  if (knownAgencyIds.size && !knownAgencyIds.has(agencyId)) return

                  try {
                    const messagesSnap = await getDocs(
                      query(
                        collection(db, 'chats', chatDoc.id, 'messages'),
                        orderBy('timestamp', 'desc'),
                        limit(30),
                      ),
                    )

                    let unread = 0
                    for (const msgDoc of messagesSnap.docs) {
                      const msg = msgDoc.data() || {}
                      if (msg.deleted) continue
                      if (String(msg.authorId || '') === String(uid)) continue
                      const readBy = Array.isArray(msg.readBy) ? msg.readBy : []
                      if (readBy.includes(uid)) continue
                      unread += 1
                    }

                    if (unread > 0) {
                      next[agencyId] = Number(next[agencyId] || 0) + unread
                    }
                  } catch {}
                }),
              )

              this.liveChatFallbackCountsByAgency = next
              this.rebuildAgencyAlerts()
            }),
          )
        }
      },
      async loadPinnedAgencies () {
        if (!this.canPinAgencies) {
          this.pinnedAgencyIds = []
          return
        }

        const appStore = useAppStore()
        const currentUser = appStore.currentUser
        const uid = currentUser?.uid
        if (!uid) return

        if (Array.isArray(currentUser?.pinnedAgencyIds)) {
          this.pinnedAgencyIds = [...new Set(currentUser.pinnedAgencyIds)]
        }

        try {
          const snap = await getDoc(doc(db, 'users', uid))
          if (snap.exists()) {
            const data = snap.data() || {}
            const pinned = Array.isArray(data.pinnedAgencyIds)
              ? [...new Set(data.pinnedAgencyIds.filter(Boolean))]
              : []
            this.pinnedAgencyIds = pinned
          }
        } catch (error) {
          console.warn('Failed to load pinned agencies:', error)
        }
      },
      async savePinnedAgencies (nextPinned) {
        const appStore = useAppStore()
        const currentUser = appStore.currentUser
        const uid = currentUser?.uid
        if (!uid) return

        const payload = {
          pinnedAgencyIds: nextPinned,
          updatedAt: new Date(),
        }

        try {
          await updateDoc(doc(db, 'users', uid), payload)
        } catch {
          await setDoc(doc(db, 'users', uid), payload, { merge: true })
        }

        appStore.setUser({
          ...currentUser,
          pinnedAgencyIds: nextPinned,
        })
      },
      async togglePinAgency (agency) {
        if (!this.canPinAgencies || !agency?.id) return

        const previous = [...this.pinnedAgencyIds]
        const isPinned = previous.includes(agency.id)
        const nextPinned = isPinned
          ? previous.filter(id => id !== agency.id)
          : [agency.id, ...previous.filter(id => id !== agency.id)]

        this.pinnedAgencyIds = nextPinned
        this.filteredAgencies = this.sortAgenciesWithPins(this.filteredAgencies)

        try {
          await this.savePinnedAgencies(nextPinned)
        } catch (error) {
          this.pinnedAgencyIds = previous
          this.filteredAgencies = this.sortAgenciesWithPins(this.filteredAgencies)
          console.error('Failed to update pinned agencies:', error)
        }
      },
      filterAgencies () {
        const queryText = (this.searchQuery || '').trim().toLowerCase()
        const filtered = this.agencies.filter(agency => {
          const textMatch
            = agency.agencyName?.toLowerCase().includes(queryText)
              || agency.agencyTagline?.toLowerCase().includes(queryText)
              || agency.agencyDescription?.toLowerCase().includes(queryText)
              || agency.location?.toLowerCase().includes(queryText)

          if (!this.monthFilter) return textMatch

          // Try to filter by createdAt month if available (Firestore Timestamp or Date/string)
          let createdAt
            = agency.createdAt || agency.creationDate || agency.created_on || null
          if (!createdAt) return textMatch

          let createdDate
          try {
            createdDate = createdAt && typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt)
            const filterDate = new Date(this.monthFilter + '-01')
            const agencyMonth = `${createdDate.getFullYear()}-${String(
              createdDate.getMonth() + 1,
            ).padStart(2, '0')}`
            const filterMonth = `${filterDate.getFullYear()}-${String(
              filterDate.getMonth() + 1,
            ).padStart(2, '0')}`
            return textMatch && agencyMonth === filterMonth
          } catch {
            return textMatch
          }
        })
        this.filteredAgencies = this.sortAgenciesWithPins(filtered)
      },
      addNewAgency () {
        // Navigate to the add agency page
        this.$router.push('/add-agency')
      },
      async fetchAgencies () {
        this.loading = true
        try {
          const appStore = useAppStore()
          const currentUser = appStore.currentUser
          const userType = currentUser?.userType

          console.log('Current user data:', currentUser)
          console.log('User type:', userType)
          console.log('User UID:', currentUser?.uid)

          let agenciesQuery

          if (
            userType === 'Agency'
            || (userType === 'Admin' && currentUser.adminScope === 'agency')
          ) {
            // Agency users and Agency Admin users can only see their own agency
            let agencyData = null

            if (userType === 'Agency') {
              // For Agency users, use their own document
              try {
                const agencyDoc = await getDoc(doc(db, 'users', currentUser.uid))
                if (agencyDoc.exists()) {
                  agencyData = {
                    id: agencyDoc.id,
                    ...agencyDoc.data(),
                  }
                }
              } catch (error) {
                console.log('Could not fetch agency by UID:', error)
              }
            } else if (
              userType === 'Admin'
              && currentUser.adminScope === 'agency'
              && // For Agency Admin users, fetch their managed agency
              currentUser.managedAgencyId) {
              try {
                const agencyDoc = await getDoc(
                  doc(db, 'users', currentUser.managedAgencyId),
                )
                if (agencyDoc.exists()) {
                  agencyData = {
                    id: agencyDoc.id,
                    ...agencyDoc.data(),
                  }
                }
              } catch (error) {
                console.log('Could not fetch managed agency:', error)
              }
            }

            // Fallback: If still no data, use the current user data directly
            if (!agencyData && currentUser) {
              agencyData = {
                id: currentUser.uid || 'unknown',
                agencyName:
                  currentUser.agencyName
                  || currentUser.managedAgencyName
                  || currentUser.firstName
                  || 'My Agency',
                agencyDescription:
                  currentUser.agencyDescription
                  || currentUser.agencyTagline
                  || 'Agency Description',
                location: currentUser.location || 'Location not specified',
                profileImageUrl:
                  currentUser.profileImageUrl || currentUser.profileImage,
                ...currentUser,
              }
            }

            if (agencyData) {
              this.agencies = [agencyData]
              this.filteredAgencies = this.sortAgenciesWithPins(this.agencies)
              this.rebuildAgencyAlerts()
              console.log('Agency user data found:', this.agencies)
            } else {
              this.agencies = []
              this.filteredAgencies = []
              this.rebuildAgencyAlerts()
              console.log('No agency data found for current user')
            }
            return // Exit early for agency users and agency admins
          } else {
            // Super Admin and Admin users can see all agencies
            agenciesQuery = query(
              collection(db, 'users'),
              where('userType', '==', 'Agency'),
            )

            const querySnapshot = await getDocs(agenciesQuery)
            this.agencies = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }))
            this.filteredAgencies = this.sortAgenciesWithPins(this.agencies)
            this.rebuildAgencyAlerts()
            console.log('Agencies fetched:', this.agencies)
          }

          console.log('User type:', userType, 'Current user:', currentUser)
        } catch (error) {
          console.error('Error fetching agencies:', error)
        } finally {
          this.loading = false
        }
      },
    },
  }
</script>

<style scoped>
.agency-page {
  padding: 20px;
  min-height: 100vh;
  position: relative;
}

.agency-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* Search and Add Agency Styles */
.custom-input .v-field {
  border-radius: 8px;
}

.add-agency-btn {
  width: 160px;
  height: 40px;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  font-size: 0.875rem;
  background-color: black !important;
  color: white !important;
}

.add-agency-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  background-color: #333 !important;
}

.business-card {
  width: 100%;
  max-width: 320px;
  height: 320px;
  margin: 0;
  background: #000000;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.business-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Image section with overlay */
.image-section {
  height: 60%;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

.pin-agency-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.pin-agency-btn--pinned :deep(.v-icon) {
  color: #ffffff !important;
}

.pin-agency-btn--pinned {
  box-shadow:
    0 0 0 2px #ffffff,
    0 2px 8px rgba(0, 0, 0, 0.35);
}

.agency-alert-bubble {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 4;
  min-width: 30px;
  height: 30px;
  border-radius: 999px !important;
  padding: 0 8px !important;
  font-weight: 700;
  font-size: 0.76rem;
  line-height: 1;
  letter-spacing: 0.01em;
  color: #ffffff !important;
  background: #ef4444 !important;
  border: 2px solid #ffffff !important;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.24),
    0 4px 10px rgba(0, 0, 0, 0.35) !important;
}

.agency-alert-bubble:hover {
  filter: brightness(1.05);
}

.agency-alert-menu {
  min-width: 320px;
  max-width: 380px;
  border-radius: 12px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.agency-alert-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px 4px;
}

.agency-alert-menu__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
}

.agency-alert-menu__subtitle {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.74rem;
  padding: 0 12px 8px;
}

.agency-alert-menu__clear-btn {
  color: #22c55e !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  min-width: 0 !important;
  padding: 0 4px !important;
}

.agency-alert-menu__clear-btn:hover {
  background: rgba(34, 197, 94, 0.14) !important;
}

.agency-alert-list {
  background: transparent;
  padding-bottom: 8px;
}

.agency-alert-item {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.agency-alert-item:first-child {
  border-top: none;
}

.agency-alert-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.agency-alert-item__title {
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 600;
}

.agency-alert-item__subtitle {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.75rem;
}

.agency-alert-item__count {
  font-weight: 700;
}

/* Teleported menu content can ignore scoped styles without deep selectors */
:deep(.agency-alert-overlay .agency-alert-menu) {
  background: #000000 !important;
  color: #f8fafc !important;
}

:deep(.agency-alert-overlay .agency-alert-list) {
  background: transparent !important;
}

:deep(.agency-alert-overlay .agency-alert-item) {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.agency-alert-overlay .agency-alert-item:first-child) {
  border-top: none;
}

:deep(.agency-alert-overlay .agency-alert-item:hover) {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.agency-alert-overlay .agency-alert-item .v-icon) {
  color: #22c55e !important;
}

:deep(.agency-alert-overlay .agency-alert-item .v-list-item-title),
:deep(.agency-alert-overlay .agency-alert-item__title) {
  color: #f8fafc !important;
  font-size: 0.86rem !important;
  font-weight: 600 !important;
}

:deep(.agency-alert-overlay .agency-alert-item .v-list-item-subtitle),
:deep(.agency-alert-overlay .agency-alert-item__subtitle) {
  color: rgba(226, 232, 240, 0.88) !important;
  font-size: 0.75rem !important;
  opacity: 1 !important;
}

:deep(.agency-alert-overlay .agency-alert-item__count.v-chip) {
  background: #16a34a !important;
  color: #ffffff !important;
}

:deep(.agency-alert-overlay .agency-alert-menu__title) {
  color: #f8fafc !important;
}

:deep(.agency-alert-overlay .agency-alert-menu__subtitle) {
  color: rgba(203, 213, 225, 0.9) !important;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Image overlay for title */
.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* Smoother, richer gradient for legibility without banding */
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.96) 0%,
    rgba(0, 0, 0, 0.82) 22%,
    rgba(0, 0, 0, 0.64) 48%,
    rgba(0, 0, 0, 0.36) 74%,
    rgba(0, 0, 0, 0) 100%
  );
  /* Reduced height while keeping smooth fade */
  height: 36%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 16px 16px;
}

/* Content section */
.content-section {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Headline on image */
.card-headline {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-align: left;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Description */
.card-description {
  font-size: 0.85rem;
  color: #cccccc;
  line-height: 1.4;
  margin: 0;
  text-align: left;
  flex: 1;
  /* Clamp to a few lines with ellipsis to avoid stretching layout */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: normal;
  overflow-wrap: anywhere;
}

/* Button container */
.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  /* Push buttons to the bottom when description is missing */
  margin-top: auto;
}

.action-btn {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  text-transform: none;
  padding: 10px 16px;
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease, border-color 0.2s ease;
}

/* View button: subtle outline on dark card */
.btn-view {
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
  color: #ffffff !important;
  background: transparent !important;
}

.btn-view:hover {
  border-color: rgba(255, 255, 255, 0.85) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}

/* Select button: primary, slightly elevated */
.btn-select {
  color: black !important;
  background-color: white;
  border: none !important;
}

.btn-select:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .business-card {
    max-width: 280px;
    height: 280px;
  }

  .image-section {
    height: 55%;
  }

  .card-headline {
    font-size: 1rem;
  }

  .card-description {
    font-size: 0.8rem;
  }

  .content-section {
    padding: 12px;
  }

  .button-container {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .agency-alert-bubble {
    min-width: 28px;
    height: 28px;
    padding: 0 7px !important;
    font-size: 0.72rem;
  }
}
.card-image :deep(.v-img__img) {
  /* Use cover, but keep focus centered to reduce awkward crops */
  object-fit: cover !important;
  object-position: center center !important;
  background-color: #000 !important;
}
</style>
