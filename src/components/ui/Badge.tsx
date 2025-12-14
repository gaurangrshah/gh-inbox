/**
 * Reusable Badge component
 * For displaying labels, counts, and status indicators
 */

import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'primary' | 'success' | 'danger'
  children: ReactNode
  className?: string
}

export default function Badge({
  variant = 'primary',
  children,
  className = '',
}: BadgeProps) {
  const baseClass = 'badge'
  const variantClass = `badge-${variant}`

  return (
    <span className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </span>
  )
}
