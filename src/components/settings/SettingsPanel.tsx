/**
 * Settings Panel Component
 *
 * Modal panel for configuring app settings:
 * - Polling interval (30-300 seconds)
 * - Items per page (10-100)
 * - Auto-load more preference
 */

import { X, Settings, Clock, List } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'

interface SettingsPanelProps {
  autoLoadMore: boolean
  onAutoLoadMoreChange: (value: boolean) => void
}

/**
 * Settings panel modal
 */
export function SettingsPanel({ autoLoadMore, onAutoLoadMoreChange }: SettingsPanelProps) {
  const {
    settingsPanelOpen,
    closeSettingsPanel,
    pollingInterval,
    setPollingInterval,
    perPage,
    setPerPage,
  } = useUIStore()

  if (!settingsPanelOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeSettingsPanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md mx-4 rounded-lg shadow-xl"
        style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid #30363d' }}
        >
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-[#8b949e]" />
            <h2 id="settings-title" className="text-lg font-semibold text-[#e6edf3]">
              Settings
            </h2>
          </div>
          <button
            onClick={closeSettingsPanel}
            className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e]"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Polling Interval */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#e6edf3]">
              <Clock size={14} className="text-[#8b949e]" />
              Polling Interval
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="30"
                max="300"
                step="30"
                value={pollingInterval}
                onChange={(e) => setPollingInterval(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{ backgroundColor: '#21262d' }}
              />
              <span className="text-sm text-[#8b949e] w-16 text-right">
                {pollingInterval}s
              </span>
            </div>
            <p className="text-xs text-[#6e7681]">
              How often to check for new notifications (30-300 seconds)
            </p>
          </div>

          {/* Items per page */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[#e6edf3]">
              <List size={14} className="text-[#8b949e]" />
              Items per Page
            </label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-md bg-[#0d1117] text-[#e6edf3] focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
              style={{ border: '1px solid #30363d' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={75}>75</option>
              <option value={100}>100</option>
            </select>
            <p className="text-xs text-[#6e7681]">
              Number of notifications to load per page
            </p>
          </div>

          {/* Auto-load more */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLoadMore}
                onChange={(e) => onAutoLoadMoreChange(e.target.checked)}
                className="w-4 h-4 rounded border-[#30363d] bg-transparent checked:bg-[#58a6ff] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-[#e6edf3]">
                Auto-load more on scroll
              </span>
            </label>
            <p className="text-xs text-[#6e7681] ml-7">
              Automatically load more notifications when scrolling near the bottom
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex justify-end"
          style={{ borderTop: '1px solid #30363d' }}
        >
          <button
            onClick={closeSettingsPanel}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#238636] text-white hover:bg-[#2ea043]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
