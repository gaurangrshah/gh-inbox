/**
 * Inbox Page - GitHub Style
 *
 * Main notification management interface with bulk actions,
 * keyboard shortcuts, and error handling.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, CheckCheck, Loader2, AlertCircle, CheckCircle2, X, PanelRightClose, Settings } from 'lucide-react'
import { useMarkAsRead, useNotificationsInfinite, useMarkAllAsRead, useUnsubscribe } from '../hooks/useNotifications'
import { useFilterStore } from '../stores/filterStore'
import { useUIStore } from '../stores/uiStore'
import { NotificationList } from '../components/notifications/NotificationList'
import { NotificationPreview } from '../components/notifications/NotificationPreview'
import { SettingsPanel } from '../components/settings/SettingsPanel'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { openInNewTab, apiUrlToWebUrl } from '../lib/utils/url'
import type { GitHubNotification } from '../types/github'

/** Toast notification state */
interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

/** Bulk action progress state */
interface BulkActionState {
  isRunning: boolean
  action: 'mark-read' | 'unsubscribe' | null
  total: number
  completed: number
  errors: string[]
}

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

  const {
    pollingInterval,
    perPage,
    openSettingsPanel,
  } = useUIStore()

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

  // Toast notifications for user feedback
  const [toasts, setToasts] = useState<Toast[]>([])

  // Bulk action progress tracking
  const [bulkState, setBulkState] = useState<BulkActionState>({
    isRunning: false,
    action: null,
    total: 0,
    completed: 0,
    errors: [],
  })

  // Preview pane state - only show when a notification is selected
  const [previewNotification, setPreviewNotification] = useState<GitHubNotification | null>(null)

  const markAsReadMutation = useMarkAsRead()
  const unsubscribeMutation = useUnsubscribe()

  /** Add a toast notification */
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, type, message }])
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  /** Dismiss a toast */
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('autoLoadMore', autoLoadMore ? '1' : '0')
    } catch {
      // ignore
    }
  }, [autoLoadMore])

  // Keyboard shortcuts for bulk actions and navigation
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '/',
        description: 'Focus search',
        handler: () => {
          searchInputRef.current?.focus()
        },
      },
      {
        key: 'a',
        description: 'Select all visible',
        handler: () => {
          if (filteredNotifications.length > 0) {
            setSelectedIds(new Set(filteredNotifications.map((n) => n.id)))
          }
        },
      },
      {
        key: 'Escape',
        description: 'Clear selection',
        handler: () => {
          if (selectedIds.size > 0) {
            clearSelection()
          }
        },
      },
      {
        key: 'e',
        description: 'Mark selected as read',
        handler: () => {
          if (selectedIds.size > 0 && !bulkState.isRunning) {
            void bulkMarkAsRead()
          }
        },
      },
      {
        key: 'u',
        description: 'Unsubscribe from selected',
        handler: () => {
          if (selectedIds.size > 0 && !bulkState.isRunning) {
            void bulkUnsubscribe()
          }
        },
      },
      {
        key: 'p',
        description: 'Close preview pane',
        handler: () => {
          setPreviewNotification(null)
        },
      },
    ],
  })

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsInfinite({
    params: { participating: showParticipating },
    pollingInterval,
    perPage,
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

  // Clear preview notification when it's no longer in the filtered list
  useEffect(() => {
    if (!previewNotification) return
    const stillVisible = filteredNotifications.some((n) => n.id === previewNotification.id)
    if (!stillVisible) {
      setPreviewNotification(null)
    }
  }, [filteredNotifications, previewNotification])

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

  /**
   * Parse GitHub API error for user-friendly message
   */
  const parseError = (err: unknown): string => {
    if (err instanceof Error) {
      const msg = err.message.toLowerCase()
      if (msg.includes('rate limit') || msg.includes('403')) {
        return 'Rate limit exceeded. Please wait a moment.'
      }
      if (msg.includes('401') || msg.includes('unauthorized')) {
        return 'Authentication failed. Please check your token.'
      }
      if (msg.includes('404') || msg.includes('not found')) {
        return 'Notification not found (may have been deleted).'
      }
      return err.message
    }
    return 'An unexpected error occurred'
  }

  /**
   * Bulk mark as read with progress tracking
   */
  const bulkMarkAsRead = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (bulkState.isRunning) return

    setBulkState({
      isRunning: true,
      action: 'mark-read',
      total: ids.length,
      completed: 0,
      errors: [],
    })

    const errors: string[] = []
    let completed = 0

    for (const id of ids) {
      try {
        await markAsReadMutation.mutateAsync(id)
      } catch (err) {
        errors.push(parseError(err))
      }
      completed++
      setBulkState((prev) => ({ ...prev, completed, errors }))
    }

    setBulkState({
      isRunning: false,
      action: null,
      total: 0,
      completed: 0,
      errors: [],
    })

    clearSelection()

    // Show result toast
    if (errors.length === 0) {
      addToast('success', `Marked ${ids.length} notification${ids.length === 1 ? '' : 's'} as read`)
    } else if (errors.length < ids.length) {
      addToast('info', `Marked ${ids.length - errors.length} as read, ${errors.length} failed`)
    } else {
      addToast('error', errors[0] || 'Failed to mark notifications as read')
    }
  }

  /**
   * Bulk unsubscribe with progress tracking
   */
  const bulkUnsubscribe = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (bulkState.isRunning) return
    if (!confirm(`Unsubscribe from ${ids.length} thread${ids.length === 1 ? '' : 's'}?`)) return

    setBulkState({
      isRunning: true,
      action: 'unsubscribe',
      total: ids.length,
      completed: 0,
      errors: [],
    })

    const errors: string[] = []
    let completed = 0

    for (const id of ids) {
      try {
        await unsubscribeMutation.mutateAsync(id)
      } catch (err) {
        errors.push(parseError(err))
      }
      completed++
      setBulkState((prev) => ({ ...prev, completed, errors }))
    }

    setBulkState({
      isRunning: false,
      action: null,
      total: 0,
      completed: 0,
      errors: [],
    })

    clearSelection()

    // Show result toast
    if (errors.length === 0) {
      addToast('success', `Unsubscribed from ${ids.length} thread${ids.length === 1 ? '' : 's'}`)
    } else if (errors.length < ids.length) {
      addToast('info', `Unsubscribed from ${ids.length - errors.length}, ${errors.length} failed`)
    } else {
      addToast('error', errors[0] || 'Failed to unsubscribe')
    }
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
    <div className="h-full flex flex-col min-h-0" style={{ backgroundColor: '#0d1117' }}>
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
                disabled={bulkState.isRunning}
                className="px-2.5 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50 flex items-center gap-1.5"
                style={{ borderColor: '#30363d' }}
                title="Keyboard: e"
              >
                {bulkState.isRunning && bulkState.action === 'mark-read' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {bulkState.completed}/{bulkState.total}
                  </>
                ) : (
                  'Mark read'
                )}
              </button>
              <button
                onClick={() => void bulkUnsubscribe()}
                disabled={bulkState.isRunning}
                className="px-2.5 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50 flex items-center gap-1.5"
                style={{ borderColor: '#30363d' }}
                title="Keyboard: u"
              >
                {bulkState.isRunning && bulkState.action === 'unsubscribe' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {bulkState.completed}/{bulkState.total}
                  </>
                ) : (
                  'Unsubscribe'
                )}
              </button>
              <button
                onClick={clearSelection}
                disabled={bulkState.isRunning}
                className="px-2.5 py-1.5 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50"
                style={{ borderColor: '#30363d' }}
                title="Keyboard: Escape"
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

          {previewNotification && (
            <button
              onClick={() => setPreviewNotification(null)}
              className="p-1.5 rounded-md hover:bg-[#21262d] bg-[#21262d]"
              aria-label="Close preview pane"
              title="Close preview (p)"
            >
              <PanelRightClose size={16} className="text-[#8b949e]" />
            </button>
          )}

          <button
            onClick={openSettingsPanel}
            className="p-1.5 rounded-md hover:bg-[#21262d]"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={16} className="text-[#8b949e]" />
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

      {/* Main content area with list and optional preview */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Notification List */}
        <div className={`flex-1 overflow-hidden flex flex-col min-h-0 ${previewNotification ? 'max-w-[60%]' : ''}`}>
          <div className="flex-1 overflow-hidden min-h-0">
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
              onSelectNotification={(notification) => {
                // Toggle: clicking same notification closes preview, clicking different opens it
                setPreviewNotification((prev) =>
                  prev?.id === notification.id ? null : notification
                )
              }}
              selectedNotificationId={previewNotification?.id}
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

        {/* Preview Pane - only shown when a notification is selected */}
        {previewNotification && (
          <div className="w-[40%] min-w-[300px] max-w-[500px]">
            <NotificationPreview
              notification={previewNotification}
              onClose={() => setPreviewNotification(null)}
              onMarkAsRead={(id) => {
                markAsReadMutation.mutate(id)
                addToast('success', 'Marked as read')
              }}
              onUnsubscribe={(id) => {
                if (confirm('Unsubscribe from this thread?')) {
                  unsubscribeMutation.mutate(id)
                  addToast('success', 'Unsubscribed')
                  setPreviewNotification(null)
                }
              }}
              onOpen={(notification) => {
                const url = apiUrlToWebUrl(notification.subject.url, notification.repository.html_url)
                openInNewTab(url)
              }}
              isMarkingRead={markAsReadMutation.isPending}
              isUnsubscribing={unsubscribeMutation.isPending}
            />
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-md shadow-lg text-sm max-w-sm animate-in slide-in-from-right ${
                toast.type === 'success'
                  ? 'bg-[#238636] text-white'
                  : toast.type === 'error'
                  ? 'bg-[#da3633] text-white'
                  : 'bg-[#1f6feb] text-white'
              }`}
              role="alert"
            >
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'info' && <AlertCircle size={16} />}
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="p-0.5 rounded hover:bg-white/20"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel
        autoLoadMore={autoLoadMore}
        onAutoLoadMoreChange={setAutoLoadMore}
      />
    </div>
  )
}
