/**
 * Empty State Component
 *
 * Displays a friendly message when there are no notifications
 */

import { CheckCircle } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
}

/**
 * Empty state display for when there are no items
 *
 * @param title - Main heading
 * @param message - Descriptive message
 * @param icon - Optional icon to display
 */
export function EmptyState({
  title = 'All caught up!',
  message = 'No new notifications. Great work!',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-green-500">
        {icon || <CheckCircle size={64} strokeWidth={1.5} />}
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        {message}
      </p>
    </div>
  )
}
