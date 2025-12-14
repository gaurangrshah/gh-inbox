/**
 * Inbox Page - GitHub Style
 *
 * Main notification management interface
 */

import { useMemo } from 'react'
import { Search, CheckCheck, MoreHorizontal } from 'lucide-react'
import { useNotifications, useMarkAllAsRead } from '../hooks/useNotifications'
import { useFilterStore } from '../stores/filterStore'
import { NotificationList } from '../components/notifications/NotificationList'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
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
  }
) {
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
    return true
  })
}

/**
 * GitHub-style inbox page
 */
export default function InboxPage() {
  const { showUnreadOnly, showParticipating, selectedRepos, selectedReasons } =
    useFilterStore()

  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useNotifications({
    participating: showParticipating,
  })

  const markAllAsReadMutation = useMarkAllAsRead()

  const filteredNotifications = useMemo(
    () =>
      filterNotifications(notifications, {
        showUnreadOnly,
        showParticipating,
        selectedRepos,
        selectedReasons,
      }),
    [notifications, showUnreadOnly, showParticipating, selectedRepos, selectedReasons]
  )

  const unreadCount = filteredNotifications.filter((n) => n.unread).length

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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[#30363d] bg-transparent"
              aria-label="Select all"
            />
            <span className="text-sm text-[#e6edf3]">All</span>
          </div>

          {/* Unread filter */}
          <button className="text-sm text-[#8b949e] hover:text-[#e6edf3] flex items-center gap-1">
            Unread
          </button>
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
      <div className="flex-1 overflow-hidden">
        <NotificationList
          notifications={filteredNotifications}
          isLoading={isLoading}
          onRefresh={() => refetch()}
        />
      </div>
    </div>
  )
}
