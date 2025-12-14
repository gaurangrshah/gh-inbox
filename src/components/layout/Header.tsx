/**
 * Header Component
 *
 * Application header with user avatar, refresh button, rate limit indicator, and logout
 */

import { RefreshCw, LogOut, Activity } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useRefreshNotifications } from '../../hooks/useNotifications'
import { getRateLimitInfo } from '../../lib/github'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useState, useEffect } from 'react'

/**
 * Application header with user controls and status indicators
 */
export function Header() {
  const { user, logout } = useAuth()
  const refresh = useRefreshNotifications()
  const [rateLimit, setRateLimit] = useState(getRateLimitInfo())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Update rate limit info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimit(getRateLimitInfo())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const rateLimitPercentage = (rateLimit.remaining / rateLimit.limit) * 100
  const isRateLimitLow = rateLimitPercentage < 20

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GI</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            GitHub Inbox
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Rate Limit Indicator */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            title={`${rateLimit.remaining} / ${rateLimit.limit} requests remaining. Resets at ${rateLimit.resetAt.toLocaleTimeString()}`}
          >
            <Activity
              size={16}
              className={isRateLimitLow ? 'text-orange-500' : 'text-gray-500'}
            />
            <span
              className={`font-mono ${
                isRateLimitLow
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {rateLimit.remaining}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            aria-label="Refresh notifications"
          >
            <RefreshCw
              size={20}
              className={`text-gray-600 dark:text-gray-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Avatar */}
          {user && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-800">
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user.name || user.login}
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
