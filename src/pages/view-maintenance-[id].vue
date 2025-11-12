<template>
  <div class="view-maintenance-page">
    <v-container fluid>
      <!-- Back Button -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            icon="mdi-arrow-left"
            variant="outlined"
            color="primary"
            @click="goBack"
            class="back-btn"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Title Section -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="title-section">
            <h1 class="page-title">Maintenance Entry Details</h1>
          </div>

          <!-- Loading -->
          <v-card v-if="loading" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">Loading maintenance entry...</p>
            </v-card-text>
          </v-card>

          <!-- Error -->
          <v-card v-else-if="error" class="form-card" elevation="0">
            <v-card-text class="text-center">
              <v-icon icon="mdi-alert" color="error" size="large" />
              <p class="mt-4 text-error">{{ error }}</p>
            </v-card-text>
          </v-card>

          <!-- Maintenance Info -->
          <div v-else class="form-card" elevation="0">
            <v-card-text>
              <v-row>
                <!-- Property Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.unitName"
                    label="Property Name"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Unit Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.unitNumber || 'Not specified'"
                    label="Unit Number"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contact Person for Keys -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="entry.contactPerson || 'Not specified'"
                    label="Contact Person for Keys"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Created Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="formatDate(entry.createdAt)"
                    label="Created Date"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Contact Person Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="
                      entry.contactPersonNumber ||
                      entry.contactNumber ||
                      'Not specified'
                    "
                    label="Contact Person Number"
                    variant="outlined"
                    readonly
                    class="custom-input"
                  />
                </v-col>

                <!-- Uploaded Requests -->
                <v-col cols="12">
                  <div
                    v-if="entry.quotes && entry.quotes.length"
                    class="existing-quotes mt-2"
                  >
                    <h5 class="existing-title">Uploaded Requests</h5>
                    <div class="quote-list">
                      <div
                        v-for="(doc, idx) in entry.quotes"
                        :key="'rq-' + idx"
                        class="quote-item"
                      >
                        <v-icon color="primary" class="mr-2"
                          >mdi-file-pdf-box</v-icon
                        >
                        <span class="quote-name">{{ doc.fileName }}</span>
                        <v-btn
                          size="small"
                          color="black"
                          variant="outlined"
                          class="doc-action-btn"
                          @click="openRequest(doc)"
                        >
                          View
                        </v-btn>
                        <!-- <v-btn 
                          v-if="doc.fileURL"
                          size="small"
                          color="black"
                          variant="outlined"
                          class="doc-action-btn"
                          :href="doc.fileURL"
                          target="_blank"
                          tag="a"
                        >
                          Download
                        </v-btn> -->
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-medium-emphasis">
                    No requests uploaded.
                  </div>
                </v-col>

                <!-- Estimated Cost hidden as non-essential in UI -->

                <!-- Additional Notes removed (redundant; use Notes tab) -->

                <!-- Last Updated hidden as non-essential in UI -->
              </v-row>
            </v-card-text>
            <!-- Action Buttons (Details) -->
            <v-card-actions class="pa-4">
              <v-spacer />
              <v-btn
                v-if="userType === 'Admin'"
                color="black"
                variant="outlined"
                class="update-status-btn"
                :disabled="updatingStatus"
                :loading="updatingStatus"
                @click="updateStatus"
              >
                Update Status
              </v-btn>
              <v-btn
                v-if="entry.quoteFileName && entry.quoteFileURL"
                color="black"
                variant="elevated"
                class="view-quote-btn"
                @click="showQuoteDialog = true"
              >
                View Quote Instructions
              </v-btn>
              <!-- Only Agency users (Managing Agents & their admins) can edit -->
              <v-btn
                v-if="isAgencyUser"
                color="black"
                variant="elevated"
                class="edit-btn"
                @click="editEntry"
              >
                Edit Entry
              </v-btn>
              <!-- Only Super Admins can delete (after completion) -->
              <v-btn
                v-if="isSuperAdmin"
                color="error"
                variant="elevated"
                class="delete-btn"
                @click="deleteEntry"
              >
                Delete Entry
              </v-btn>
            </v-card-actions>
            <!-- Notes removed - using live chat -->
            <div style="display: none">
              <v-card-text>
                <!-- Notes (Chat-like) -->
                <v-divider class="my-4" />
                <div class="notes-section">
                  <h3 class="mb-2">Notes</h3>
                  <div
                    v-if="entry.notesLog && entry.notesLog.length"
                    class="chat-log"
                    ref="chatLog"
                  >
                    <div
                      v-for="(n, idx) in sortedNotes"
                      :key="noteKey(n)"
                      class="chat-message"
                      :class="{
                        mine: n.authorId === currentUserId,
                        other: n.authorId !== currentUserId,
                      }"
                    >
                      <div class="chat-avatar">
                        <img
                          v-if="n.authorAvatarUrl"
                          :src="n.authorAvatarUrl"
                          alt="avatar"
                          class="chat-avatar-img"
                        />
                        <template v-else>{{
                          noteInitials(n.authorName)
                        }}</template>
                      </div>
                      <div class="chat-bubble">
                        <div class="chat-header">
                          <span class="chat-author">{{
                            n.authorName || "Unknown"
                          }}</span>
                          <div class="chat-header-right">
                            <span class="chat-time">{{
                              formatNoteDate(n.timestamp)
                            }}</span>
                            <span
                              v-if="n.isEdited && !n.isDeleted"
                              class="chat-edited"
                              >(edited)</span
                            >
                            <v-menu
                              v-if="
                                n.authorId === currentUserId && !n.isDeleted
                              "
                              location="bottom end"
                            >
                              <template #activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  icon="mdi-dots-vertical"
                                  size="x-small"
                                  variant="text"
                                  color="white"
                                />
                              </template>
                              <v-list density="compact">
                                <v-list-item @click="startEdit(n)">
                                  <v-list-item-title>
                                    <v-icon size="small" class="mr-1"
                                      >mdi-pencil</v-icon
                                    >
                                    Edit
                                  </v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="softDeleteNote(n)">
                                  <v-list-item-title class="text-error">
                                    <v-icon
                                      size="small"
                                      class="mr-1"
                                      color="error"
                                      >mdi-delete</v-icon
                                    >
                                    Delete
                                  </v-list-item-title>
                                </v-list-item>
                              </v-list>
                            </v-menu>
                          </div>
                        </div>
                        <div v-if="n.isDeleted" class="chat-text deleted">
                          This message was deleted
                        </div>
                        <div v-else>
                          <div
                            v-if="editingKey && editingKey === noteKey(n)"
                            class="edit-area"
                          >
                            <v-textarea
                              v-model="editingText"
                              rows="2"
                              auto-grow
                              variant="outlined"
                              class="custom-input"
                              :counter="500"
                              maxlength="500"
                            />
                            <div class="d-flex justify-end mt-2 gap-2">
                              <v-btn
                                size="small"
                                variant="text"
                                @click="cancelEdit"
                                >Cancel</v-btn
                              >
                              <v-btn
                                size="small"
                                color="black"
                                variant="elevated"
                                :loading="savingEdit"
                                :disabled="!editingText.trim()"
                                @click="saveEdit(n)"
                                >Save</v-btn
                              >
                            </div>
                          </div>
                          <div v-else class="chat-text">{{ n.text }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-medium-emphasis">No notes yet.</div>

                  <!-- Append note input (Admin and Agency) -->
                  <div
                    v-if="
                      userType === 'Admin' ||
                      userType === 'Super Admin' ||
                      isAgencyUser
                    "
                    class="chat-input mt-4"
                  >
                    <v-textarea
                      v-model="newNote"
                      placeholder="Write a note..."
                      variant="outlined"
                      class="custom-input"
                      :counter="500"
                      maxlength="500"
                      rows="2"
                      auto-grow
                    />
                    <div class="d-flex justify-end mt-2">
                      <v-btn
                        color="black"
                        variant="elevated"
                        :disabled="!newNote || savingNote"
                        :loading="savingNote"
                        @click="appendNote"
                      >
                        <v-icon start>mdi-send</v-icon>
                        Send
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Request Document Dialog -->
    <div
      v-if="showQuoteDialog"
      class="quote-overlay"
      @click.self="showQuoteDialog = false"
    >
      <div class="quote-dialog">
        <!-- colored card behind -->
        <div class="quote-dialog-bg"></div>
        <!-- main white card -->
        <div class="quote-dialog-inner">
          <button class="quote-close" @click="showQuoteDialog = false">
            &times;
          </button>

          <div class="quote-icon">
            <v-icon>mdi-file-pdf-box</v-icon>
          </div>

          <h2 class="quote-title">Request Document</h2>
          <p class="quote-subtitle">
            {{ currentQuoteName || entry.quoteFileName }}
          </p>

          <div
            v-if="currentQuoteURL || entry.quoteFileURL"
            class="pdf-container"
          >
            <div class="pdf-controls">
              <button class="zoom-btn" @click="zoomOut">-</button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="zoom-btn" @click="zoomIn">+</button>
            </div>
            <div
              class="pdf-wrapper"
              :style="{ transform: `scale(${zoomLevel})` }"
            >
              <iframe
                :src="currentQuoteURL || entry.quoteFileURL"
                width="100%"
                height="400"
                frameborder="0"
                class="pdf-iframe"
              />
            </div>
          </div>
          <div v-else class="no-pdf-message">
            <v-icon color="error" size="48">mdi-file-pdf-box</v-icon>
            <p>PDF file not available</p>
          </div>

          <div class="quote-actions">
            <button
              class="quote-button secondary"
              @click="showQuoteDialog = false"
            >
              Close
            </button>
            <button
              v-if="currentQuoteURL || entry.quoteFileURL"
              class="quote-button primary"
              @click="openInNewTab"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCustomDialogs } from "@/composables/useCustomDialogs";
