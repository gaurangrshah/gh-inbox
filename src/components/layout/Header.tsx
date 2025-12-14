/**
 * Header Component - GitHub Style
 *
 * Matches GitHub's notification page header
 */

import { Bell, RefreshCw, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useRefreshNotifications } from '../../hooks/useNotifications'
import { getRateLimitInfo } from '../../lib/github'
import { useState, useEffect } from 'react'

/**
 * GitHub-style header
 */
export function Header() {
  const { user, logout } = useAuth()
  const refresh = useRefreshNotifications()
  const [rateLimit, setRateLimit] = useState(getRateLimitInfo())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setRateLimit(getRateLimitInfo())
    }, 5000)
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
    <header className="h-16 px-4 flex items-center justify-between"
      style={{ backgroundColor: '#010409', borderBottom: '1px solid #21262d' }}>
      {/* Left - Logo and Title */}
      <div className="flex items-center gap-4">
        {/* GitHub Logo */}
        <svg height="32" viewBox="0 0 16 16" width="32" className="fill-white">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>

        {/* Notifications Title */}
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-base">Notifications</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Rate Limit */}
        <div
          className="flex items-center gap-1.5 text-xs"
          title={`${rateLimit.remaining}/${rateLimit.limit} API calls remaining`}
          style={{ color: isRateLimitLow ? '#f85149' : '#8b949e' }}
        >
          <span className="font-mono">{rateLimit.remaining}</span>
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-md hover:bg-[#21262d] transition-colors disabled:opacity-50"
          aria-label="Refresh notifications"
          style={{ color: '#8b949e' }}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Notifications Bell */}
        <button
          className="p-2 rounded-md hover:bg-[#21262d] transition-colors relative"
          aria-label="Notifications"
          style={{ color: '#8b949e' }}
        >
          <Bell size={16} />
        </button>

        {/* User Avatar */}
        {user && (
          <button className="flex items-center">
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="w-8 h-8 rounded-full ring-1 ring-[#30363d]"
            />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-md hover:bg-[#21262d] transition-colors"
          aria-label="Sign out"
          style={{ color: '#8b949e' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
