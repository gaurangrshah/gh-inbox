/**
 * Notification Item Component - GitHub Style
 *
 * Matches GitHub's notification row with:
 * - Checkbox (left)
 * - Unread indicator (blue dot)
 * - Icon (colored by type)
 * - Repository name / Title
 * - Labels
 * - Timestamp (right)
 */

import { formatDistanceToNow } from 'date-fns'
import {
  GitPullRequest,
  CircleDot,
  MessageSquare,
  Tag,
  GitCommit,
  AlertTriangle,
  Shield,
} from 'lucide-react'
import type { GitHubNotification } from '../../types/github'

interface NotificationItemProps {
  notification: GitHubNotification
  isFocused?: boolean
  isChecked?: boolean
  isSelected?: boolean
  onClick?: () => void
  onToggleChecked?: () => void
}

/**
 * Get icon and color for notification type - GitHub's actual colors
 */
function getTypeInfo(type: string, reason: string) {
  // Security alerts get special treatment
  if (reason === 'security_alert') {
    return {
      icon: Shield,
      color: '#f85149', // danger red
    }
  }

  switch (type) {
    case 'PullRequest':
      return {
        icon: GitPullRequest,
        color: '#3fb950', // GitHub green for open PRs
      }
    case 'Issue':
      return {
        icon: CircleDot,
        color: '#3fb950', // GitHub green for open issues
      }
    case 'Release':
      return {
        icon: Tag,
        color: '#8b949e',
      }
    case 'Commit':
      return {
        icon: GitCommit,
        color: '#8b949e',
      }
    case 'Discussion':
      return {
        icon: MessageSquare,
        color: '#a371f7', // purple for discussions
      }
    case 'RepositoryVulnerabilityAlert':
      return {
        icon: AlertTriangle,
        color: '#d29922', // warning yellow
      }
    default:
      return {
        icon: CircleDot,
        color: '#8b949e',
      }
  }
}

/**
 * Get badge color for reason
 */
function getReasonBadge(reason: string): { bg: string; text: string; label: string } | null {
  const badges: Record<string, { bg: string; text: string; label: string }> = {
    security_alert: { bg: '#f8514926', text: '#f85149', label: 'security' },
    ci_activity: { bg: '#388bfd26', text: '#58a6ff', label: 'ci' },
    review_requested: { bg: '#a371f726', text: '#a371f7', label: 'review' },
    author: { bg: '#3fb95026', text: '#3fb950', label: 'author' },
    comment: { bg: '#8b949e26', text: '#8b949e', label: 'comment' },
  }
  return badges[reason] || null
}

/**
 * GitHub-style notification row
 */
export function NotificationItem({
  notification,
  isFocused = false,
  isChecked = false,
  isSelected = false,
  onClick,
  onToggleChecked,
}: NotificationItemProps) {
  const typeInfo = getTypeInfo(notification.subject.type, notification.reason)
  const TypeIcon = typeInfo.icon
  const relativeTime = formatDistanceToNow(new Date(notification.updated_at), {
    addSuffix: false,
  })
  const reasonBadge = getReasonBadge(notification.reason)

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#21262d] ${
        isSelected
          ? 'bg-[#1f6feb33] border-l-2 border-l-[#58a6ff]'
          : isFocused || isChecked
          ? 'bg-[#161b22]'
          : 'hover:bg-[#161b22]'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Notification: ${notification.subject.title}`}
      aria-selected={isSelected}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isChecked}
        readOnly
        className="w-4 h-4 rounded border-[#30363d] bg-transparent checked:bg-[#58a6ff] focus:ring-0 focus:ring-offset-0"
        onClick={(e) => {
          e.stopPropagation()
          onToggleChecked?.()
        }}
      />

      {/* Unread Indicator */}
      <div className="w-2 flex-shrink-0">
        {notification.unread && (
          <div className="w-2 h-2 rounded-full bg-[#58a6ff]" />
        )}
      </div>

      {/* Type Icon */}
      <TypeIcon
        size={16}
        className="flex-shrink-0"
        style={{ color: typeInfo.color }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {/* Repository name */}
        <span className="text-sm font-medium text-[#8b949e] flex-shrink-0">
          {notification.repository.full_name}
        </span>

        {/* Title */}
        <span
          className={`text-sm truncate ${
            notification.unread
              ? 'text-[#e6edf3] font-medium'
              : 'text-[#8b949e]'
          }`}
        >
          {notification.subject.title}
        </span>

        {/* Reason Badge */}
        {reasonBadge && (
          <span
            className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: reasonBadge.bg,
              color: reasonBadge.text,
            }}
          >
            {reasonBadge.label}
          </span>
        )}
      </div>

      {/* Timestamp & Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-[#8b949e]">{relativeTime}</span>

        {/* Repository owner avatar (if available) */}
        {notification.repository.owner && (
          <img
            src={notification.repository.owner.avatar_url}
            alt=""
            className="w-5 h-5 rounded-full"
          />
        )}
      </div>
    </div>
  )
}
