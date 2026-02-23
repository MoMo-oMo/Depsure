<template>
  <div class="view-agency-page">
    <v-container fluid>
      <!-- Back Button only -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-btn
            class="back-btn"
            color="primary"
            icon="mdi-arrow-left"
            variant="outlined"
            @click="$router.push('/agencies')"
          >
            Back
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State with Skeleton -->
      <div v-if="loading">
        <!-- Skeleton for Agency Info Card -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card class="agency-info-card-black skeleton-card">
              <v-row align="stretch" class="no-gutters">
                <v-col class="pa-0 ma-0" cols="12" md="3">
                  <v-skeleton-loader
                    class="agency-logo-black"
                    height="100%"
                    type="image"
                  />
                </v-col>
                <v-col class="pa-4" cols="12" md="9">
                  <v-skeleton-loader class="mb-4" type="heading" />
                  <div class="agency-details-black">
                    <v-skeleton-loader
                      v-for="i in 4"
                      :key="i"
                      class="mb-2"
                      type="list-item-two-line"
                    />
                  </div>
                  <v-divider class="my-4 bg-white" />
                  <v-skeleton-loader class="mt-4" type="paragraph" />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Skeleton for Properties Table -->
        <v-row>
          <v-col class="pa-4" cols="12">
            <v-card class="table-card">
              <v-skeleton-loader class="mb-4" type="table-heading" />
              <v-skeleton-loader
                v-for="i in 5"
                :key="i"
                class="mb-2"
                type="table-row"
              />
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Agency Information Card - Animated -->
      <v-row v-else class="mb-6">
        <v-col cols="12">
          <v-card
            class="agency-info-card-black"
            :class="{ 'card-loaded': animationReady }"
          >
            <!-- Black background base -->
            <div class="agency-unified-bg" />
            <!-- Logo rendered in the right column to avoid overlap -->
            <!-- Content overlay -->
            <div class="agency-content-overlay">
              <v-row class="no-gutters">
                <!-- Left content area -->
                <v-col class="agency-content-left" cols="12" md="7">
                  <div
                    ref="contentWrapper"
                    class="agency-content-wrapper"
                    :style="contentWrapperInlineStyle"
                  >
                    <v-card-title
                      class="agency-title text-white text-h3 mb-4"
                      :class="{ 'title-animated': animationReady }"
                    >{{ agency.agencyName }}</v-card-title>
                    <v-card-text class="text-white">
                      <div class="agency-details-black">
                        <div
                          class="detail-item-black"
                          :class="{ 'detail-animated': animationReady }"
                          style="animation-delay: 0.2s"
                        >
                          <v-icon
                            class="mr-3 text-white"
                            icon="mdi-map-marker"
                            size="20"
                          />
                          <span class="detail-text">{{
                            agency.address || "Address not provided"
                          }}</span>
                        </div>
                        <div
                          class="detail-item-black"
                          :class="{ 'detail-animated': animationReady }"
                          style="animation-delay: 0.4s"
                        >
                          <v-icon
                            class="mr-3 text-white"
                            icon="mdi-card-account-details"
                            size="20"
                          />
                          <span class="detail-text">Reg No: {{ agency.regNo || "—" }}</span>
                        </div>
                        <div
                          class="detail-item-black"
                          :class="{ 'detail-animated': animationReady }"
                          style="animation-delay: 0.6s"
                        >
                          <v-icon
                            class="mr-3 text-white"
                            icon="mdi-account"
                            size="20"
                          />
                          <span class="detail-text">Primary Contact:
                            {{ agency.primaryContactName || "N/A" }}</span>
                        </div>
                        <div
                          class="detail-item-black"
                          :class="{ 'detail-animated': animationReady }"
                          style="animation-delay: 0.8s"
                        >
                          <v-icon
                            class="mr-3 text-white"
                            icon="mdi-phone"
                            size="20"
                          />
                          <span class="detail-text">{{
                            agency.contactNumber || "N/A"
                          }}</span>
                        </div>
                        <div
                          class="detail-item-black"
                          :class="{ 'detail-animated': animationReady }"
                          style="animation-delay: 1s"
                        >
                          <v-icon
                            class="mr-3 text-white"
                            icon="mdi-email"
                            size="20"
                          />
                          <span class="detail-text">{{
                            agency.email || "N/A"
                          }}</span>
                        </div>
                      </div>
                      <!-- Divider removed to avoid thin line between details and notes -->
                      <p
                        v-if="agency.notes"
                        class="agency-description-black"
                        :class="{ 'description-animated': animationReady }"
                        style="animation-delay: 1.4s"
                      >
                        {{ agency.notes }}
                      </p>
                    </v-card-text>
                  </div>
                </v-col>
                <!-- Right side - Logo area -->
                <v-col class="agency-logo-section" cols="12" md="5">
                  <div
                    ref="logoEl"
                    class="agency-logo-square"
                    :style="agencyLogoStyle"
                  />
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search Section -->

      <!-- Info-only: no table or actions below -->
    </v-container>
  </div>
