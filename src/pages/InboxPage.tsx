/**
 * Inbox Page
 *
 * Main notification management interface with filtering and grouping
 */

import { useMemo } from 'react'
import { useNotifications, useMarkAllAsRead } from '../hooks/useNotifications'
import { useFilterStore } from '../stores/filterStore'
import { NotificationList } from '../components/notifications/NotificationList'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { CheckCheck } from 'lucide-react'
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
    // Unread filter
    if (filters.showUnreadOnly && !notification.unread) {
      return false
    }

    // Repository filter
    if (
      filters.selectedRepos.length > 0 &&
      !filters.selectedRepos.includes(notification.repository.full_name)
    ) {
      return false
    }

    // Reason filter
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
 * Main inbox page
 */
export default function InboxPage() {
  const { showUnreadOnly, showParticipating, selectedRepos, selectedReasons } =
    useFilterStore()

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useNotifications({
    participating: showParticipating,
  })

  const markAllAsReadMutation = useMarkAllAsRead()

  // Apply filters
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load notifications'}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // Loading state (initial load only)
  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredNotifications.length === 0
                ? 'No notifications'
                : `${filteredNotifications.length} notification${
                    filteredNotifications.length === 1 ? '' : 's'
                  }`}
              {unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck size={16} />
              Mark all as read
            </Button>
          )}
        </div>
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
