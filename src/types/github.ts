/**
 * GitHub API type definitions
 * Based on GitHub REST API v3 response shapes
 */

/**
 * Possible reasons for receiving a notification
 */
export type NotificationReason =
  | 'assign'
  | 'author'
  | 'comment'
  | 'invitation'
  | 'manual'
  | 'mention'
  | 'review_requested'
  | 'security_alert'
  | 'state_change'
  | 'subscribed'
  | 'team_mention'

/**
 * Notification subject types
 */
export type NotificationSubjectType =
  | 'Issue'
  | 'PullRequest'
  | 'Commit'
  | 'Release'
  | 'Discussion'
  | 'RepositoryVulnerabilityAlert'

/**
 * GitHub notification object
 */
export interface GitHubNotification {
  id: string
  unread: boolean
  reason: NotificationReason
  updated_at: string
  last_read_at: string | null
  subject: {
    title: string
    url: string
    latest_comment_url: string
    type: NotificationSubjectType
  }
  repository: {
    id: number
    node_id: string
    name: string
    full_name: string
    owner: {
      login: string
      id: number
      avatar_url: string
      type: string
    }
    private: boolean
    html_url: string
    description: string | null
  }
  url: string
  subscription_url: string
}

/**
 * GitHub repository object
 */
export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  private: boolean
  html_url: string
  description: string | null
}

/**
 * GitHub user object
 */
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  email: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

/**
 * Rate limit information from GitHub API headers
 */
export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: Date
}
