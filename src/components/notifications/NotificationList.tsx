/**
 * Notification List Component
 *
 * Virtualized list of notifications with keyboard navigation
 */

import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import type { GitHubNotification } from '../../types/github'
import { NotificationItem } from './NotificationItem'
import { NotificationActions } from './NotificationActions'
import { useMarkAsRead, useUnsubscribe } from '../../hooks/useNotifications'
import { useNotificationKeyboardNav } from '../../hooks/useKeyboardShortcuts'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { EmptyState } from '../ui/EmptyState'
import { apiUrlToWebUrl, openInNewTab } from '../../lib/utils/url'

interface NotificationListProps {
  notifications: GitHubNotification[]
  isLoading?: boolean
  onRefresh: () => void
  selectedIds: Set<string>
  onToggleSelected: (threadId: string) => void
  autoLoadMore?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

/**
 * Get the web URL for a notification
 */
function getNotificationUrl(notification: GitHubNotification): string {
  return apiUrlToWebUrl(notification.subject.url, notification.repository.html_url)
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
  selectedIds,
  onToggleSelected,
  autoLoadMore = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: NotificationListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const loadMoreArmedRef = useRef(true)

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
        openInNewTab(getNotificationUrl(notification))
      }
    },
    onRefresh,
  })

  // Optional auto-load-more when the user scrolls near the end of the list
  useEffect(() => {
    if (!autoLoadMore) return
    if (!hasNextPage) return
    if (!onLoadMore) return

    const el = parentRef.current
    if (!el) return

    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return
      if (!loadMoreArmedRef.current) return

      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
      if (remaining < 600) {
        loadMoreArmedRef.current = false
        onLoadMore()
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [autoLoadMore, hasNextPage, isFetchingNextPage, onLoadMore])

  useEffect(() => {
    if (!isFetchingNextPage) {
      loadMoreArmedRef.current = true
    }
  }, [isFetchingNextPage])

  const handleMarkAsRead = (notification: GitHubNotification) => {
    markAsReadMutation.mutate(notification.id)
  }

  const handleOpen = (notification: GitHubNotification) => {
    openInNewTab(getNotificationUrl(notification))
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
                  isFocused={selectedIndex === virtualRow.index}
                  isChecked={selectedIds.has(notification.id)}
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev === virtualRow.index ? -1 : virtualRow.index
                    )
                  }
                  onToggleChecked={() => onToggleSelected(notification.id)}
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
