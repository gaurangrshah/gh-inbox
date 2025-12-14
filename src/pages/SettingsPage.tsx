/**
 * Settings Page
 *
 * Theme preferences and keyboard shortcut reference
 */

import { KeyboardShortcutHint } from '../components/ui/KeyboardShortcutHint'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useUIStore } from '../stores/uiStore'

/**
 * Settings page with theme and keyboard shortcuts
 */
export default function SettingsPage() {
  const { theme } = useUIStore()

  const shortcuts = [
    { key: 'j', description: 'Next notification' },
    { key: 'k', description: 'Previous notification' },
    { key: 'x', description: 'Mark as read' },
    { key: 'o', description: 'Open in GitHub' },
    { key: 'r', description: 'Refresh' },
    { key: 'Escape', description: 'Clear selection' },
  ]

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your GitHub Inbox experience
          </p>
        </div>

        {/* Appearance */}
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Theme
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current theme: {theme === 'dark' ? 'Dark' : 'Light'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Keyboard Shortcuts
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Use these shortcuts to navigate and manage notifications efficiently
          </p>
          <KeyboardShortcutHint shortcuts={shortcuts} />
        </section>

        {/* About */}
        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            About
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Version:
              </span>{' '}
              1.0.0
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                GitHub API:
              </span>{' '}
              v3 REST API
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Built with React, TypeScript, Tailwind CSS, and TanStack Query
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
