/**
 * Keyboard Shortcuts Hook
 *
 * Global keyboard navigation:
 * - j/k: Navigate up/down
 * - x: Mark current as read
 * - o: Open in browser
 * - r: Refresh
 * - Escape: Clear selection
 */

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  description: string
  handler: () => void
  modifiers?: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  }
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  shortcuts: KeyboardShortcut[]
}

/**
 * Hook for managing keyboard shortcuts
 *
 * @param options - Configuration options
 */
export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const { key, handler, modifiers = {} } = shortcut

        // Check if key matches
        const keyMatches = event.key.toLowerCase() === key.toLowerCase()

        // Check if modifiers match
        const modifiersMatch =
          (!modifiers.ctrl || event.ctrlKey) &&
          (!modifiers.shift || event.shiftKey) &&
          (!modifiers.alt || event.altKey) &&
          (!modifiers.meta || event.metaKey) &&
          // Ensure no unexpected modifiers
          (modifiers.ctrl || !event.ctrlKey) &&
          (modifiers.shift || !event.shiftKey) &&
          (modifiers.alt || !event.altKey) &&
          (modifiers.meta || !event.metaKey)

        if (keyMatches && modifiersMatch) {
          event.preventDefault()
          handler()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}

/**
 * Hook for notification list keyboard navigation
 *
 * @param options - Navigation options
 */
export function useNotificationKeyboardNav({
  selectedIndex,
  setSelectedIndex,
  notifications,
  onMarkAsRead,
  onOpen,
  onRefresh,
}: {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  notifications: unknown[]
  onMarkAsRead: (index: number) => void
  onOpen: (index: number) => void
  onRefresh: () => void
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'j',
      description: 'Next notification',
      handler: () => {
        setSelectedIndex(Math.min(selectedIndex + 1, notifications.length - 1))
      },
    },
    {
      key: 'k',
      description: 'Previous notification',
      handler: () => {
        setSelectedIndex(Math.max(selectedIndex - 1, 0))
      },
    },
    {
      key: 'x',
      description: 'Mark as read',
      handler: () => {
        if (selectedIndex >= 0 && selectedIndex < notifications.length) {
          onMarkAsRead(selectedIndex)
        }
      },
    },
    {
      key: 'o',
      description: 'Open in browser',
      handler: () => {
        if (selectedIndex >= 0 && selectedIndex < notifications.length) {
          onOpen(selectedIndex)
        }
      },
    },
    {
      key: 'r',
      description: 'Refresh',
      handler: onRefresh,
    },
    {
      key: 'Escape',
      description: 'Clear selection',
      handler: () => setSelectedIndex(-1),
    },
  ]

  useKeyboardShortcuts({
    enabled: notifications.length > 0,
    shortcuts,
  })

  return shortcuts
}
