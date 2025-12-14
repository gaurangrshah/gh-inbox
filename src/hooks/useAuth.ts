/**
 * Authentication Hook
 *
 * Manages GitHub OAuth flow and user authentication
 */

import { useCallback, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { fetchCurrentUser } from '../lib/api/notifications'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/callback`

export interface UseAuthReturn {
  token: string | null
  user: {
    login: string
    name: string | null
    avatar_url: string
    email: string | null
  } | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
  handleCallback: (code: string) => Promise<void>
  fetchUser: () => Promise<void>
}

/**
 * Hook for managing GitHub authentication
 *
 * @returns Authentication state and methods
 */
export function useAuth(): UseAuthReturn {
  const { token, user, isAuthenticated, login: setToken, logout: clearAuth, setUser } = useAuthStore()

  /**
   * Redirect to GitHub OAuth authorization
   */
  const login = useCallback(() => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID || '',
      redirect_uri: GITHUB_REDIRECT_URI,
      scope: 'notifications repo read:user',
      state: crypto.randomUUID(), // CSRF protection
    })

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
  }, [])

  /**
   * Logout and clear authentication
   */
  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  /**
   * Handle OAuth callback with authorization code
   *
   * @param code - Authorization code from GitHub
   */
  const handleCallback = useCallback(
    async (code: string) => {
      try {
        // Exchange code for access token
        // Note: In production, this should go through a backend proxy
        // to keep client secret secure
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_REDIRECT_URI,
          }),
        })

        const data = await response.json()

        if (data.access_token) {
          setToken(data.access_token)
        } else {
          throw new Error(data.error_description || 'Failed to get access token')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        throw error
      }
    },
    [setToken]
  )

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
    login,
    logout,
    handleCallback,
    fetchUser,
  }
}
