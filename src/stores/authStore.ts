/**
 * Authentication store using Zustand
 * Manages user authentication state and GitHub token
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

  // Actions
  login: (token: string) => void
  logout: () => void
  setUser: (user: GitHubUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token: string) => {
        set({ token, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      setUser: (user: GitHubUser) => {
        set({ user })
      },
    }),
    {
      name: 'github-inbox-auth',
      // Only persist token and isAuthenticated
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
