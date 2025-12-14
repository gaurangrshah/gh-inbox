/**
 * Application-wide constants
 */

export const APP_NAME = 'GitHub Inbox'
export const APP_VERSION = '1.0.0'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.github.com'

export const STORAGE_KEYS = {
  AUTH: 'github-inbox-auth',
  FILTERS: 'github-inbox-filters',
  UI: 'github-inbox-ui',
} as const

export const QUERY_KEYS = {
  notifications: ['notifications'] as const,
  notificationsList: (filters: unknown) => ['notifications', 'list', filters] as const,
  notificationDetail: (id: string) => ['notifications', 'detail', id] as const,
  repos: ['repos'] as const,
  user: ['user'] as const,
} as const

export const NOTIFICATION_REASONS = [
  'assign',
  'author',
  'comment',
  'invitation',
  'manual',
  'mention',
  'review_requested',
  'security_alert',
  'state_change',
  'subscribed',
  'team_mention',
] as const

export const NOTIFICATION_REASON_LABELS: Record<string, string> = {
  assign: 'Assigned',
  author: 'Author',
  comment: 'Comment',
  invitation: 'Invitation',
  manual: 'Manual',
  mention: 'Mention',
  review_requested: 'Review Requested',
  security_alert: 'Security Alert',
  state_change: 'State Change',
  subscribed: 'Subscribed',
  team_mention: 'Team Mention',
}

export const DEFAULT_POLLING_INTERVAL = 60 // 60 seconds (stored in seconds)
export const DEFAULT_PER_PAGE = 50
export const STALE_TIME = 30 * 1000 // 30 seconds

/** Convert seconds to milliseconds for TanStack Query */
export const getPollingIntervalMs = (seconds: number) => seconds * 1000
