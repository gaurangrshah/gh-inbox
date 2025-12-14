/**
 * Sidebar Component
 *
 * Navigation and filter controls
 */

import { Inbox, CheckCircle, Filter, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useFilterStore } from '../../stores/filterStore'
import { NOTIFICATION_REASON_LABELS } from '../../lib/constants'

/**
 * Application sidebar with navigation and quick filters
 */
export function Sidebar() {
  const location = useLocation()
  const {
    showUnreadOnly,
    showParticipating,
    toggleUnreadOnly,
    toggleParticipating,
    selectedReasons,
    setReasonFilter,
    resetFilters,
  } = useFilterStore()

  const navItems = [
    { path: '/', icon: Inbox, label: 'Inbox' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (path: string) => location.pathname === path

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason as any)) {
      setReasonFilter(selectedReasons.filter((r) => r !== reason))
    } else {
      setReasonFilter([...selectedReasons, reason as any])
    }
  }

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Filters */}
      <div className="flex-1 p-4 border-t border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Filter size={16} />
            Filters
          </h3>
          {(showUnreadOnly || showParticipating || selectedReasons.length > 0) && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={toggleUnreadOnly}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Unread only
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showParticipating}
              onChange={toggleParticipating}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Participating
            </span>
          </label>
        </div>

        {/* Reason Filters */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Reason
          </h4>
          <div className="space-y-1.5">
            {Object.entries(NOTIFICATION_REASON_LABELS).map(([reason, label]) => (
              <label key={reason} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason as any)}
                  onChange={() => toggleReason(reason)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CheckCircle size={16} className="text-green-500" />
          <span>All synced</span>
        </div>
      </div>
    </aside>
  )
}
