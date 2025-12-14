/**
 * GitHub API type definitions
 * Based on GitHub REST API v3 response shapes
 */

import type { NotificationReason } from '../stores/filterStore'

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
    type: 'Issue' | 'PullRequest' | 'Commit' | 'Release' | 'Discussion'
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

export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: Date
}
