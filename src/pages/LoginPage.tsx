/**
 * Login Page
 *
 * GitHub OAuth login with personal access token option
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Github, Key } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'

/**
 * Login page with GitHub OAuth
 */
export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const { login: setToken } = useAuthStore()
  const navigate = useNavigate()
  const [patInput, setPatInput] = useState('')
  const [patError, setPatError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  /**
   * Handle PAT login
   */
  const handlePatLogin = async () => {
    const token = patInput.trim()
    if (!token) {
      setPatError('Please enter a token')
      return
    }

    setIsLoading(true)
    setPatError('')

    try {
      // Validate token by fetching user
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid token')
        }
        throw new Error('Failed to validate token')
      }

      // Token is valid, save it
      setToken(token)
    } catch (error) {
      setPatError(error instanceof Error ? error.message : 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl items-center justify-center mb-4"
            aria-label="GitHub Inbox logo"
          >
            <Github size={32} className="text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            GitHub Inbox
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your GitHub notifications in one place
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Sign in to continue
          </h2>

          <div className="space-y-4">
            {/* OAuth Login */}
            <Button
              onClick={login}
              variant="primary"
              className="w-full flex items-center justify-center gap-3"
            >
              <Github size={20} />
              Sign in with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  or
                </span>
              </div>
            </div>

            {/* Personal Access Token Input */}
            <div className="space-y-3">
              <div>
                <label htmlFor="pat-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Personal Access Token
                </label>
                <div className="flex gap-2">
                  <input
                    id="pat-input"
                    type="password"
                    value={patInput}
                    onChange={(e) => setPatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePatLogin()}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={handlePatLogin}
                    disabled={isLoading || !patInput.trim()}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Key size={16} />
                    {isLoading ? 'Validating...' : 'Login'}
                  </Button>
                </div>
                {patError && (
                  <p className="mt-1 text-sm text-red-500">{patError}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <a
                  href="https://github.com/settings/tokens/new?scopes=notifications,repo,read:user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create a token
                </a>
                {' '}with scopes: notifications, repo, read:user
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Real-time notification sync</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Keyboard shortcuts for productivity</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Filter by repository, reason, and type</span>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="mt-8 text-xs text-center text-gray-500">
          Your GitHub token is stored locally in your browser. We never send it to our servers.
        </p>
      </div>
    </div>
  )
}
