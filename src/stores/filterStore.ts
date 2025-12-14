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

export interface AvailableRepo {
  full_name: string
  totalCount: number
  unreadCount: number
}

interface FilterState {
  // Filters
  selectedRepos: string[]
  selectedReasons: NotificationReason[]
  showUnreadOnly: boolean
  showParticipating: boolean
  availableRepos: AvailableRepo[]

  // Grouping and sorting
  groupBy: GroupByOption
  sortOrder: SortOrder

  // Actions
  setRepoFilter: (repos: string[]) => void
  setReasonFilter: (reasons: NotificationReason[]) => void
  setUnreadOnly: (unreadOnly: boolean) => void
  setAvailableRepos: (repos: AvailableRepo[]) => void
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
  availableRepos: [] as AvailableRepo[],
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

      setAvailableRepos: (repos) => set({ availableRepos: repos }),

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
      partialize: (state) => ({
        selectedRepos: state.selectedRepos,
        selectedReasons: state.selectedReasons,
        showUnreadOnly: state.showUnreadOnly,
        showParticipating: state.showParticipating,
        groupBy: state.groupBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
)
