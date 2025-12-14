/**
 * UI state store using Zustand
 * Manages UI preferences and ephemeral UI state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  selectedNotificationId: string | null
  settingsPanelOpen: boolean

  // Settings
  pollingInterval: number // in seconds
  perPage: number

  // Actions
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
  selectNotification: (id: string | null) => void
  openSettingsPanel: () => void
  closeSettingsPanel: () => void
  setPollingInterval: (interval: number) => void
  setPerPage: (perPage: number) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default to dark mode
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      selectedNotificationId: null,
      settingsPanelOpen: false,

      // Settings defaults
      pollingInterval: 60, // 60 seconds
      perPage: 50,

      setTheme: (theme) => {
        set({ theme })
        // Update document class for Tailwind dark mode
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      openCommandPalette: () =>
        set({ commandPaletteOpen: true }),

      closeCommandPalette: () =>
        set({ commandPaletteOpen: false }),

      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      selectNotification: (id) =>
        set({ selectedNotificationId: id }),

      openSettingsPanel: () =>
        set({ settingsPanelOpen: true }),

      closeSettingsPanel: () =>
        set({ settingsPanelOpen: false }),

      setPollingInterval: (interval) =>
        set({ pollingInterval: Math.max(30, Math.min(300, interval)) }), // Clamp 30-300s

      setPerPage: (perPage) =>
        set({ perPage: Math.max(10, Math.min(100, perPage)) }), // Clamp 10-100
    }),
    {
      name: 'github-inbox-ui',
      // Persist theme, sidebar, and settings preferences
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        pollingInterval: state.pollingInterval,
        perPage: state.perPage,
      }),
      // Apply theme to document when store rehydrates from localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  )
)
