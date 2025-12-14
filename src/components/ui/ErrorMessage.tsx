/**
 * Error Message Component
 *
 * User-friendly error display with retry option
 */

import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
}

/**
 * Error message display with optional retry button
 *
 * @param title - Error title
 * @param message - Error message
 * @param onRetry - Optional retry callback
 */
export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-red-500">
        <AlertCircle size={64} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  )
}
