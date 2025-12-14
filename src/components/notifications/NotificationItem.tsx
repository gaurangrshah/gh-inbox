/**
 * Notification Item Component
 *
 * Individual notification display with:
 * - Repository name
 * - Title
 * - Type icon (Issue=purple, PR=green, Release=blue, etc.)
 * - Reason badge
 * - Relative timestamp
 * - Unread indicator
 */

import { formatDistanceToNow } from 'date-fns'
import {
  GitPullRequest,
  Circle,
  MessageSquare,
  Tag,
  GitCommit,
  CheckCircle,
} from 'lucide-react'
import type { GitHubNotification } from '../../types/github'
import { Badge } from '../ui/Badge'
import { NOTIFICATION_REASON_LABELS } from '../../lib/constants'

interface NotificationItemProps {
  notification: GitHubNotification
  isSelected?: boolean
  onClick?: () => void
}

/**
 * Get icon and color for notification type
 */
function getTypeInfo(type: string) {
  switch (type) {
    case 'PullRequest':
      return {
        icon: GitPullRequest,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
      }
    case 'Issue':
      return {
        icon: Circle,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      }
    case 'Release':
      return {
        icon: Tag,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      }
    case 'Commit':
      return {
        icon: GitCommit,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      }
    case 'Discussion':
      return {
        icon: MessageSquare,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      }
    default:
      return {
        icon: CheckCircle,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      }
  }
}

/**
 * Individual notification item
 *
 * @param notification - Notification data
 * @param isSelected - Whether this notification is selected
 * @param onClick - Click handler
 */
export function NotificationItem({
  notification,
  isSelected = false,
  onClick,
}: NotificationItemProps) {
  const typeInfo = getTypeInfo(notification.subject.type)
  const TypeIcon = typeInfo.icon
  const relativeTime = formatDistanceToNow(new Date(notification.updated_at), {
    addSuffix: true,
  })

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
      } ${
        notification.unread
          ? 'bg-white dark:bg-gray-900'
          : 'bg-gray-50/50 dark:bg-gray-950/50 opacity-75'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Notification: ${notification.subject.title}`}
    >
      {/* Unread Indicator */}
      {notification.unread && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {/* Type Icon */}
      <div className={`flex-shrink-0 p-2 rounded ${typeInfo.bgColor}`}>
        <TypeIcon size={18} className={typeInfo.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Repository */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {notification.repository.full_name}
          </span>
          <Badge variant="secondary" size="sm">
            {NOTIFICATION_REASON_LABELS[notification.reason] || notification.reason}
          </Badge>
        </div>

        {/* Title */}
        <h3
          className={`text-sm mb-1 line-clamp-2 ${
            notification.unread
              ? 'font-medium text-gray-900 dark:text-gray-100'
              : 'font-normal text-gray-700 dark:text-gray-300'
          }`}
        >
          {notification.subject.title}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <span>{notification.subject.type}</span>
          <span>•</span>
          <time dateTime={notification.updated_at}>{relativeTime}</time>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {/* Action buttons will be added here */}
      </div>
    </div>
  )
}
