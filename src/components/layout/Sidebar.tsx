/**
 * Sidebar Component - GitHub Style
 *
 * Matches GitHub's notification sidebar with Inbox/Saved/Done filters
 * and repository list
 */

import { Inbox, Bookmark, CheckCircle, Filter, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFilterStore, type NotificationReason } from '../../stores/filterStore'
import { useState } from 'react'

/**
 * GitHub-style sidebar
 */
export function Sidebar() {
  const {
    selectedReasons,
    setReasonFilter,
  } = useFilterStore()

  const [filtersExpanded, setFiltersExpanded] = useState(true)
  const [reposExpanded, setReposExpanded] = useState(true)

  // Main navigation items matching GitHub's sidebar
  const navItems = [
    { id: 'inbox', icon: Inbox, label: 'Inbox', count: null },
    { id: 'saved', icon: Bookmark, label: 'Saved', count: null },
    { id: 'done', icon: CheckCircle, label: 'Done', count: null },
  ]

  // Filter options matching GitHub's
  const filterOptions = [
    { id: 'assigned', label: 'Assigned' },
    { id: 'participating', label: 'Participating' },
    { id: 'mentioned', label: '@mentioned' },
    { id: 'team_mentioned', label: 'Team mentioned' },
    { id: 'review_requested', label: 'Review requested' },
  ]

  const toggleReason = (reason: string) => {
    const typedReason = reason as NotificationReason
    if (selectedReasons.includes(typedReason)) {
      setReasonFilter(selectedReasons.filter((r) => r !== typedReason))
    } else {
      setReasonFilter([...selectedReasons, typedReason])
    }
  }

  return (
    <aside
      className="w-72 flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: '#0d1117',
        borderRight: '1px solid #21262d'
      }}
    >
      {/* Main Navigation */}
      <nav className="p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              item.id === 'inbox'
                ? 'bg-[#21262d] text-white font-medium'
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
            }`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Filters Section */}
      <div className="px-3 py-2 border-t border-[#21262d]">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wide hover:text-[#e6edf3]"
        >
          <span>Filters</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${filtersExpanded ? '' : '-rotate-90'}`}
          />
        </button>

        {filtersExpanded && (
          <div className="space-y-0.5">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleReason(filter.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedReasons.includes(filter.id as NotificationReason)
                    ? 'bg-[#21262d] text-white'
                    : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#e6edf3]'
                }`}
              >
                <Filter size={14} className="opacity-0" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Repositories Section */}
      <div className="flex-1 px-3 py-2 border-t border-[#21262d] overflow-y-auto">
        <button
          onClick={() => setReposExpanded(!reposExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#8b949e] uppercase tracking-wide hover:text-[#e6edf3]"
        >
          <span>Repositories</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${reposExpanded ? '' : '-rotate-90'}`}
          />
        </button>

        {reposExpanded && (
          <div className="space-y-0.5">
            {/* This would be populated dynamically from notifications */}
            <p className="px-3 py-2 text-xs text-[#6e7681]">
              Repositories will appear here based on your notifications
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#21262d]">
        <Link
          to="/settings"
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3] rounded-md hover:bg-[#21262d]"
        >
          <span>Manage notifications</span>
        </Link>
      </div>
    </aside>
  )
}
