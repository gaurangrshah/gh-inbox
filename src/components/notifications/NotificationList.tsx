/**
 * Notification List Component
 *
 * Virtualized list of notifications with keyboard navigation
 */

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useState } from 'react'
import type { GitHubNotification } from '../../types/github'
import { NotificationItem } from './NotificationItem'
import { NotificationActions } from './NotificationActions'
import { useMarkAsRead, useUnsubscribe } from '../../hooks/useNotifications'
import { useNotificationKeyboardNav } from '../../hooks/useKeyboardShortcuts'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'

interface NotificationListProps {
  notifications: GitHubNotification[]
  isLoading?: boolean
  onRefresh: () => void
}

/**
 * Virtualized list of notifications
 *
 * @param notifications - Array of notifications to display
 * @param isLoading - Loading state
 * @param onRefresh - Refresh handler
 */
export function NotificationList({
  notifications,
  isLoading = false,
  onRefresh,
}: NotificationListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const markAsReadMutation = useMarkAsRead()
  const unsubscribeMutation = useUnsubscribe()

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Number of items to render outside viewport
  })

  // Keyboard navigation
  useNotificationKeyboardNav({
    selectedIndex,
    setSelectedIndex,
    notifications,
    onMarkAsRead: (index) => {
      const notification = notifications[index]
      if (notification && notification.unread) {
        markAsReadMutation.mutate(notification.id)
      }
    },
    onOpen: (index) => {
      const notification = notifications[index]
      if (notification) {
        // Extract URL from subject.url (GitHub API format)
        // Convert API URL to web URL
        const htmlUrl = notification.subject.url
          ? notification.subject.url
              .replace('api.github.com/repos', 'github.com')
              .replace('/pulls/', '/pull/')
              .replace('/issues/', '/issues/')
          : notification.repository.html_url

        window.open(htmlUrl, '_blank', 'noopener,noreferrer')
      }
    },
    onRefresh,
  })

  const handleMarkAsRead = (notification: GitHubNotification) => {
    markAsReadMutation.mutate(notification.id)
  }

  const handleOpen = (notification: GitHubNotification) => {
    const htmlUrl = notification.subject.url
      ? notification.subject.url
          .replace('api.github.com/repos', 'github.com')
          .replace('/pulls/', '/pull/')
          .replace('/issues/', '/issues/')
      : notification.repository.html_url

    window.open(htmlUrl, '_blank', 'noopener,noreferrer')
  }

  const handleUnsubscribe = (notification: GitHubNotification) => {
    if (confirm('Unsubscribe from this thread?')) {
      unsubscribeMutation.mutate(notification.id)
    }
  }

  // Loading state
  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Empty state
  if (notifications.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      role="list"
      aria-label="Notifications"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const notification = notifications[virtualRow.index]

          return (
            <div
              key={notification.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="relative group">
                <NotificationItem
                  notification={notification}
                  isSelected={selectedIndex === virtualRow.index}
                  onClick={() => setSelectedIndex(virtualRow.index)}
                />

                {/* Action buttons overlay */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <NotificationActions
                    notification={notification}
                    onMarkAsRead={() => handleMarkAsRead(notification)}
                    onOpen={() => handleOpen(notification)}
                    onUnsubscribe={() => handleUnsubscribe(notification)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
