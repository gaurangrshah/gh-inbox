/**
 * Error Message Component
 *
 * User-friendly error display with retry option.
 * Styled to match GitHub Primer design system.
 */

import { AlertCircle, WifiOff, ShieldAlert, RefreshCw } from 'lucide-react'

type ErrorVariant = 'generic' | 'network' | 'auth' | 'rate-limit'

interface ErrorMessageProps {
  variant?: ErrorVariant
  title?: string
  message: string
  onRetry?: () => void
}

/**
 * Get icon for error variant
 */
function getErrorIcon(variant: ErrorVariant) {
  switch (variant) {
    case 'network':
      return <WifiOff size={48} strokeWidth={1.5} className="text-[#f85149]" />
    case 'auth':
      return <ShieldAlert size={48} strokeWidth={1.5} className="text-[#d29922]" />
    case 'rate-limit':
      return <RefreshCw size={48} strokeWidth={1.5} className="text-[#d29922]" />
    default:
      return <AlertCircle size={48} strokeWidth={1.5} className="text-[#f85149]" />
  }
}

/**
 * Get default title for error variant
 */
function getDefaultTitle(variant: ErrorVariant): string {
  switch (variant) {
    case 'network':
      return 'Connection failed'
    case 'auth':
      return 'Authentication error'
    case 'rate-limit':
      return 'Rate limit exceeded'
    default:
      return 'Something went wrong'
  }
}

/**
 * Error message display with optional retry button
 */
export function ErrorMessage({
  variant = 'generic',
  title,
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center h-full"
      style={{ backgroundColor: '#0d1117' }}
    >
      <div className="mb-4">
        {getErrorIcon(variant)}
      </div>
      <h2 className="text-xl font-semibold text-[#e6edf3] mb-2">
        {title || getDefaultTitle(variant)}
      </h2>
      <p className="text-sm text-[#8b949e] max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium rounded-md bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
