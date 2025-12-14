/**
 * Internal notification type definitions
 * Enriched versions of GitHub API types for application use
 */

import type { GitHubNotification } from './github'

export interface Notification extends GitHubNotification {
  // Additional fields for UI state
  groupKey?: string
  selected?: boolean
}

export type NotificationGroup = {
  key: string
  label: string
  notifications: Notification[]
  count: number
  unreadCount: number
}

export interface FilterParams {
  all?: boolean
  participating?: boolean
  since?: string
  before?: string
}