import { db } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { useAppStore } from "@/stores/app";
import { useAuditTrail } from "@/composables/useAuditTrail";

export default {
  name: "ViewMaintenancePage",
  setup() {
    const { showErrorDialog, showConfirmDialog, showSuccessDialog } =
      useCustomDialogs();
    const { logAuditEvent, auditActions, resourceTypes } = useAuditTrail();
    return {
      showErrorDialog,
      showConfirmDialog,
      showSuccessDialog,
      logAuditEvent,
      auditActions,
      resourceTypes,
    };
  },
  computed: {
    isAgencyUser() {
      const appStore = useAppStore();
      const user = appStore.currentUser;
      return (
        user?.userType === "Agency" ||
        (user?.userType === "Admin" && user?.adminScope === "agency")
      );
    },
    isSuperAdmin() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType === "Super Admin";
    },
    userType() {
      const appStore = useAppStore();
      return appStore.currentUser?.userType;
    },
    currentUserId() {
      const appStore = useAppStore();
      return appStore.userId;
    },

    sortedNotes() {
      const notes = this.entry?.notesLog || [];
      // Oldest at top, newest at bottom
      return [...notes].sort((a, b) => {
        const ad = a.timestamp?.toDate
          ? a.timestamp.toDate()
          : new Date(a.timestamp || 0);
        const bd = b.timestamp?.toDate
          ? b.timestamp.toDate()
          : new Date(b.timestamp || 0);
        return ad - bd;
      });
    },
  },
  data() {
    return {
      activeTab: "details",
      entry: {},
      loading: true,
      error: null,
      showQuoteDialog: false,
      zoomLevel: 1,
      newNote: "",
      savingNote: false,
      editingKey: null,
      editingText: "",
      savingEdit: false,
      updatingStatus: false,
      currentQuoteURL: "",
      currentQuoteName: "",
    };
  },
  async mounted() {
    document.title = "Maintenance Entry Details - Depsure";
    const entryId = this.$route.params.id;
    this.loadEntry(entryId);
  },
  methods: {
    openRequest(doc) {
      try {
        this.currentQuoteURL = doc?.fileURL || "";
        this.currentQuoteName = doc?.fileName || "";
        if (this.currentQuoteURL) this.showQuoteDialog = true;
      } catch {}
    },
    goBack() {
      try {
        const appStore = useAppStore();
        const user = appStore.currentUser;
        const isAgency =
          user?.userType === "Agency" ||
          (user?.userType === "Admin" && user?.adminScope === "agency");
        if (isAgency) {
          this.$router.push("/onboard-units");
          return;
        }
      } catch (_) {}
      const from = this.$route?.query?.from;
      if (from === "onboard") this.$router.push("/onboard-units");
      else this.$router.push("/maintenance");
    },
    scrollNotesToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatLog;
        if (el && el.scrollHeight != null) {
          el.scrollTop = el.scrollHeight;
        }
      });
    },
    startEdit(note) {
      this.editingKey = this.noteKey(note);
      this.editingText = String(note.text || "");
    },
    cancelEdit() {
      this.editingKey = null;
      this.editingText = "";
    },
    noteKey(n) {
      try {
        if (n?.id) return `id:${n.id}`;
        const t = n?.timestamp?.toDate
          ? n.timestamp.toDate().getTime()
          : new Date(n?.timestamp || 0).getTime();
        const aid = n?.authorId || "";
        const txt = String(n?.text || "");
        return `legacy:${aid}:${t}:${txt.length}:${txt.slice(0, 8)}`;
      } catch (_) {
        return `legacy:${Math.random().toString(36).slice(2, 8)}`;
      }
    },
    findNoteIndexByIdOrMatch(list, target) {
      if (!Array.isArray(list)) return -1;
      if (target.id) {
        const i = list.findIndex((n) => n && n.id === target.id);
        if (i !== -1) return i;
      }
      const tA = target.timestamp?.toDate
        ? target.timestamp.toDate().getTime()
        : new Date(target.timestamp || 0).getTime();
      const txt = String(target.text || "");
      const aid = target.authorId || "";
      for (let i = list.length - 1; i >= 0; i--) {
        const n = list[i] || {};
        const nT = n.timestamp?.toDate
          ? n.timestamp.toDate().getTime()
          : new Date(n.timestamp || 0).getTime();
        if (
          n.id && !target.id
            ? false
            : String(n.text || "") === txt &&
              (n.authorId || "") === aid &&
              nT === tA
        )
          return i;
      }
      return -1;
    },
    async saveEdit(target) {
      if (!this.entry?.id) return;
      const newText = this.editingText.trim();
      if (!newText) return;
      try {
        this.savingEdit = true;
        const list = Array.isArray(this.entry.notesLog)
          ? [...this.entry.notesLog]
          : [];
        const idx = this.findNoteIndexByIdOrMatch(list, target);
        if (idx === -1) throw new Error("Note not found");
        const old = list[idx] || {};
        list[idx] = {
          ...old,
          text: newText,
          isEdited: true,
          editedAt: new Date(),
          id:
            old.id || Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        };
        await updateDoc(doc(db, "maintenance", this.entry.id), {
          notesLog: list,
          updatedAt: serverTimestamp(),
        });
        this.entry.notesLog = list;
        this.cancelEdit();
      } catch (e) {
        console.error("Error editing note:", e);
        this.showErrorDialog(
          "Failed to edit note. Please try again.",
          "Error",
          "OK"
        );
      } finally {
        this.savingEdit = false;
      }
    },
    async softDeleteNote(target) {
      if (!this.entry?.id) return;
      try {
        await this.showConfirmDialog({
          title: "Delete message?",
          message: "This message will be shown as deleted.",
          confirmText: "Delete",
          cancelText: "Cancel",
          color: "#dc3545",
        });
      } catch (_) {
        return;
      }
      try {
        const list = Array.isArray(this.entry.notesLog)
          ? [...this.entry.notesLog]
          : [];
        const idx = this.findNoteIndexByIdOrMatch(list, target);
        if (idx === -1) throw new Error("Note not found");
        const old = list[idx] || {};
        list[idx] = {
          ...old,
          isDeleted: true,
          deletedAt: new Date(),
          id:
            old.id || Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        };
        await updateDoc(doc(db, "maintenance", this.entry.id), {
          notesLog: list,
          updatedAt: serverTimestamp(),
        });
        this.entry.notesLog = list;
      } catch (e) {
        console.error("Error deleting note:", e);
        this.showErrorDialog(
          "Failed to delete note. Please try again.",
          "Error",
          "OK"
        );
      }
    },
    formatDate(value) {
      if (!value) return "Not available";
      try {
        const d = value?.toDate ? value.toDate() : new Date(value);
        return d.toLocaleDateString();
      } catch (_) {
        return String(value);
      }
    },
    noteInitials(name) {
      const raw = String(name || "").trim();
      if (!raw) return "?";
      const words = raw.split(/\s+/).filter(Boolean);
      if (words.length === 1) {
        const cleaned = words[0].replace(/[^A-Za-z0-9]/g, "");
        if (!cleaned) return "?";
        return cleaned.slice(0, 2).toUpperCase();
      }
      const first = words[0] && words[0][0] ? words[0][0] : "";
      const second = words[1] && words[1][0] ? words[1][0] : "";
      const res = (first + second).trim();
      return res ? res.toUpperCase() : "?";
    },
    async loadEntry(entryId) {
      try {
        const docRef = doc(db, "maintenance", entryId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          this.entry = {
            id: docSnap.id,
            unitName: data.unitName || "",
            unitNumber: data.unitNumber || "",
            contactPerson: data.contactPerson || "",
            contactPersonNumber:
              data.contactPersonNumber || data.contactNumber || "",
            estimatedCost: data.estimatedCost || 0,
            notes: data.notes || "",
            notesLog: data.notesLog || [],
            quoteFileName: data.quoteFileName || "",
            quoteFileURL: data.quoteFileURL || "",
            quotes: data.quotes || [],
            createdAt: data.createdAt?.toDate() || data.createdAt,
            updatedAt: data.updatedAt?.toDate() || data.updatedAt,
          };
          this.loading = false;
          this.scrollNotesToBottom();
        } else {
          this.error = "Maintenance entry not found";
          this.loading = false;
        }
      } catch (error) {
        console.error("Error loading maintenance entry:", error);
        this.error = "Failed to load maintenance entry";
        this.loading = false;
      }
    },

    editEntry() {
      this.$router.push(`/edit-maintenance-${this.entry.id}`);
    },

    async deleteEntry() {
      try {
        await this.showConfirmDialog({
          title: "Delete Maintenance Entry?",
          message:
            "Are you sure you want to delete this maintenance entry? This action cannot be undone. After deletion, upload any related quotes or invoices to the unit documents.",
          confirmText: "Delete",
          cancelText: "Cancel",
          color: "#dc3545",
        });
      } catch (_) {
        return;
      }

      try {
        await deleteDoc(doc(db, "maintenance", this.entry.id));

        await this.logAuditEvent(
          this.auditActions.DELETE,
          {
            maintenanceId: this.entry.id,
            unitName: this.entry.unitName,
            deletedBy: "Super Admin",
          },
          this.resourceTypes.MAINTENANCE,
          this.entry.id
        );

        this.showSuccessDialog(
          "Maintenance entry deleted successfully! Remember to upload related quotes or invoices to the unit documents.",
          "Deleted",
          "OK",
          "/maintenance"
        );
      } catch (error) {
        console.error("Error deleting maintenance entry:", error);
        this.showErrorDialog(
          "Failed to delete maintenance entry. Please try again.",
          "Error",
          "OK"
        );
      }
    },

    openInNewTab() {
      const url = this.currentQuoteURL || this.entry.quoteFileURL;
      if (url) window.open(url, "_blank");
    },
    async updateStatus() {
      if (this.userType !== "Admin") return;
      try {
        this.updatingStatus = true;
        const docRef = doc(db, "maintenance", this.entry.id);
        await updateDoc(docRef, {
          status: this.entry.status,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating status:", error);
        this.showErrorDialog(
          "Failed to update status. Please try again.",
          "Error",
          "OK"
        );
      } finally {
        this.updatingStatus = false;
      }
    },
    formatNoteDate(ts) {
      try {
        if (!ts) return "Just now";
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString();
      } catch (_) {
        return String(ts);
      }
    },
    async appendNote() {
      if (!this.newNote || !this.entry?.id) return;
      try {
        this.savingNote = true;
        const appStore = useAppStore();
        const currentUser = appStore.currentUser;
        const isAgency =
          currentUser?.userType === "Agency" ||
          (currentUser?.userType === "Admin" &&
            currentUser?.adminScope === "agency");

        // Get proper author name based on user type
        let authorName = "Unknown User";
        if (isAgency) {
          authorName =
            currentUser?.agencyName || this.entry?.unitName || "Property";
        } else {
          // For regular users, use firstName + lastName or fallback to email
          if (currentUser?.firstName && currentUser?.lastName) {
            authorName = `${currentUser.firstName} ${currentUser.lastName}`;
          } else if (currentUser?.firstName) {
            authorName = currentUser.firstName;
          } else if (currentUser?.lastName) {
            authorName = currentUser.lastName;
          } else if (currentUser?.email) {
            authorName = currentUser.email;
          }
        }

        const note = {
          id: Date.now() + "_" + Math.random().toString(36).slice(2, 8),
          text: this.newNote,
          authorId: appStore.userId || currentUser?.uid || "",
          authorName: authorName,
          authorType: appStore.userType || currentUser?.userType || "",
          authorAvatarUrl: isAgency
            ? this.entry?.agencyProfileImageUrl ||
              this.entry?.profileImageUrl ||
              currentUser?.profileImageUrl ||
              currentUser?.profileImage ||
              ""
            : currentUser?.profileImageUrl || currentUser?.profileImage || "",
          timestamp: new Date(),
          isEdited: false,
          isDeleted: false,
        };

        await updateDoc(doc(db, "maintenance", this.entry.id), {
          notesLog: arrayUnion(note),
          updatedAt: serverTimestamp(),
        });

        if (!this.entry.notesLog) this.entry.notesLog = [];
        this.entry.notesLog.push(note);
        this.newNote = "";
        this.scrollNotesToBottom();
      } catch (e) {
        console.error("Error adding note:", e);
        this.showErrorDialog(
          "Failed to add note. Please try again.",
          "Error",
          "OK"
        );
      } finally {
        this.savingNote = false;
      }
    },

    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel += 0.1;
      }
    },

    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel -= 0.1;
      }
    },
  },
};
</script>

