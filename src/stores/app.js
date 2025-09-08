// Utilities
import { defineStore } from 'pinia'
import { auth, db } from '@/firebaseConfig'
import { signOut } from 'firebase/auth'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    // Global selected agency context
    currentAgency: null,
  }),

  getters: {
    userInfo: (state) => state.currentUser,
    isLoggedIn: (state) => state.isAuthenticated && state.currentUser !== null,
    userType: (state) => state.currentUser?.userType || null,
    userName: (state) => {
      const user = state.currentUser;
      if (!user) return 'Unknown User';
      
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
    userAvatar: (state) => state.currentUser?.profileImageUrl || 'https://i.pravatar.cc/100?img=5',
    userEmail: (state) => state.currentUser?.email || '',
    userId: (state) => state.currentUser?.uid || '',
    hasCurrentAgency: (state) => !!state.currentAgency,
    currentAgencyId: (state) => state.currentAgency?.id || null,
    currentAgencyName: (state) => state.currentAgency?.agencyName || null,
  },

  actions: {
    setUser(userData) {
      this.currentUser = userData;
      this.isAuthenticated = true;
      localStorage.setItem('userInfo', JSON.stringify(userData));
    },

    setCurrentAgency(agency) {
      // Accept either minimal {id, agencyName} or full agency object
      this.currentAgency = agency ? { ...agency } : null;
      if (agency) localStorage.setItem('currentAgency', JSON.stringify(this.currentAgency));
      else localStorage.removeItem('currentAgency');
    },

    clearCurrentAgency() {
      this.setCurrentAgency(null);
    },

    clearUser() {
      this.currentUser = null;
      this.isAuthenticated = false;
      localStorage.removeItem('userInfo');
      // Also clear any selected agency on logout
      this.clearCurrentAgency();
    },

    async logout() {
      try {
        await signOut(auth);
        this.clearUser();
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        return false;
      }
    },

    initializeAuth() {
      // Check if user data exists in localStorage
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const userData = JSON.parse(userInfo);
          this.setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          this.clearUser();
        }
      }

      // Restore selected agency if present
      const agencyInfo = localStorage.getItem('currentAgency');
      if (agencyInfo) {
        try {
          const agency = JSON.parse(agencyInfo);
          this.setCurrentAgency(agency);
        } catch (error) {
          console.error('Error parsing currentAgency:', error);
          this.clearCurrentAgency();
        }
      }
    },

    updateUserAvatar(imageUrl) {
      if (this.currentUser) {
        this.currentUser.profileImageUrl = imageUrl;
        localStorage.setItem('userInfo', JSON.stringify(this.currentUser));
      }
    }
  }
})
