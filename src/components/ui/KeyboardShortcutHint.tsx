/**
 * Keyboard Shortcut Hint Component
 *
 * Displays available keyboard shortcuts
 */

interface KeyboardShortcut {
  key: string
  description: string
}

interface KeyboardShortcutHintProps {
  shortcuts: KeyboardShortcut[]
}

/**
 * Display keyboard shortcuts in a helpful panel
 *
 * @param shortcuts - Array of keyboard shortcuts to display
 */
export function KeyboardShortcutHint({ shortcuts }: KeyboardShortcutHintProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Keyboard Shortcuts
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-gray-600 dark:text-gray-400">
              {shortcut.description}
            </span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded font-mono text-xs border border-gray-300 dark:border-gray-600">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  )
}
