/**
 * Reusable Badge component
 * For displaying labels, counts, and status indicators
 */

import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md'
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'primary',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  const baseClass = 'inline-flex items-center font-medium rounded-full'

  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}
