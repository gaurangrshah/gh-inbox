/**
 * Sidebar Component - GitHub Style
 *
 * Matches GitHub's notification sidebar with Inbox/Saved/Done filters
 * and repository list.
 *
 * Note: Saved and Done features are not yet implemented.
 * See README.md for future implementation plans.
 */

import { Inbox, Bookmark, CheckCircle, Filter, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFilterStore, type NotificationReason } from '../../stores/filterStore'
import { useState } from 'react'

/**
 * Navigation item type
 */
interface NavItem {
  id: 'inbox' | 'saved' | 'done'
  icon: typeof Inbox
  label: string
  implemented: boolean
}

/**
 * GitHub-style sidebar
 */
export function Sidebar() {
  const {
    selectedReasons,
    setReasonFilter,
    selectedRepos,
    setRepoFilter,
    availableRepos,
  } = useFilterStore()

  const [filtersExpanded, setFiltersExpanded] = useState(true)
  const [reposExpanded, setReposExpanded] = useState(true)
  const [activeNav, setActiveNav] = useState<NavItem['id']>('inbox')

  // Main navigation items matching GitHub's sidebar
  const navItems: NavItem[] = [
    { id: 'inbox', icon: Inbox, label: 'Inbox', implemented: true },
    { id: 'saved', icon: Bookmark, label: 'Saved', implemented: false },
    { id: 'done', icon: CheckCircle, label: 'Done', implemented: false },
  ]

  // Filter options matching GitHub's
  const filterOptions = [
    { id: 'assign', label: 'Assigned' },
    { id: 'mention', label: '@mentioned' },
    { id: 'team_mention', label: 'Team mentioned' },
    { id: 'review_requested', label: 'Review requested' },
  ]

  const handleNavClick = (item: NavItem) => {
    if (item.implemented) {
      setActiveNav(item.id)
    } else {
      console.log(`[GitHub Inbox] "${item.label}" feature not yet implemented. See README.md for roadmap.`)
    }
  }

  const toggleReason = (reason: string) => {
    const typedReason = reason as NotificationReason
    if (selectedReasons.includes(typedReason)) {
      setReasonFilter(selectedReasons.filter((r) => r !== typedReason))
    } else {
      setReasonFilter([...selectedReasons, typedReason])
    }
  }

  const toggleRepo = (fullName: string) => {
    if (selectedRepos.includes(fullName)) {
      setRepoFilter(selectedRepos.filter((r) => r !== fullName))
    } else {
      setRepoFilter([...selectedRepos, fullName])
    }
  }

  return (
    <aside
      className="w-72 flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-canvas-default, #0d1117)',
        borderRight: '1px solid var(--color-border-muted, #21262d)',
      }}
    >
      {/* Main Navigation */}
      <nav className="p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              activeNav === item.id
                ? 'bg-[#21262d] text-white font-medium'
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
            } ${!item.implemented ? 'opacity-60' : ''}`}
            title={!item.implemented ? 'Coming soon' : undefined}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Filters Section */}
      <div
        className="px-3 py-2"
        style={{ borderTop: '1px solid var(--color-border-muted, #21262d)' }}
      >
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-fg-muted, #8b949e)' }}
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
      <div
        className="flex-1 px-3 py-2 overflow-y-auto"
        style={{ borderTop: '1px solid var(--color-border-muted, #21262d)' }}
      >
        <button
          onClick={() => setReposExpanded(!reposExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-fg-muted, #8b949e)' }}
        >
          <span>Repositories</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${reposExpanded ? '' : '-rotate-90'}`}
          />
        </button>

        {reposExpanded && (
          <div className="space-y-0.5">
            {selectedRepos.length > 0 && (
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--color-fg-subtle, #6e7681)' }}>
                  Filtering {selectedRepos.length} repo{selectedRepos.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={() => setRepoFilter([])}
                  className="text-xs text-[#58a6ff] hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
            {availableRepos.length === 0 ? (
              <p
                className="px-3 py-2 text-xs"
                style={{ color: 'var(--color-fg-subtle, #6e7681)' }}
              >
                No repositories yet — load notifications to populate this list.
              </p>
            ) : (
              <>
                {availableRepos.map((repo) => {
                  const active = selectedRepos.includes(repo.full_name)
                  return (
                    <button
                      key={repo.full_name}
                      onClick={() => toggleRepo(repo.full_name)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        active
                          ? 'bg-[#21262d] text-white'
                          : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#e6edf3]'
                      }`}
                      title={repo.full_name}
                    >
                      <span className="truncate">{repo.full_name}</span>
                      <span className="flex items-center gap-2 flex-shrink-0">
                        {repo.unreadCount > 0 && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'rgba(88, 166, 255, 0.15)',
                              color: 'var(--color-accent-fg, #58a6ff)',
                            }}
                            aria-label={`${repo.unreadCount} unread`}
                          >
                            {repo.unreadCount}
                          </span>
                        )}
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'rgba(110, 118, 129, 0.2)',
                            color: 'var(--color-fg-muted, #8b949e)',
                          }}
                          aria-label={`${repo.totalCount} total`}
                        >
                          {repo.totalCount}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid var(--color-border-muted, #21262d)' }}
      >
        <Link
          to="/settings"
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[#21262d]"
          style={{ color: 'var(--color-fg-muted, #8b949e)' }}
        >
          <span>Manage notifications</span>
        </Link>
      </div>
    </aside>
  )
}
