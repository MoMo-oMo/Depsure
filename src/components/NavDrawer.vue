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
      <div
        class="drawer-header clickable"
        :style="headerStyle"
        @click="navigateToProfile"
      >
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
          v-if="isAgencyUser || isAgencyAdmin"
          prepend-icon="mdi-home-account"
          title="ONBOARDED UNITS"
          value="onboard-units"
          @click="navigateTo('onboard-units')"
        />
        <v-list-item
          v-if="!(isAgencyUser || isAgencyAdmin)"
          prepend-icon="mdi-home"
          title="ACTIVE UNITS"
          value="active-units"
          @click="navigateTo('active-units')"
        />

        <v-list-item
          v-if="!(isAgencyUser || isAgencyAdmin)"
          prepend-icon="mdi-bell"
          title="NOTICES"
          value="notices"
          @click="navigateTo('notices')"
        />
        <v-list-item
          v-if="!(isAgencyUser || isAgencyAdmin)"
          prepend-icon="mdi-home-outline"
          title="VACANCIES"
          value="vacancies"
          @click="navigateTo('vacancies')"
        />
        <v-list-item
          v-if="!(isAgencyUser || isAgencyAdmin)"
          prepend-icon="mdi-flag"
          title="FLAGGED UNITS"
          value="flagged-units"
          @click="navigateTo('flagged-units')"
        />
        <v-list-item
          v-if="!(isAgencyUser || isAgencyAdmin)"
          prepend-icon="mdi-wrench"
          title="MAINTENANCE"
          value="maintenance"
          @click="navigateTo('maintenance')"
        />
        <v-list-item
          v-if="!(isAgencyUser || isAgencyAdmin)"
          prepend-icon="mdi-clipboard-check"
          title="INSPECTIONS"
          value="inspections"
          @click="navigateTo('inspections')"
        />

        <v-list-item
          v-if="isAgencyUser || isAgencyAdmin || hasSelectedAgency"
          prepend-icon="mdi-message-text"
          title="CHAT"
          value="chat"
          @click="navigateTo('chat')"
        >
          <template #append>
            <v-avatar
              v-if="combinedUnread > 0"
              color="red"
              size="20"
              class="ml-2 unread-badge"
            >
              <span
                class="text-white"
                style="font-size: 11px; font-weight: 700; line-height: 1"
                >{{ displayUnread }}</span
              >
            </v-avatar>
          </template>
        </v-list-item>
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
          {{ logoutLoading ? "Logging out..." : "Logout" }}
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useDrawer } from "@/composables/useDrawer";
import { useNav } from "@/composables/useNav";
import { useAppStore } from "@/stores/app";
import { useNotification } from "@/composables/useNotification";
import { useAuditTrail } from "@/composables/useAuditTrail";
import { initMessaging } from "@/messaging";
import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  onSnapshot,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default {
  name: "NavDrawer",
  setup() {
    const { mdAndUp } = useDisplay();
    const isDesktop = computed(() => mdAndUp.value);
    const { isOpen } = useDrawer();
    const router = useRouter();
    const { selectedKey, setSelected } = useNav();
    const appStore = useAppStore();
    const { showSuccess, showError } = useNotification();
    const { logAuditEvent, auditActions } = useAuditTrail();

    const logoutLoading = ref(false);
    let unsubMessages = null;
    let unsubUnread = null;
    let unsubUnreadFallback = null;
    let targetChatId = null;
    let presenceCleanup = null;

    const selected = computed({
      get: () => [selectedKey.value],
      set: (values) => {
        const value = Array.isArray(values) ? values[0] : values;
        if (value) setSelected(value);
      },
    });

    // Get user data from Pinia store
    const userName = computed(() => appStore.userName);
    const userType = computed(() => appStore.userType);
    const userAvatar = computed(() => {
      const u = appStore.currentUser || {};
      return (
        u.profileImageUrl ||
        u.profileImage ||
        "https://tse2.mm.bing.net/th/id/OIP.r2k0JLQia3jR_yrRDCmPcQHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"
      );
    });

    // Role-based access control
    const canAccessUserManagement = computed(() => {
      // Only Super Admin and Depsure Admin can access user management
      return (
        userType.value === "Super Admin" ||
        (userType.value === "Admin" &&
          appStore.currentUser?.adminScope === "depsure")
      );
    });

    const canAccessAuditTrail = computed(() => {
      return userType.value === "Super Admin";
    });

    const isAgencyUser = computed(() => {
      return userType.value === "Agency";
    });

    const isAgencyAdmin = computed(() => {
      return (
        userType.value === "Admin" &&
        appStore.currentUser?.adminScope === "agency"
      );
    });

    const canAccessAgencyPage = computed(() => {
      // Only Super Admin and Depsure Admin can access the agencies page
      return (
        userType.value === "Super Admin" ||
        (userType.value === "Admin" &&
          appStore.currentUser?.adminScope === "depsure")
      );
    });

    // Show certain items only when an agency context is selected
    const hasSelectedAgency = computed(() => !!appStore.currentAgency?.id);

    const headerImage = ref(
      "https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800"
    );

    const headerStyle = computed(() => ({
      backgroundImage: `url(${headerImage.value})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }));

    async function onLogout() {
      logoutLoading.value = true;
      try {
        // Log audit event before logout
        await logAuditEvent(
          auditActions.LOGOUT,
          {
            logoutMethod: "manual",
            userType: userType.value,
          },
          "USER",
          appStore.userId
        );

        const success = await appStore.logout();
        if (success) {
          showSuccess("Logged out successfully");
          router.push("/");
        } else {
          showError("Failed to logout. Please try again.");
        }
      } catch (error) {
        console.error("Logout error:", error);
        showError("An error occurred during logout");
      } finally {
        logoutLoading.value = false;
      }
    }

    function navigateTo(route) {
      // Reset section counters when visiting corresponding page
      try {
        if (route === "notices") resetSection("notices");
        if (route === "maintenance") resetSection("maintenance");
        if (route === "inspections") resetSection("inspections");
      } catch {}
      router.push(`/${route}`);
    }

    function navigateToProfile() {
      router.push("/profile");
    }

    // Initialize web push when permission is already granted
    onMounted(async () => {
      try {
        if (appStore.isLoggedIn && "Notification" in window) {
          const granted =
            (typeof Notification !== "undefined" &&
              Notification.permission === "granted") ||
            localStorage.getItem("fcmRegistered") === "1";
          if (granted) await initMessaging(appStore.userId);
        }
      } catch {}
    });

    // Lightweight fallback: subscribe to latest message for current context and raise a local notification
    async function subscribeToMessageFallback() {
      try {
        // cleanup previous
        if (unsubMessages) {
          try {
            unsubMessages();
          } catch {}
          unsubMessages = null;
        }
        targetChatId = null;

        const user = appStore.currentUser;
        if (!user) return;

        // Skip fallback if FCM is registered (avoid duplicate notifications)
        try {
          const hasFCM =
            (typeof window !== "undefined" && window.__fcmRegistered) ||
            localStorage.getItem("fcmRegistered") === "1";
          if (hasFCM) return;
        } catch {}

        // Determine target agency chat
        let agencyId = null;
        if (user.userType === "Agency") agencyId = user.uid;
        else if (user.userType === "Admin" && user.adminScope === "agency")
          agencyId = user.managedAgencyId || null;
        else agencyId = appStore.currentAgency?.id || null;

        if (!agencyId) return;

        // Find chat for agency
        const snap = await getDocs(
          query(collection(db, "chats"), where("agencyId", "==", agencyId))
        );
        if (snap.empty) return;
        targetChatId = snap.docs[0].id;

        const q = query(
          collection(db, "chats", targetChatId, "messages"),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        let firstLoad = true;
        let lastNotifiedId = null;
        unsubMessages = onSnapshot(q, (s) => {
          try {
            if (s.empty) return;
            const d = s.docs[0];
            const m = d.data() || {};
            if (firstLoad) {
              firstLoad = false;
              return;
            }
            if (lastNotifiedId && String(m.id) === String(lastNotifiedId))
              return;
            lastNotifiedId = String(m.id);
            // Ignore own messages
            if (m.authorId === appStore.userId) return;
            // Only notify if tab not focused
            try {
              if (typeof document !== "undefined") {
                const focused =
                  typeof document.hasFocus === "function"
                    ? document.hasFocus()
                    : document.visibilityState === "visible";
                if (focused) return;
              }
            } catch {}
            // Cross-tab de-dupe via localStorage
            try {
              const last = localStorage.getItem("lastNotifiedMessageId");
              if (String(m.id) === String(last)) return;
            } catch {}
            const title = appStore.currentAgencyName
              ? `Chat • ${appStore.currentAgencyName}`
              : "New chat message";
            const body =
              m.text && m.text.length
                ? `${m.authorName || "Someone"}: ${String(m.text).slice(
                    0,
                    120
                  )}`
                : `${m.authorName || "Someone"} sent a message`;
            // Try native notification first
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              try {
                const n = new Notification(title, {
                  body,
                  icon: "/favicon.ico",
                  data: { click_action: "/chat" },
                });
                n.onclick = () => {
                  window.focus?.();
                  router.push("/chat");
                };
              } catch {}
            } else {
              // Fallback to in-app notification
              showSuccess(body);
            }
            try {
              if (m.id)
                localStorage.setItem("lastNotifiedMessageId", String(m.id));
            } catch {}
          } catch {}
        });
      } catch (e) {
        console.warn("Message fallback subscribe failed", e);
      }
    }

    // Unread counter subscription (single doc)
    const unreadCount = ref(0);
    const fallbackUnread = ref(0);
    const serverCounterReady = ref(false);
    const combinedUnread = computed(() =>
      Math.max(unreadCount.value, fallbackUnread.value)
    );
    const displayUnread = computed(() =>
      combinedUnread.value > 99 ? "99+" : String(combinedUnread.value)
    );

    // ===== Unseen indicators for Notices, Maintenance, Inspections =====
    const noticesUnread = ref(0);
    const maintenanceUnread = ref(0);
    const inspectionsUnread = ref(0);
    const noticesUnreadDisplay = computed(() =>
      noticesUnread.value > 0
        ? noticesUnread.value > 99
          ? "99+"
          : String(noticesUnread.value)
        : ""
    );
    const maintenanceUnreadDisplay = computed(() =>
      maintenanceUnread.value > 0
        ? maintenanceUnread.value > 99
          ? "99+"
          : String(maintenanceUnread.value)
        : ""
    );
    const inspectionsUnreadDisplay = computed(() =>
      inspectionsUnread.value > 0
        ? inspectionsUnread.value > 99
          ? "99+"
          : String(inspectionsUnread.value)
        : ""
    );

    let unsubNotices = null;
    let unsubMaintenance = null;
    let unsubInspections = null;

    function getLastSeen(key) {
      try {
        return Number(localStorage.getItem(key) || "0");
      } catch {
        return 0;
      }
    }
    function setLastSeen(key) {
      try {
        localStorage.setItem(key, String(Date.now()));
      } catch {}
    }

    function lastSeenKey(section, agencyId, uid) {
      return `lastSeen:${section}:${agencyId || "all"}:${uid || "anon"}`;
    }

    function subscribeSection(section, colName, setCountRef) {
      // Cleanup previous
      if (section === "notices" && unsubNotices) {
        try {
          unsubNotices();
        } catch {}
        unsubNotices = null;
      }
      if (section === "maintenance" && unsubMaintenance) {
        try {
          unsubMaintenance();
        } catch {}
        unsubMaintenance = null;
      }
      if (section === "inspections" && unsubInspections) {
        try {
          unsubInspections();
        } catch {}
        unsubInspections = null;
      }

      const user = appStore.currentUser;
      if (!user) return;
      // Only for Super Admin and Depsure Admin views
      const type = user?.userType;
      const scope = user?.adminScope;
      const isStaffView =
        type === "Super Admin" || (type === "Admin" && scope === "depsure");
      if (!isStaffView) return;

      const agencyId = appStore.currentAgency?.id || null;
      if (!agencyId) {
        setCountRef.value = 0;
        return;
      }

      const key = lastSeenKey(section, agencyId, appStore.userId);
      const qRef = query(
        collection(db, colName),
        where("agencyId", "==", agencyId),
        orderBy("updatedAt", "desc"),
        limit(30)
      );

      const handler = onSnapshot(qRef, (s) => {
        try {
          const lastSeenMs = getLastSeen(key);
          let count = 0;
          s.forEach((d) => {
            const data = d.data() || {};
            const t = data.updatedAt?.toDate
              ? data.updatedAt.toDate().getTime()
              : data.updatedAt
              ? new Date(data.updatedAt).getTime()
              : 0;
            const c = data.createdAt?.toDate
              ? data.createdAt.toDate().getTime()
              : data.createdAt
              ? new Date(data.createdAt).getTime()
              : 0;
            const ts = Math.max(t || 0, c || 0);
            if (ts && ts > lastSeenMs) count++;
          });
          setCountRef.value = count;
        } catch {
          setCountRef.value = 0;
        }
      });

      if (section === "notices") unsubNotices = handler;
      if (section === "maintenance") unsubMaintenance = handler;
      if (section === "inspections") unsubInspections = handler;
    }

    function resetSection(section) {
      const agencyId = appStore.currentAgency?.id || null;
      const key = lastSeenKey(section, agencyId, appStore.userId);
      setLastSeen(key);
      if (section === "notices") noticesUnread.value = 0;
      if (section === "maintenance") maintenanceUnread.value = 0;
      if (section === "inspections") inspectionsUnread.value = 0;
    }

    async function subscribeToUnread() {
      try {
        if (unsubUnread) {
          try {
            unsubUnread();
          } catch {}
          unsubUnread = null;
        }
        unreadCount.value = 0;
        serverCounterReady.value = false;
        const user = appStore.currentUser;
        if (!user) return;
        // Determine agency chat same as fallback
        let agencyId = null;
        if (user.userType === "Agency") agencyId = user.uid;
        else if (user.userType === "Admin" && user.adminScope === "agency")
          agencyId = user.managedAgencyId || null;
        else agencyId = appStore.currentAgency?.id || null;
        if (!agencyId) return;
        const uid = appStore.userId;
        if (!uid) return;
        // Listen to unread counter(s) filtered by agency; expected 1 doc, but sum for safety
        const cRef = collection(db, "unread", uid, "chats");
        const q = query(cRef, where("agencyId", "==", agencyId));
        unsubUnread = onSnapshot(q, (s) => {
          let total = 0;
          s.forEach((d) => {
            total += Number(d.data()?.count || 0);
          });
          unreadCount.value = total;
          const hasCounters = !s.empty;
          serverCounterReady.value = hasCounters;
          // Toggle fallback depending on server counter availability
          if (hasCounters) {
            if (unsubUnreadFallback) {
              try {
                unsubUnreadFallback();
              } catch {}
              unsubUnreadFallback = null;
            }
            fallbackUnread.value = 0;
          } else {
            if (!unsubUnreadFallback) subscribeToUnreadFallback();
          }
        });
      } catch (e) {
        console.warn("Unread subscribe failed", e);
      }
    }

    // Fallback: compute unread by scanning recent messages if server-side counters are absent
    async function subscribeToUnreadFallback() {
      try {
        if (unsubUnreadFallback) {
          try {
            unsubUnreadFallback();
          } catch {}
          unsubUnreadFallback = null;
        }
        fallbackUnread.value = 0;
        const user = appStore.currentUser;
        if (!user) return;
        // Determine agency chat same as above
        let agencyId = null;
        if (user.userType === "Agency") agencyId = user.uid;
        else if (user.userType === "Admin" && user.adminScope === "agency")
          agencyId = user.managedAgencyId || null;
        else agencyId = appStore.currentAgency?.id || null;
        if (!agencyId) return;
        const uid = appStore.userId;
        if (!uid) return;

        // Resolve chatId for this agency
        const snap = await getDocs(
          query(collection(db, "chats"), where("agencyId", "==", agencyId))
        );
        if (snap.empty) return;
        const chatId = snap.docs[0].id;

        // Watch the most recent messages and compute unread locally
        // Keep this light: only last 30 messages
        const q = query(
          collection(db, "chats", chatId, "messages"),
          orderBy("timestamp", "desc"),
          limit(30)
        );
        unsubUnreadFallback = onSnapshot(q, (s) => {
          try {
            let count = 0;
            s.forEach((d) => {
              const m = d.data() || {};
              if (m.deleted) return;
              if (m.authorId === uid) return;
              const rb = Array.isArray(m.readBy) ? m.readBy : [];
              if (!rb.includes(uid)) count++;
            });
            // Do not override server count if it is already higher
            fallbackUnread.value = count;
          } catch {}
        });
      } catch (e) {
        console.warn("Unread fallback subscribe failed", e);
      }
    }

    onMounted(() => {
      subscribeToMessageFallback();
      subscribeToUnread();
      subscribeSection("notices", "notices", noticesUnread);
      subscribeSection("maintenance", "maintenance", maintenanceUnread);
      subscribeSection("inspections", "inspections", inspectionsUnread);
      // Presence across the whole app (low-cost: write on mount/visibility/unload)
      try {
        const uid = appStore.userId;
        if (uid) {
          const ref = doc(db, "presence", uid);
          const writeOnline = () =>
            updateDoc(ref, {
              state: "online",
              lastActive: serverTimestamp(),
            }).catch(() =>
              setDoc(
                ref,
                {
                  state: "online",
                  lastActive: serverTimestamp(),
                  userType: appStore.userType || null,
                },
                { merge: true }
              )
            );
          const writeAway = () =>
            updateDoc(ref, {
              state: document.visibilityState === "visible" ? "online" : "away",
              lastActive: serverTimestamp(),
            }).catch(() => {});
          const writeOffline = () =>
            updateDoc(ref, {
              state: "offline",
              lastActive: serverTimestamp(),
            }).catch(() => {});
          writeOnline();
          const onVis = () => writeAway();
          const onBeforeUnload = () => writeOffline();
          document.addEventListener("visibilitychange", onVis);
          window.addEventListener("beforeunload", onBeforeUnload);
          presenceCleanup = () => {
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("beforeunload", onBeforeUnload);
            try {
              writeOffline();
            } catch {}
          };
        }
      } catch {}
      try {
        if (typeof window !== "undefined") {
          window.addEventListener("fcm-registered", () => {
            if (unsubMessages) {
              try {
                unsubMessages();
              } catch {}
              unsubMessages = null;
            }
          });
        }
      } catch {}
    });
    onUnmounted(() => {
      if (unsubMessages) {
        try {
          unsubMessages();
        } catch {}
        unsubMessages = null;
      }
      if (unsubUnread) {
        try {
          unsubUnread();
        } catch {}
        unsubUnread = null;
      }
      if (unsubUnreadFallback) {
        try {
          unsubUnreadFallback();
        } catch {}
        unsubUnreadFallback = null;
      }
      if (unsubNotices) {
        try {
          unsubNotices();
        } catch {}
        unsubNotices = null;
      }
      if (unsubMaintenance) {
        try {
          unsubMaintenance();
        } catch {}
        unsubMaintenance = null;
      }
      if (unsubInspections) {
        try {
          unsubInspections();
        } catch {}
        unsubInspections = null;
      }
      if (presenceCleanup) {
        try {
          presenceCleanup();
        } catch {}
        presenceCleanup = null;
      }
    });

    // Resubscribe when context changes
    watch(
      () => [appStore.userId, appStore.userType, appStore.currentAgency?.id],
      () => {
        subscribeToMessageFallback();
        subscribeToUnread();
        subscribeSection("notices", "notices", noticesUnread);
        subscribeSection("maintenance", "maintenance", maintenanceUnread);
        subscribeSection("inspections", "inspections", inspectionsUnread);
      }
    );

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
      canAccessAgencyPage,
      hasSelectedAgency,
      unreadCount,
      combinedUnread,
      displayUnread,
      noticesUnreadDisplay,
      maintenanceUnreadDisplay,
      inspectionsUnreadDisplay,
    };
  },
};
</script>

<style scoped>
.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
}
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* allow inner flex child to shrink for scrolling */
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
  background-color: rgba(0, 0, 0, 0.55);
}

.header-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none;
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
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
  min-height: 0; /* critical for flex scroll containers */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* Custom scrollbar for webkit browsers */
.drawer-list::-webkit-scrollbar {
  width: 6px;
}

.drawer-list::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.drawer-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* On smaller screens, reduce internal padding to maximize visible items */
@media (max-width: 768px) {
  .drawer-list {
    padding: 2px 4px 8px 4px;
  }
  .drawer-list :deep(.v-list-item-title) {
    font-size: 0.85rem !important;
  }
  .drawer-list :deep(.v-icon) {
    font-size: 18px !important;
  }
}

@media (max-width: 480px) {
  .drawer-list {
    padding: 1px 2px 4px 2px;
  }
  .drawer-list :deep(.v-list-item-title) {
    font-size: 0.8rem !important;
  }
  .drawer-list :deep(.v-icon) {
    font-size: 17px !important;
  }
}

.drawer-list :deep(.v-list-item) {
  margin: 4px 10px;
  border-radius: 12px;
  transition: background-color 0.2s ease, color 0.2s ease;
  min-height: 44px;
}

/* Responsive list items */
@media (max-width: 768px) {
  .drawer-list :deep(.v-list-item) {
    margin: 2px 6px;
    min-height: 40px;
  }
}

@media (max-width: 480px) {
  .drawer-list :deep(.v-list-item) {
    margin: 1px 4px;
    min-height: 36px;
  }
}

/* White text + icons by default */
.drawer-list :deep(.v-list-item-title),
.drawer-list :deep(.v-list-item-subtitle),
.drawer-list :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* Reduce typography/icon sizes a bit for a tighter nav */
.drawer-list :deep(.v-list-item-title) {
  font-size: 0.9rem !important;
}
.drawer-list :deep(.v-list-item-subtitle) {
  font-size: 0.75rem !important;
}
.drawer-list :deep(.v-icon) {
  font-size: 20px !important;
}

/* Move text closer to icons by reducing the gap */
.drawer-list :deep(.v-list-item__prepend) {
  margin-inline-end: -16px !important;
}

/* Hover effect */
.drawer-list :deep(.v-list-item:hover) {
  background-color: rgba(255, 255, 255, 0.08);
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
