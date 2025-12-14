/**
 * Login Page - GitHub Style
 *
 * GitHub OAuth login with personal access token option
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'

/**
 * GitHub-style login page
 */
export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const { login: setToken } = useAuthStore()
  const navigate = useNavigate()
  const [patInput, setPatInput] = useState('')
  const [patError, setPatError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handlePatLogin = async () => {
    const token = patInput.trim()
    if (!token) {
      setPatError('Please enter a token')
      return
    }

    setIsLoading(true)
    setPatError('')

    try {
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

      setToken(token)
    } catch (error) {
      setPatError(error instanceof Error ? error.message : 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0d1117' }}
    >
      {/* GitHub Logo */}
      <svg
        height="48"
        viewBox="0 0 16 16"
        width="48"
        className="mb-6"
        style={{ fill: '#ffffff' }}
      >
        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
      </svg>

      {/* Sign in heading */}
      <h1 className="text-2xl font-light mb-6" style={{ color: '#e6edf3' }}>
        Sign in to GitHub Inbox
      </h1>

      {/* Login Card */}
      <div
        className="w-full max-w-sm rounded-md p-4"
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
        }}
      >
        {/* PAT Input */}
        <div className="mb-4">
          <label
            htmlFor="pat-input"
            className="block text-sm font-medium mb-2"
            style={{ color: '#e6edf3' }}
          >
            Personal access token
          </label>
          <input
            id="pat-input"
            type="password"
            value={patInput}
            onChange={(e) => setPatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePatLogin()}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
            style={{
              backgroundColor: '#0d1117',
              border: '1px solid #30363d',
              color: '#e6edf3',
            }}
          />
          {patError && (
            <p className="mt-2 text-sm" style={{ color: '#f85149' }}>
              {patError}
            </p>
          )}
        </div>

        {/* Sign in Button */}
        <button
          onClick={handlePatLogin}
          disabled={isLoading || !patInput.trim()}
          className="w-full py-2 px-4 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#238636',
            color: '#ffffff',
            border: '1px solid rgba(240, 246, 252, 0.1)',
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Create token link */}
        <p className="mt-4 text-center text-sm" style={{ color: '#8b949e' }}>
          <a
            href="https://github.com/settings/tokens/new?scopes=notifications,repo,read:user"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: '#58a6ff' }}
          >
            Create a personal access token
          </a>
        </p>
      </div>

      {/* Required scopes */}
      <div
        className="w-full max-w-sm mt-4 p-4 rounded-md text-center text-sm"
        style={{
          border: '1px solid #30363d',
          color: '#8b949e',
        }}
      >
        Required scopes:{' '}
        <code
          className="px-1 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'rgba(110, 118, 129, 0.4)' }}
        >
          notifications
        </code>{' '}
        <code
          className="px-1 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'rgba(110, 118, 129, 0.4)' }}
        >
          repo
        </code>{' '}
        <code
          className="px-1 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'rgba(110, 118, 129, 0.4)' }}
        >
          read:user
        </code>
      </div>

      {/* Footer */}
      <div className="mt-8 flex gap-4 text-xs" style={{ color: '#8b949e' }}>
        <a href="#" className="hover:underline hover:text-[#58a6ff]">Terms</a>
        <a href="#" className="hover:underline hover:text-[#58a6ff]">Privacy</a>
        <a href="#" className="hover:underline hover:text-[#58a6ff]">Security</a>
        <span>Contact GitHub</span>
      </div>
    </div>
  )
}
