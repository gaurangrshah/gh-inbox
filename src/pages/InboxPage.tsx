/**
 * Inbox Page - GitHub Style
 *
 * Main notification management interface
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, CheckCheck, MoreHorizontal } from 'lucide-react'
import { useMarkAsRead, useNotificationsInfinite, useMarkAllAsRead, useUnsubscribe } from '../hooks/useNotifications'
import { useFilterStore } from '../stores/filterStore'
import { NotificationList } from '../components/notifications/NotificationList'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import type { GitHubNotification } from '../types/github'

/**
 * Filter notifications based on current filter settings
 */
function filterNotifications(
  notifications: GitHubNotification[],
  filters: {
    showUnreadOnly: boolean
    showParticipating: boolean
    selectedRepos: string[]
    selectedReasons: string[]
    searchQuery?: string
  }
) {
  const q = (filters.searchQuery ?? '').trim().toLowerCase()

  return notifications.filter((notification) => {
    if (filters.showUnreadOnly && !notification.unread) {
      return false
    }
    if (
      filters.selectedRepos.length > 0 &&
      !filters.selectedRepos.includes(notification.repository.full_name)
    ) {
      return false
    }
    if (
      filters.selectedReasons.length > 0 &&
      !filters.selectedReasons.includes(notification.reason)
    ) {
      return false
    }

    if (q) {
      const repo = notification.repository.full_name.toLowerCase()
      const reason = notification.reason.toLowerCase()
      const subjectTitle = (notification.subject.title ?? '').toLowerCase()
      const subjectType = (notification.subject.type ?? '').toLowerCase()

      const haystack = `${repo} ${reason} ${subjectType} ${subjectTitle}`
      if (!haystack.includes(q)) return false
    }

    return true
  })
}

/**
 * GitHub-style inbox page
 */
