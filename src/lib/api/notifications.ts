/**
 * Notifications API
 *
 * Functions for interacting with GitHub Notifications API
 */

import type { GitHubNotification, GitHubUser } from '../../types/github'
import { githubGet, githubPatch, githubPut, githubDelete, clearCache } from '../github'

export interface FetchNotificationsParams {
  all?: boolean
  participating?: boolean
  since?: string
  before?: string
  page?: number
  per_page?: number
}

/**
 * Fetch notifications from GitHub API
 *
 * @param token - GitHub access token
 * @param params - Query parameters for filtering
 * @returns Array of notifications
 */
export async function fetchNotifications(
  token: string,
  params: FetchNotificationsParams = {}
): Promise<GitHubNotification[]> {
  const queryParams = new URLSearchParams()

  // Add parameters
  if (params.all !== undefined) queryParams.set('all', String(params.all))
  if (params.participating !== undefined) queryParams.set('participating', String(params.participating))
  if (params.since) queryParams.set('since', params.since)
  if (params.before) queryParams.set('before', params.before)
  if (params.page) queryParams.set('page', String(params.page))
  if (params.per_page) queryParams.set('per_page', String(params.per_page))

  const endpoint = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  const result = await githubGet<GitHubNotification[]>(endpoint, token)
  console.log('[DEBUG] fetchNotifications returned:', result?.length, 'items', result)
  return result
}

/**
 * Mark a notification thread as read
 *
 * @param token - GitHub access token
 * @param threadId - Notification thread ID
 */
export async function markNotificationAsRead(
  token: string,
  threadId: string
): Promise<void> {
  await githubPatch(`/notifications/threads/${threadId}`, token)
  // Clear notification cache to force fresh fetch after mutation
  clearCache('/notifications')
}

/**
 * Mark all notifications as read
 *
 * @param token - GitHub access token
 * @param lastReadAt - Optional timestamp to mark notifications before this time as read
 */
export async function markAllNotificationsAsRead(
  token: string,
  lastReadAt?: string
): Promise<void> {
  const body = lastReadAt ? { last_read_at: lastReadAt } : {}
  await githubPut('/notifications', token, body)
  // Clear notification cache to force fresh fetch after mutation
  clearCache('/notifications')
}

/**
 * Mark repository notifications as read
 *
 * @param token - GitHub access token
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param lastReadAt - Optional timestamp to mark notifications before this time as read
 */
export async function markRepositoryNotificationsAsRead(
  token: string,
  owner: string,
  repo: string,
  lastReadAt?: string
): Promise<void> {
  const body = lastReadAt ? { last_read_at: lastReadAt } : {}
  await githubPut(`/repos/${owner}/${repo}/notifications`, token, body)
  // Clear notification cache to force fresh fetch after mutation
  clearCache('/notifications')
}

/**
 * Unsubscribe from a notification thread
 *
 * @param token - GitHub access token
 * @param threadId - Notification thread ID
 */
export async function unsubscribeFromThread(
  token: string,
  threadId: string
): Promise<void> {
  await githubDelete(`/notifications/threads/${threadId}/subscription`, token)
  // Clear notification cache to force fresh fetch after mutation
  clearCache('/notifications')
}

/**
 * Get notification thread subscription status
 *
 * @param token - GitHub access token
 * @param threadId - Notification thread ID
 */
export async function getThreadSubscription(
  token: string,
  threadId: string
): Promise<{ subscribed: boolean; ignored: boolean; reason: string | null }> {
  return githubGet(`/notifications/threads/${threadId}/subscription`, token)
}

/**
 * Fetch current authenticated user
 *
 * @param token - GitHub access token
 * @returns User object
 */
export async function fetchCurrentUser(token: string): Promise<GitHubUser> {
  return githubGet<GitHubUser>('/user', token)
}

/**
 * Check if a notification thread is read
 *
 * @param token - GitHub access token
 * @param threadId - Notification thread ID
 */
export async function checkThreadReadStatus(
  token: string,
  threadId: string
): Promise<boolean> {
  try {
    await githubGet(`/notifications/threads/${threadId}`, token, false)
    return false // If we get a response, it's unread
  } catch (error) {
    // 304 means it hasn't changed (still unread)
    // Other errors mean we can't determine status
    return false
  }
}
