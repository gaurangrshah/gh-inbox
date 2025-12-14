/**
 * Empty State Component
 *
 * Displays a friendly message when there are no notifications.
 * Styled to match GitHub Primer design system.
 */

import { CheckCircle, Inbox, Search } from 'lucide-react'

type EmptyStateVariant = 'inbox-zero' | 'no-results' | 'custom'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  message?: string
  icon?: React.ReactNode
}

/**
 * Get preset content for empty state variants
 */
function getVariantContent(variant: EmptyStateVariant) {
  switch (variant) {
    case 'inbox-zero':
      return {
        icon: <CheckCircle size={48} strokeWidth={1.5} className="text-[#3fb950]" />,
        title: 'All caught up!',
        message: 'No new notifications. Great work!',
      }
    case 'no-results':
      return {
        icon: <Search size={48} strokeWidth={1.5} className="text-[#8b949e]" />,
        title: 'No results found',
        message: 'Try adjusting your search or filter to find what you\'re looking for.',
      }
    default:
      return {
        icon: <Inbox size={48} strokeWidth={1.5} className="text-[#8b949e]" />,
        title: 'Nothing here',
        message: 'No items to display.',
      }
  }
}

/**
 * Empty state display for when there are no items
 */
export function EmptyState({
  variant = 'inbox-zero',
  title,
  message,
  icon,
}: EmptyStateProps) {
  const defaults = getVariantContent(variant)

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center h-full"
      style={{ backgroundColor: '#0d1117' }}
    >
      <div className="mb-4">
        {icon || defaults.icon}
      </div>
      <h2 className="text-xl font-semibold text-[#e6edf3] mb-2">
        {title || defaults.title}
      </h2>
      <p className="text-sm text-[#8b949e] max-w-md">
        {message || defaults.message}
      </p>
    </div>
  )
}
