/**
 * Notifications Hook
 *
 * TanStack Query hook for managing GitHub notifications with:
 * - 60-second background refetch
 * - Optimistic updates for mark-as-read
 * - Pagination support
 * - Cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { GitHubNotification } from '../types/github'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markRepositoryNotificationsAsRead,
  unsubscribeFromThread,
  type FetchNotificationsParams,
} from '../lib/api/notifications'
import { useAuthStore } from '../stores/authStore'
import { QUERY_KEYS, POLLING_INTERVAL, STALE_TIME } from '../lib/constants'

/**
 * Hook for fetching notifications
 *
 * @param params - Query parameters for filtering
 * @returns Query result with notifications data
 */
export function useNotifications(params: FetchNotificationsParams = {}) {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: QUERY_KEYS.notificationsList(params),
    queryFn: () => {
      if (!token) throw new Error('Not authenticated')
      return fetchNotifications(token, params)
    },
    enabled: !!token,
    staleTime: STALE_TIME,
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: true,
  })
}

/**
 * Hook for marking a notification as read
 *
 * @returns Mutation for marking notification as read
 */
export function useMarkAsRead() {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!token) throw new Error('Not authenticated')
      await markNotificationAsRead(token, threadId)
    },
    onMutate: async (threadId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications })

      // Snapshot previous value
      const previousNotifications = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.notifications,
      })

      // Optimistically update all notification queries
      queryClient.setQueriesData<GitHubNotification[]>(
        { queryKey: QUERY_KEYS.notifications },
        (old) => {
          if (!old) return old
          return old.map((notification) =>
            notification.id === threadId
              ? { ...notification, unread: false }
              : notification
          )
        }
      )

      return { previousNotifications }
    },
    onError: (_err, _threadId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
    },
  })
}

/**
 * Hook for marking all notifications as read
 *
 * @returns Mutation for marking all notifications as read
 */
export function useMarkAllAsRead() {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Not authenticated')
      await markAllNotificationsAsRead(token)
    },
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
    },
  })
}

/**
 * Hook for marking repository notifications as read
 *
 * @returns Mutation for marking repository notifications as read
 */
export function useMarkRepositoryAsRead() {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ owner, repo }: { owner: string; repo: string }) => {
      if (!token) throw new Error('Not authenticated')
      await markRepositoryNotificationsAsRead(token, owner, repo)
    },
    onMutate: async ({ owner, repo }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications })

      const previousNotifications = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.notifications,
      })

      // Optimistically update notifications for this repo
      queryClient.setQueriesData<GitHubNotification[]>(
        { queryKey: QUERY_KEYS.notifications },
        (old) => {
          if (!old) return old
          return old.map((notification) =>
            notification.repository.owner.login === owner &&
            notification.repository.name === repo
              ? { ...notification, unread: false }
              : notification
          )
        }
      )

      return { previousNotifications }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNotifications) {
        context.previousNotifications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
    },
  })
}

/**
 * Hook for unsubscribing from a thread
 *
 * @returns Mutation for unsubscribing from thread
 */
export function useUnsubscribe() {
  const token = useAuthStore((state) => state.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!token) throw new Error('Not authenticated')
      await unsubscribeFromThread(token, threadId)
    },
    onSuccess: () => {
      // Refetch notifications after unsubscribe
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
    },
  })
}

/**
 * Hook for refetching notifications manually
 *
 * @returns Function to refetch notifications
 */
export function useRefreshNotifications() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications })
  }
}