</template>

<script>
  import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
  } from 'firebase/firestore'
  import { useCustomDialogs } from '@/composables/useCustomDialogs'
  import { db } from '@/firebaseConfig'
  import { useAppStore } from '@/stores/app'

  export default {
    name: 'ViewAgencyPage',
    setup () {
      const { showConfirmDialog } = useCustomDialogs()
      return { showConfirmDialog }
    },
    data () {
      return {
        agency: {},
        loading: false,
        animationReady: false,
        contentRightReservePx: 0,
        contentMaxWidthPx: 0,
      }
    },
    computed: {
      agencyCardBgStyle () {
        const profileImageUrl
          = this.agency?.profileImageUrl || this.agency?.profileImage
        if (profileImageUrl) {
          return {
            backgroundImage: `url(${profileImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }
        }
        // Fallback to a default background if no profile image
        return {
          backgroundImage:
            'url(https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      },

      agencyLogoStyle () {
        const urlCandidate
          = this.agency?.profileImageUrl
            || this.agency?.profileImage
            || this.agency?.logoUrl
            || this.agency?.logo
            || this.agency?.agencyLogo
            || this.agency?.imageUrl

        const logoUrl
          = urlCandidate
            && typeof urlCandidate === 'string'
            && urlCandidate.trim().length > 0
            ? urlCandidate
            : null

        const backgroundImage = logoUrl
          ? `url(${logoUrl})`
          : 'url(https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg)'

        return {
          backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      },

      contentWrapperInlineStyle () {
        const style = {}
        if (this.contentRightReservePx > 0) {
          style.paddingRight = `${this.contentRightReservePx}px`
        }
        if (this.contentMaxWidthPx > 0) {
          style.maxWidth = `${this.contentMaxWidthPx}px`
        }
        return style
      },
    },
    async mounted () {
      // Set the page title for the app bar
      document.title = 'Agency Details - Depsure'

      // Get agency ID from route params
      const agencyId = this.$route.params.id
      if (agencyId) {
        console.log('Loading agency with ID:', agencyId)
        await this.fetchAgencyData(agencyId)
      } else {
        console.error('No agency ID provided in route')
      }

      // Recompute on resize
      this._depsureResizeHandler = () => this.updateContentSpacing()
      window.addEventListener('resize', this._depsureResizeHandler, {
        passive: true,
      })

      // Observe size changes for dynamic updates
      if (typeof ResizeObserver !== 'undefined') {
        this._depsureResizeObserver = new ResizeObserver(() =>
          this.updateContentSpacing(),
        )
        if (this.$refs.logoEl)
          this._depsureResizeObserver.observe(this.$refs.logoEl)
        if (this.$refs.contentWrapper)
          this._depsureResizeObserver.observe(this.$refs.contentWrapper)
        const cardEl = this.$el?.querySelector?.('.agency-info-card-black')
        if (cardEl) this._depsureResizeObserver.observe(cardEl)
      }
    },
    beforeUnmount () {
      if (this._depsureResizeHandler) {
        window.removeEventListener('resize', this._depsureResizeHandler)
      }
      if (this._depsureResizeObserver) {
        try {
          this._depsureResizeObserver.disconnect()
        } catch {}
      }
    },
    methods: {
      getOptimalBackgroundSize () {
        // This function determines the best background size for the logo
        // based on common logo aspect ratios and container dimensions
        const profileImageUrl
          = this.agency?.profileImageUrl || this.agency?.profileImage

        if (!profileImageUrl) return 'contain'

        // For logos, we typically want to:
        // 1. Use 'contain' for square logos to show the full logo
        // 2. Use 'cover' for wide logos to fill the space
        // 3. Use 'contain' for tall logos to prevent cropping

        // Since we can't easily detect image dimensions without loading the image,
        // we'll use a smart approach based on common logo patterns

        // Check if the URL suggests it's a logo (common logo file patterns)
        const logoPatterns = [
          'logo',
          'brand',
          'icon',
          'symbol',
          'mark',
          'emblem',
        ]

        const isLikelyLogo = logoPatterns.some(pattern =>
          profileImageUrl.toLowerCase().includes(pattern),
        )

        if (isLikelyLogo) {
          // For likely logos, use contain to show the full logo
          return 'contain'
        }

        // For other images, use cover to fill the space nicely
        return 'cover'
      },

      updateContentSpacing () {
        try {
          const logoEl = this.$refs.logoEl
          const wrapperEl = this.$refs.contentWrapper
          const cardEl
            = wrapperEl && wrapperEl.closest
              ? wrapperEl.closest('.agency-info-card-black')
              : null
          if (!logoEl || !wrapperEl || !cardEl) {
            this.contentRightReservePx = 0
            this.contentMaxWidthPx = 0
            return
          }

          const cardRect = cardEl.getBoundingClientRect()
          const logoRect = logoEl.getBoundingClientRect()
          const wrapperRect = wrapperEl.getBoundingClientRect()

          // Compute overlap-based reserve (legacy safeguard)
          const horizontalOverlap = wrapperRect.right - logoRect.left
          if (horizontalOverlap > 0) {
            const reserve = Math.min(
              horizontalOverlap + 16,
              cardRect.width * 0.6,
            )
            this.contentRightReservePx = Math.max(0, Math.round(reserve))
          } else {
            this.contentRightReservePx = 0
          }

          // Compute an early wrap max-width so text breaks before reaching the logo column
          const available = Math.max(
            0,
            Math.floor(logoRect.left - wrapperRect.left - 24),
          )
          this.contentMaxWidthPx = Math.max(available, 0)
        } catch {
          this.contentRightReservePx = 0
          this.contentMaxWidthPx = 0
        }
      },

      openMonthPicker () {
        const el = this.$refs.monthInput?.$el?.querySelector('input')
        if (el) {
          if (typeof el.showPicker === 'function') el.showPicker()
          else el.focus()
        }
      },
      getCurrentMonth () {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}`
      },
      filterProperties () {
        const queryStr = (this.searchQuery || '').toString().toLowerCase()
        const properties = Array.isArray(this.properties) ? this.properties : []
        this.filteredProperties = properties.filter(property => {
          // Text search filter (safe access)
          const getLc = v => (v == null ? '' : String(v)).toLowerCase()
          const textMatch
            = getLc(property.tenantRef).includes(queryStr)
              || getLc(property.propertyName).includes(queryStr)
              || getLc(property.newOccupation).includes(queryStr)
              || getLc(property.contractorRequested).includes(queryStr)
              || getLc(property.paidOut).includes(queryStr)

          // Month filter - now filtering by createdAt date
          if (this.monthFilter) {
            // Handle Firestore Timestamp objects
            let propertyDate
            if (property.createdAt && property.createdAt.toDate) {
              // Firestore Timestamp object
              propertyDate = property.createdAt.toDate()
            } else if (property.createdAt) {
              // Regular Date object or date string
              propertyDate = new Date(property.createdAt)
            } else {
              // No createdAt date, skip this property
              return textMatch
            }

            const filterDate = new Date(this.monthFilter + '-01')
            const propertyMonth = `${propertyDate.getFullYear()}-${String(
              propertyDate.getMonth() + 1,
            ).padStart(2, '0')}`
            const filterMonth = `${filterDate.getFullYear()}-${String(
              filterDate.getMonth() + 1,
            ).padStart(2, '0')}`

            return textMatch && propertyMonth === filterMonth
          }

          return textMatch
        })
      },
      viewProperty (property) {
        console.log('Viewing property:', property)
        // Navigate to property details page
        this.$router.push(`/view-property-${property.id}`)
      },
      editProperty (property) {
        console.log('Editing property:', property)
        // Navigate to edit property page
        this.$router.push(`/edit-property-${property.id}`)
      },
      async deleteProperty (property) {
        console.log('Deleting property:', property)
        try {
          await this.showConfirmDialog({
            title: 'Delete property?',
            message: `Are you sure you want to delete property ${property.tenantRef}?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            color: '#dc3545',
          })
        } catch {
          return
        }
        const index = this.properties.findIndex(p => p.id === property.id)
        if (index !== -1) {
          this.properties.splice(index, 1)
          this.filterProperties() // Refresh filtered list
        }
      },
      addUnit () {
        console.log('Adding new unit')
        // Navigate to add unit page with agency ID
        this.$router.push(`/add-unit?agencyId=${this.agency.id}`)
      },

      async fetchProperties (agencyId) {
        this.propertiesLoading = true
        try {
          // Query units collection for properties belonging to this agency
          const unitsQuery = query(
            collection(db, 'units'),
            where('agencyId', '==', agencyId),
          )

          const querySnapshot = await getDocs(unitsQuery)
          this.properties = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          // Apply initial filtering
          this.filterProperties()
          console.log('Properties fetched for agency:', this.properties)
        } catch (error) {
          console.error('Error fetching properties:', error)
        } finally {
          this.propertiesLoading = false
        }
      },

      async fetchAgencyData (agencyId) {
        this.loading = true
        try {
          const appStore = useAppStore()
          const currentUser = appStore.currentUser
          const userType = currentUser?.userType

          // Check if user has permission to view this agency
          if (userType === 'Agency' && currentUser.uid !== agencyId) {
            console.error('Agency user can only view their own agency')
            this.$router.push('/active-units')
            return
          }

          const agencyDoc = await getDoc(doc(db, 'users', agencyId))

          if (agencyDoc.exists()) {
            const agencyData = agencyDoc.data()
            this.agency = {
              id: agencyDoc.id,
              ...agencyData,
            }
            console.log('Agency data loaded:', this.agency)

            // Fetch properties for this agency
            await this.fetchProperties(agencyId)
          } else {
            console.error('Agency not found')
          // Handle agency not found - could redirect to 404 or show error
          }
        } catch (error) {
          console.error('Error fetching agency data:', error)
        } finally {
          this.loading = false
          // Trigger animation after a short delay to ensure DOM is ready
          setTimeout(() => {
            this.animationReady = true
            this.$nextTick(() => this.updateContentSpacing())
          }, 200)
        }
      },
    },
  }
</script>

<style scoped>
/* Black background base */
.agency-unified-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Layered black gradient with subtle diagonal stripes and shadow */
  background:
    /* soft vertical vignette */ radial-gradient(
      120% 80% at 30% 20%,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0) 60%
    ),
    /* diagonal stripes */
      repeating-linear-gradient(
        -45deg,
        rgba(255, 255, 255, 0.06) 0px,
        rgba(255, 255, 255, 0.06) 2px,
        rgba(0, 0, 0, 0) 2px,
        rgba(0, 0, 0, 0) 10px
      ),
    /* base gradient */
      linear-gradient(135deg, #0a0a0a 0%, #141414 45%, #0a0a0a 100%);
  box-shadow: inset 0 10px 30px rgba(0, 0, 0, 0.6),
    inset 0 -10px 30px rgba(0, 0, 0, 0.6);
  z-index: 0;
}

/* Right logo area container */
.agency-logo-section {
  padding: 0;
  height: 100%;
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

/* Logo square inside right column */
.agency-logo-square {
  height: 100%;
  width: 100%;
  border-radius: 0;
  background-size: auto 100%;
  background-position: right center;
  background-repeat: no-repeat;
  will-change: transform, opacity;
}

.agency-info-card-black {
  position: relative;
  overflow: hidden;
}

.agency-content-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.agency-info-card-black .no-gutters,
.agency-info-card-black .v-row {
  position: relative;
  z-index: 1;
  height: 100%;
}

/* Left content area */
.agency-content-left {
  display: flex;
  align-items: center;
  padding: 0;
  height: 100%;
  position: relative;
  z-index: 2;
}

.agency-content-wrapper {
  padding: 40px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Right logo area */
.agency-logo-section {
  padding: 0;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  z-index: 1;
}
.agency-title {
  display: block;
  margin: 0 0 16px;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  line-height: 1.2;
  width: 100%;
  max-width: 100%;
  font-weight: 700;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  color: #ffd700; /* Gold color like in the image */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.view-agency-page {
  padding: 20px;
  min-height: 100vh;
}

/* Back button styling to match system buttons */
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

/* Table card styling - less curved */
.table-card {
  border-radius: 6px !important;
}

/* Main card styling */
.agency-info-card-black {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  color: white;
  padding: 0;
  min-height: 450px;
  position: relative;
}

/* Remove row/column gutters so the image sits flush with the top/edges */
.no-gutters {
  --v-gutter-x: 0;
  --v-gutter-y: 0;
  margin: 0 !important;
}

/* Make the image fill its column completely with no top padding */
.agency-logo-black {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Right-side details */
.agency-details-black {
  margin-bottom: 10px;
}

.detail-item-black {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #ffffff;
  min-height: 36px;
  padding: 8px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.detail-text {
  font-weight: 600;
  line-height: 1.35;
  color: #f0f0f0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.agency-description-black {
  font-size: 1rem;
  line-height: 1.5;
  color: #e0e0e0;
  margin: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Search field styling to match agency page */
.custom-input .v-field {
  border-radius: 8px;
}

.search-field {
  max-width: 300px;
}

/* Action Button Styling */
.action-btn {
  margin: 0 4px;
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

/* Custom table header styling - black headers */
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

/* Skeleton Loading Styles */
.skeleton-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%) !important;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.v-skeleton-loader) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.v-skeleton-loader__bone) {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%
  ) !important;
  animation: skeleton-loading 1.5s infinite !important;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .agency-logo-square {
    width: 80%;
    max-width: 360px;
    min-width: 200px;
    margin: 0 auto;
  }

  .agency-title {
    font-size: 2rem;
    line-height: 1.25;
  }

  .agency-content-left {
    height: 60%;
  }

  .agency-logo-section {
    height: 40%;
    justify-content: center;
  }

  .agency-content-wrapper {
    padding: 20px;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .view-agency-page {
    padding: 10px;
  }

  .search-field {
    max-width: 100%;
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

  /* Full-bleed image on mobile as well */
  .agency-logo-black {
    margin: 0;
    width: 100%;
    height: 220px; /* give it a nice visible height when stacked */
    object-fit: cover;
  }
  .agency-content-right {
    width: 100%;
  }
}

/* Animation Styles */
.agency-info-card-black {
  transform: translateX(-100%);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.agency-info-card-black.card-loaded {
  transform: none;
  opacity: 1;
}

.agency-title {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.agency-title.title-animated {
  opacity: 1;
  transform: translateY(0);
}

.detail-item-black {
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.detail-item-black.detail-animated {
  opacity: 1;
  transform: translateX(0);
}

.v-divider.divider-animated {
  opacity: 0;
  transform: scaleX(0);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.v-divider.divider-animated {
  opacity: 1;
  transform: scaleX(1);
}

.agency-description-black {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.agency-description-black.description-animated {
  opacity: 1;
  transform: translateY(0);
}

/* Logo animation */
.agency-logo-square {
  opacity: 0;
  transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    transform 0.35s ease;
  transition-delay: 0.3s;
}

.card-loaded .agency-logo-square {
  opacity: 1;
}

.card-loaded .agency-logo-square:hover {
  transform: scale(1.03);
}

/* (gradient overlay removed) */
</style>