<style scoped>
.view-maintenance-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling */
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

/* Title section */
.title-section {
  background: black;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 0;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
}

/* Form card */
.form-card {
  background: white;
  border-radius: 0 0 12px 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.custom-input .v-field {
  border-radius: 8px;
}

.custom-input :deep(.v-field__input) {
  padding: 10px !important;
}

.custom-input :deep(.v-field__outline) {
  border-color: #e9ecef !important;
}

/* Chat-like notes styling (structured like example) */
.notes-section {
  margin-top: 8px;
}
.chat-log {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0;
}
.chat-message {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.chat-message.mine {
  flex-direction: row-reverse;
}
.chat-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #6b7280;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
}
.chat-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.chat-bubble {
  max-width: 55%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  background: #f2f4f7;
  color: #111;
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.chat-message.mine .chat-bubble {
  background: #000;
  color: #fff;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}
.chat-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chat-author {
  font-weight: 700;
  font-size: 0.8rem;
  opacity: 0.95;
}
.chat-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-left: 8px;
}
.chat-edited {
  font-size: 0.7rem;
  opacity: 0.7;
}
.chat-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.35;
  text-align: center;
}
.chat-text.deleted {
  font-style: italic;
  opacity: 0.75;
}
.edit-area {
  background: #000;
  border-radius: 10px;
  padding: 6px;
}
.edit-area :deep(.v-field) {
}
.edit-area :deep(.v-field__input) {
}
.edit-area :deep(.v-field__outline) {
  border-color: #444 !important;
}
.chat-input :deep(.v-field__input) {
  min-height: 44px;
}

.edit-btn {
  width: 160px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #333 !important;
  transform: translateY(-1px);
}

.delete-btn {
  width: 160px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: #dc3545 !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background-color: #c82333 !important;
  transform: translateY(-1px);
}

.update-status-btn {
  width: 160px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.update-status-btn:hover {
  transform: translateY(-1px);
}

/* Document action buttons styling */
.existing-quotes {
  margin-top: 16px;
}

.existing-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.quote-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quote-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.quote-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.quote-name {
  flex: 1;
  font-weight: 500;
  color: #333;
  margin-left: 8px;
}

.doc-action-btn {
  margin-left: 8px;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
  min-width: 90px;
  height: 36px;
  border: 2px solid #000 !important;
  transition: all 0.3s ease;
}

.doc-action-btn:hover {
  background-color: #000 !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* View Quote Button */
.view-quote-btn {
  width: 240px;
  height: 44px;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  background-color: black !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  margin-right: 12px;
}

.view-quote-btn:hover {
  background-color: #333 !important;
  transform: translateY(-1px);
}

/* Quote Dialog - NotificationDialog Style */
.quote-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.quote-dialog {
  position: relative;
  width: 600px;
  max-width: 90vw;
  min-height: 500px;
}

.quote-dialog-bg {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 96%;
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  background-color: #000000;
}

.quote-dialog-inner {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.quote-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  color: #666;
}

.quote-close:hover {
  color: #333;
}

.quote-icon {
  position: relative;
  margin: 0 auto 24px auto;
  margin-top: -14%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInCircle 0.3s ease-out forwards;
  background-color: #000000;
}

.quote-icon .v-icon {
  font-size: 40px;
  color: #ffffff;
}

.quote-icon::before {
  content: "";
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.2;
  animation: pulse 2s ease-in-out infinite;
  background-color: #000000;
}

@keyframes fadeInCircle {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.quote-title {
  font-size: 2em;
  margin: 0 0 8px 0;
  color: #333;
}

.quote-subtitle {
  font-size: 1.1em;
  margin: 0 0 24px 0;
  color: #666;
  word-break: break-all;
}

.pdf-container {
  width: 100%;
  margin: 0 0 24px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.zoom-btn {
  background-color: #000000;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.zoom-btn:hover {
  background-color: #333;
}

.zoom-level {
  font-weight: 600;
  color: #333;
  min-width: 50px;
  text-align: center;
}

.pdf-wrapper {
  transform-origin: top center;
  transition: transform 0.3s ease;
  overflow: auto;
  max-height: 400px;
}

.pdf-iframe {
  border: none;
  width: 100%;
  height: 400px;
  display: block;
}

.no-pdf-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
  margin: 0 0 24px 0;
}

.no-pdf-message p {
  margin-top: 16px;
  font-size: 1.1rem;
}

.quote-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.quote-button {
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1em;
  padding: 12px 24px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.quote-button.secondary {
  background-color: #666;
}

.quote-button.primary {
  background-color: #000000;
}

.quote-button:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .view-maintenance-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .back-btn {
    width: 140px;
    height: 40px;
  }
}
/* Tabs styling */
.property-tabs {
  background-color: #f8f9fa;
}

.property-tabs :deep(.tab-label) {
  font-weight: 500;
  text-transform: none;
  transition: color 0.2s ease;
}

.property-tabs :deep(.tab-label.v-tab--selected) {
  font-weight: 600;
  background-color: white;
}

.property-tabs :deep(.v-tabs-slider) {
  background-color: #000000 !important;
}

.property-tabs :deep(.tab--details) {
  color: #1e88e5;
}

.property-tabs :deep(.tab--details.v-tab--selected) {
  color: #0d47a1;
}

.property-tabs :deep(.tab--documents) {
  color: #fb8c00;
}

.property-tabs :deep(.tab--documents.v-tab--selected) {
  color: #ef6c00;
}

.property-tabs :deep(.tab--notes) {
  color: #43a047;
}

.property-tabs :deep(.tab--notes.v-tab--selected) {
  color: #1b5e20;
}

.property-tabs :deep(.tab--archive) {
  color: #8e24aa;
}

.property-tabs :deep(.tab--archive.v-tab--selected) {
  color: #5e35b1;
}
</style>
