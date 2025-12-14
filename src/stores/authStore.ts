/**
 * Authentication store using Zustand
 *
 * Manages user authentication state and GitHub token.
 * In Tauri: Token stored securely in OS keychain
 * In browser: Token stored in localStorage (fallback)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storeToken, getToken, deleteToken, isTauri } from '../lib/tauri'

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  email: string | null
}

interface AuthState {
  token: string | null
  user: GitHubUser | null
  isAuthenticated: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: GitHubUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      /**
       * Initialize auth state from secure storage (Tauri keychain)
       * Called on app startup
       */
      initialize: async () => {
        if (get().isInitialized) return

        try {
          // In Tauri, load token from keychain
          if (isTauri()) {
            const token = await getToken()
            if (token) {
              set({ token, isAuthenticated: true, isInitialized: true })
              return
            }
            // No token in keychain - reset auth state (fixes stale isAuthenticated from localStorage)
            set({ token: null, isAuthenticated: false, isInitialized: true })
            return
          }
          // In browser, token should already be loaded from localStorage persistence
          // Just mark as initialized
          set({ isInitialized: true })
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          set({ token: null, isAuthenticated: false, isInitialized: true })
        }
      },

      /**
       * Log in with GitHub PAT
       * Stores token securely in keychain (Tauri) or localStorage (browser)
       */
      login: async (token: string) => {
        try {
          await storeToken(token)
          set({ token, isAuthenticated: true })
        } catch (error) {
          console.error('Failed to store token:', error)
          // Still set in memory even if storage fails
          set({ token, isAuthenticated: true })
        }
      },

      /**
       * Log out and clear token from secure storage
       */
      logout: async () => {
        try {
          await deleteToken()
        } catch (error) {
          console.error('Failed to delete token:', error)
        }
        set({ token: null, user: null, isAuthenticated: false })
      },

      setUser: (user: GitHubUser) => {
        set({ user })
      },
    }),
    {
      name: 'github-inbox-auth',
      // In Tauri, don't persist token to localStorage (use keychain instead)
      // Only persist user info and auth state flag
      partialize: (state) => {
        if (isTauri()) {
          return {
            user: state.user,
            isAuthenticated: state.isAuthenticated,
          }
        }
        // In browser, persist everything
        return {
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }
      },
    }
  )
)
