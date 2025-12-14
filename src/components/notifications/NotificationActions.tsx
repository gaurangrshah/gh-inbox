/**
 * Notification Actions Component
 *
 * Action buttons for notifications: mark read, open, unsubscribe
 */

import { Check, ExternalLink, BellOff } from 'lucide-react'
import type { GitHubNotification } from '../../types/github'

interface NotificationActionsProps {
  notification: GitHubNotification
  onMarkAsRead: () => void
  onOpen: () => void
  onUnsubscribe: () => void
}

/**
 * Action buttons for notification management
 *
 * @param notification - Notification data
 * @param onMarkAsRead - Mark as read handler
 * @param onOpen - Open in browser handler
 * @param onUnsubscribe - Unsubscribe handler
 */
export function NotificationActions({
  notification,
  onMarkAsRead,
  onOpen,
  onUnsubscribe,
}: NotificationActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Mark as Read */}
      {notification.unread && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMarkAsRead()
          }}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Mark as read"
          aria-label="Mark as read"
        >
          <Check size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Open in Browser */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Open in GitHub"
        aria-label="Open in GitHub"
      >
        <ExternalLink size={16} className="text-gray-600 dark:text-gray-400" />
      </button>

      {/* Unsubscribe */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onUnsubscribe()
        }}
        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Unsubscribe"
        aria-label="Unsubscribe from thread"
      >
        <BellOff size={16} className="text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  )
}