export default function InboxPage() {
  const {
    showUnreadOnly,
    showParticipating,
    selectedRepos,
    selectedReasons,
    setUnreadOnly,
    setAvailableRepos,
  } = useFilterStore()

  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const selectAllRef = useRef<HTMLInputElement | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [autoLoadMore, setAutoLoadMore] = useState(() => {
    try {
      return localStorage.getItem('autoLoadMore') === '1'
    } catch {
      return false
    }
  })

  const markAsReadMutation = useMarkAsRead()
  const unsubscribeMutation = useUnsubscribe()

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '/',
        description: 'Focus search',
        handler: () => {
          searchInputRef.current?.focus()
        },
      },
    ],
  })

  useEffect(() => {
    try {
      localStorage.setItem('autoLoadMore', autoLoadMore ? '1' : '0')
    } catch {
      // ignore
    }
  }, [autoLoadMore])

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsInfinite({
    participating: showParticipating,
  })

  const notifications = useMemo(
    () => data?.pages?.flat() ?? [],
    [data]
  )

  // Derive repository list for sidebar (respect unread + reason filters, but not repo filter itself)
  const availableRepos = useMemo(() => {
    const base = filterNotifications(notifications, {
      showUnreadOnly,
      showParticipating,
      selectedRepos: [],
      selectedReasons,
    })

    const map = new Map<string, { totalCount: number; unreadCount: number }>()
    for (const n of base) {
      const key = n.repository.full_name
      const prev = map.get(key) || { totalCount: 0, unreadCount: 0 }
      prev.totalCount += 1
      if (n.unread) prev.unreadCount += 1
      map.set(key, prev)
    }

    const list = Array.from(map.entries()).map(([full_name, counts]) => ({
      full_name,
      ...counts,
    }))

    // Sort: unread desc, then total desc, then name
    list.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount
      if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount
      return a.full_name.localeCompare(b.full_name)
    })

    return list.slice(0, 200)
  }, [notifications, showUnreadOnly, showParticipating, selectedReasons])

  useEffect(() => {
    setAvailableRepos(availableRepos)
  }, [availableRepos, setAvailableRepos])

  const markAllAsReadMutation = useMarkAllAsRead()

  const filteredNotifications = useMemo(
    () =>
      filterNotifications(notifications, {
        showUnreadOnly,
        showParticipating,
        selectedRepos,
        selectedReasons,
        searchQuery,
      }),
    [notifications, showUnreadOnly, showParticipating, selectedRepos, selectedReasons, searchQuery]
  )

  const unreadCount = filteredNotifications.filter((n) => n.unread).length

  // Keep selection constrained to the current visible (filtered) list
  useEffect(() => {
    const visible = new Set(filteredNotifications.map((n) => n.id))
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev
      const next = new Set<string>()
      for (const id of prev) {
        if (visible.has(id)) next.add(id)
      }
      return next.size === prev.size ? prev : next
    })
  }, [filteredNotifications])

  const allVisibleSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((n) => selectedIds.has(n.id))
  const someVisibleSelected =
    !allVisibleSelected && filteredNotifications.some((n) => selectedIds.has(n.id))

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected
    }
  }, [someVisibleSelected])

  const toggleSelected = (threadId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(threadId)) next.delete(threadId)
      else next.add(threadId)
      return next
    })
  }

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(filteredNotifications.map((n) => n.id)))
  }

  const clearSelection = () => setSelectedIds(new Set())

  const bulkMarkAsRead = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    for (const id of ids) {
      await markAsReadMutation.mutateAsync(id)
    }
    clearSelection()
  }

  const bulkUnsubscribe = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!confirm(`Unsubscribe from ${ids.length} thread${ids.length === 1 ? '' : 's'}?`)) return

    for (const id of ids) {
      await unsubscribeMutation.mutateAsync(id)
    }
    clearSelection()
  }

  const handleMarkAllAsRead = () => {
    if (confirm(`Mark all ${unreadCount} notifications as read?`)) {
      markAllAsReadMutation.mutate()
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#0d1117' }}>
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load notifications'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#0d1117' }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0d1117' }}>
      {/* GitHub-style Toolbar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        {/* Left side - Select all & Actions */}
        <div className="flex items-center gap-4">
          {/* Select all */}
          <label className="flex items-center gap-2 text-sm text-[#8b949e] select-none">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
              disabled={filteredNotifications.length === 0}
              className="w-4 h-4 rounded border-[#30363d] bg-transparent checked:bg-[#58a6ff] focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
              aria-label="Select all visible notifications"
            />
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : ''}
          </label>

          {/* View toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUnreadOnly(false)}
              className={`text-sm ${
                !showUnreadOnly ? 'text-[#e6edf3]' : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUnreadOnly(true)}
              className={`text-sm ${
                showUnreadOnly ? 'text-[#e6edf3]' : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              Unread
            </button>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => void bulkMarkAsRead()}
                disabled={markAsReadMutation.isPending}
                className="px-2.5 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50"
                style={{ borderColor: '#30363d' }}
              >
                Mark read
              </button>
              <button
                onClick={() => void bulkUnsubscribe()}
                disabled={unsubscribeMutation.isPending}
                className="px-2.5 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50"
                style={{ borderColor: '#30363d' }}
              >
                Unsubscribe
              </button>
              <button
                onClick={clearSelection}
                className="px-2.5 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d]"
                style={{ borderColor: '#30363d' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]"
            />
            <input
              type="text"
              placeholder="Search notifications"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (searchQuery) {
                    e.preventDefault()
                    setSearchQuery('')
                  } else {
                    ;(e.currentTarget as HTMLInputElement).blur()
                  }
                }
              }}
              className="w-full pl-10 pr-4 py-1.5 text-sm rounded-md border bg-[#0d1117] text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
              style={{ borderColor: '#30363d' }}
            />
          </div>
        </div>

        {/* Right side - Group by & Actions */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8b949e]">
            Group by: <button className="text-[#58a6ff] hover:underline">Date</button>
          </span>

          <label className="flex items-center gap-2 text-sm text-[#8b949e] select-none">
            <input
              type="checkbox"
              checked={autoLoadMore}
              onChange={(e) => setAutoLoadMore(e.target.checked)}
              className="w-4 h-4 rounded border-[#30363d] bg-transparent checked:bg-[#58a6ff] focus:ring-0 focus:ring-offset-0"
            />
            Auto-load
          </label>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50"
              style={{ borderColor: '#30363d' }}
            >
              <CheckCheck size={14} />
              Done
            </button>
          )}

          <button
            className="p-1.5 rounded-md hover:bg-[#21262d]"
            aria-label="More options"
          >
            <MoreHorizontal size={16} className="text-[#8b949e]" />
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="px-4 py-2 text-xs text-[#8b949e] flex items-center justify-between"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <span>
          {filteredNotifications.length === 0
            ? 'No notifications'
            : `${filteredNotifications.length} notification${
                filteredNotifications.length === 1 ? '' : 's'
              }`}
          {unreadCount > 0 && ` · ${unreadCount} unread`}
        </span>
        <span className="text-[#6e7681]">
          Prefer Triaje notifications on the go with GitHub Mobile for{' '}
          <a href="#" className="text-[#58a6ff] hover:underline">iOS</a> or{' '}
          <a href="#" className="text-[#58a6ff] hover:underline">Android</a>
        </span>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          <NotificationList
            notifications={filteredNotifications}
            isLoading={isLoading}
            onRefresh={() => refetch()}
            selectedIds={selectedIds}
            onToggleSelected={toggleSelected}
            autoLoadMore={autoLoadMore}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage()
              }
            }}
          />
        </div>

        {hasNextPage && (
          <div
            className="px-4 py-3 flex items-center justify-center"
            style={{ borderTop: '1px solid #21262d' }}
          >
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-3 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50"
              style={{ borderColor: '#30363d' }}
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
