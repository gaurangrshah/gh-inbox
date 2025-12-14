/**
 * Loading Spinner Component
 *
 * Displays an animated loading indicator.
 * Styled to match GitHub Primer design system.
 */

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 40,
}

/**
 * Loading spinner with configurable size
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={label || 'Loading'}
    >
      <Loader2
        size={sizeMap[size]}
        className="animate-spin text-[#58a6ff]"
      />
      {label && (
        <span className="text-sm text-[#8b949e]">{label}</span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )
}

/**
 * Full-page loading state
 */
export function LoadingScreen({ message = 'Loading notifications...' }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{ backgroundColor: '#0d1117' }}
    >
      <LoadingSpinner size="lg" label={message} />
    </div>
  )
}
