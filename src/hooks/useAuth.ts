/**
 * Authentication Hook
 *
 * Manages GitHub Personal Access Token (PAT) authentication.
 * OAuth flow removed for security - client secrets cannot be safely stored in frontend.
 */

import { useCallback, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { fetchCurrentUser } from '../lib/api/notifications'

export interface UseAuthReturn {
  token: string | null
  user: {
    login: string
    name: string | null
    avatar_url: string
    email: string | null
  } | null
  isAuthenticated: boolean
  logout: () => void
  fetchUser: () => Promise<void>
}

/**
 * Hook for managing GitHub PAT authentication
 *
 * @returns Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const { token, user, isAuthenticated, logout: clearAuth, setUser } = useAuthStore()

  /**
   * Logout and clear authentication
   */
  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  /**
   * Fetch current user information
   */
  const fetchUser = useCallback(async () => {
    if (!token) return

    try {
      const userData = await fetchCurrentUser(token)
      setUser({
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        email: userData.email,
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // If token is invalid, logout
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        logout()
      }
    }
  }, [token, setUser, logout])

  // Fetch user when token changes
  useEffect(() => {
    if (token && !user) {
      fetchUser()
    }
  }, [token, user, fetchUser])

  return {
    token,
    user,
    isAuthenticated,
    logout,
    fetchUser,
  }
}
