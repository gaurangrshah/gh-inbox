/**
 * Notification Preview Pane
 *
 * Displays detailed information about a selected notification
 * with actions to open in GitHub, mark as read, or unsubscribe.
 */

import { ExternalLink, Check, BellOff, GitPullRequest, GitCommit, CircleDot, Tag, MessageSquare, Shield, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { GitHubNotification, NotificationSubjectType, NotificationReason } from '../../types/github'

interface NotificationPreviewProps {
  notification: GitHubNotification | null
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onUnsubscribe: (id: string) => void
  onOpen: (notification: GitHubNotification) => void
  isMarkingRead?: boolean
  isUnsubscribing?: boolean
}

/**
 * Get icon for notification subject type
 */
function getSubjectIcon(type: NotificationSubjectType) {
  switch (type) {
    case 'PullRequest':
      return <GitPullRequest size={20} className="text-[#a371f7]" />
    case 'Issue':
      return <CircleDot size={20} className="text-[#3fb950]" />
    case 'Commit':
      return <GitCommit size={20} className="text-[#8b949e]" />
    case 'Release':
      return <Tag size={20} className="text-[#58a6ff]" />
    case 'Discussion':
      return <MessageSquare size={20} className="text-[#8b949e]" />
    case 'RepositoryVulnerabilityAlert':
      return <Shield size={20} className="text-[#f85149]" />
    default:
      return <CircleDot size={20} className="text-[#8b949e]" />
  }
}

/**
 * Get human-readable reason label
 */
function getReasonLabel(reason: NotificationReason): string {
  const labels: Record<NotificationReason, string> = {
    assign: 'Assigned to you',
    author: 'You authored this',
    comment: 'New comment',
    invitation: 'Repository invitation',
    manual: 'Manually subscribed',
    mention: 'You were mentioned',
    review_requested: 'Review requested',
    security_alert: 'Security alert',
    state_change: 'State changed',
    subscribed: 'Watching this',
    team_mention: 'Your team was mentioned',
  }
  return labels[reason] || reason
}

/**
 * Preview pane for selected notification
 */
export function NotificationPreview({
  notification,
  onClose,
  onMarkAsRead,
  onUnsubscribe,
  onOpen,
  isMarkingRead = false,
  isUnsubscribing = false,
}: NotificationPreviewProps) {
  if (!notification) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center p-8"
        style={{ backgroundColor: '#0d1117', borderLeft: '1px solid #21262d' }}
      >
        <div className="text-[#8b949e] mb-2">
          <CircleDot size={48} strokeWidth={1} />
        </div>
        <p className="text-[#8b949e] text-sm">
          Select a notification to preview
        </p>
        <p className="text-[#6e7681] text-xs mt-1">
          Use j/k to navigate, Enter to open
        </p>
      </div>
    )
  }

  const updatedAt = new Date(notification.updated_at)
  const lastReadAt = notification.last_read_at ? new Date(notification.last_read_at) : null

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: '#0d1117', borderLeft: '1px solid #21262d' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <div className="flex items-center gap-2">
          {getSubjectIcon(notification.subject.type)}
          <span className="text-xs text-[#8b949e] uppercase tracking-wide">
            {notification.subject.type}
          </span>
          {notification.unread && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#58a6ff' }}
              aria-label="Unread"
            />
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#21262d] text-[#8b949e]"
          aria-label="Close preview"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Title */}
        <h2 className="text-lg font-semibold text-[#e6edf3] mb-3 leading-snug">
          {notification.subject.title}
        </h2>

        {/* Repository */}
        <div className="flex items-center gap-2 mb-4">
          <img
            src={notification.repository.owner.avatar_url}
            alt={notification.repository.owner.login}
            className="w-5 h-5 rounded-full"
          />
          <a
            href={notification.repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#58a6ff] hover:underline"
          >
            {notification.repository.full_name}
          </a>
          {notification.repository.private && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e]">
              Private
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid #21262d' }}>
            <span className="text-[#8b949e]">Reason</span>
            <span className="text-[#e6edf3]">{getReasonLabel(notification.reason)}</span>
          </div>
          <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid #21262d' }}>
            <span className="text-[#8b949e]">Updated</span>
            <span className="text-[#e6edf3]" title={updatedAt.toLocaleString()}>
              {formatDistanceToNow(updatedAt, { addSuffix: true })}
            </span>
          </div>
          {lastReadAt && (
            <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid #21262d' }}>
              <span className="text-[#8b949e]">Last read</span>
              <span className="text-[#e6edf3]" title={lastReadAt.toLocaleString()}>
                {formatDistanceToNow(lastReadAt, { addSuffix: true })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid #21262d' }}>
            <span className="text-[#8b949e]">Status</span>
            <span className={notification.unread ? 'text-[#58a6ff]' : 'text-[#8b949e]'}>
              {notification.unread ? 'Unread' : 'Read'}
            </span>
          </div>
        </div>

        {/* Repository description */}
        {notification.repository.description && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #21262d' }}>
            <p className="text-xs text-[#8b949e] uppercase tracking-wide mb-1">Repository</p>
            <p className="text-sm text-[#e6edf3]">{notification.repository.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderTop: '1px solid #21262d' }}
      >
        <button
          onClick={() => onOpen(notification)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-[#238636] text-white hover:bg-[#2ea043]"
        >
          <ExternalLink size={14} />
          Open in GitHub
        </button>
        {notification.unread && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            disabled={isMarkingRead}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50"
            style={{ borderColor: '#30363d' }}
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
        <button
          onClick={() => onUnsubscribe(notification.id)}
          disabled={isUnsubscribing}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-md border text-[#e6edf3] hover:bg-[#21262d] disabled:opacity-50"
          style={{ borderColor: '#30363d' }}
          title="Unsubscribe"
        >
          <BellOff size={14} />
        </button>
      </div>
    </div>
  )
}
