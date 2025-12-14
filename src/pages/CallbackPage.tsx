/**
 * OAuth Callback Page
 *
 * Handles GitHub OAuth callback and token exchange
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'

/**
 * OAuth callback handler page
 */
export default function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      setError(errorDescription || errorParam)
      return
    }

    if (!code) {
      setError('No authorization code received')
      return
    }

    // Exchange code for token
    handleCallback(code)
      .then(() => {
        // Redirect to inbox on success
        navigate('/', { replace: true })
      })
      .catch((err) => {
        setError(err.message || 'Failed to authenticate')
      })
  }, [searchParams, handleCallback, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md">
          <ErrorMessage
            title="Authentication Failed"
            message={error}
            onRetry={() => navigate('/login', { replace: true })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Completing authentication...
      </p>
    </div>
  )
}
