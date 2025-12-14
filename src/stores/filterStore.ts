/**
 * Filter and grouping preferences store using Zustand
 * Manages notification filtering and display preferences
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotificationReason } from '../types/github'

// Re-export for backward compatibility
export type { NotificationReason } from '../types/github'

export type GroupByOption = 'none' | 'repo' | 'date' | 'reason'
export type SortOrder = 'newest' | 'oldest' | 'updated'

interface FilterState {
  // Filters
  selectedRepos: string[]
  selectedReasons: NotificationReason[]
  showUnreadOnly: boolean
  showParticipating: boolean

  // Grouping and sorting
  groupBy: GroupByOption
  sortOrder: SortOrder

  // Actions
  setRepoFilter: (repos: string[]) => void
  setReasonFilter: (reasons: NotificationReason[]) => void
  setUnreadOnly: (unreadOnly: boolean) => void
  toggleUnreadOnly: () => void
  toggleParticipating: () => void
  setGroupBy: (groupBy: GroupByOption) => void
  setSortOrder: (sortOrder: SortOrder) => void
  resetFilters: () => void
}

const initialState = {
  selectedRepos: [],
  selectedReasons: [],
  showUnreadOnly: false,
  showParticipating: false,
  groupBy: 'none' as GroupByOption,
  sortOrder: 'newest' as SortOrder,
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initialState,

      setRepoFilter: (repos) => set({ selectedRepos: repos }),

      setReasonFilter: (reasons) => set({ selectedReasons: reasons }),

      setUnreadOnly: (unreadOnly) => set({ showUnreadOnly: unreadOnly }),

      toggleUnreadOnly: () =>
        set((state) => ({ showUnreadOnly: !state.showUnreadOnly })),

      toggleParticipating: () =>
        set((state) => ({ showParticipating: !state.showParticipating })),

      setGroupBy: (groupBy) => set({ groupBy }),

      setSortOrder: (sortOrder) => set({ sortOrder }),

      resetFilters: () => set(initialState),
    }),
    {
      name: 'github-inbox-filters',
    }
  )
)
