/**
 * Theme Toggle Component
 *
 * Dark/light mode switch
 */

import { Moon, Sun } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'

/**
 * Toggle button for switching between dark and light themes
 */
export function ThemeToggle() {
  const { theme, setTheme } = useUIStore()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-gray-600 dark:text-gray-400" />
      ) : (
        <Moon size={20} className="text-gray-600 dark:text-gray-400" />
      )}
    </button>
  )
}
