/**
 * Pagination Component
 *
 * GitHub-style numerical pagination with page numbers and navigation
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  showPageNumbers?: boolean
  maxVisiblePages?: number
}

/**
 * Generate array of page numbers to display
 * Shows first, last, current, and surrounding pages with ellipsis
 */
function getVisiblePages(current: number, total: number, maxVisible: number): (number | 'ellipsis')[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = []
  const sidePages = Math.floor((maxVisible - 3) / 2) // Pages on each side of current

  // Always show first page
  pages.push(1)

  // Calculate range around current page
  let rangeStart = Math.max(2, current - sidePages)
  let rangeEnd = Math.min(total - 1, current + sidePages)

  // Adjust range if at edges
  if (current <= sidePages + 2) {
    rangeEnd = Math.min(total - 1, maxVisible - 2)
  }
  if (current >= total - sidePages - 1) {
    rangeStart = Math.max(2, total - maxVisible + 3)
  }

  // Add ellipsis before range if needed
  if (rangeStart > 2) {
    pages.push('ellipsis')
  }

  // Add range pages
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  // Add ellipsis after range if needed
  if (rangeEnd < total - 1) {
    pages.push('ellipsis')
  }

  // Always show last page
  if (total > 1) {
    pages.push(total)
  }

  return pages
}

/**
 * Pagination with page numbers
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  showPageNumbers = true,
  maxVisiblePages = 7,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages(currentPage, totalPages, maxVisiblePages)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const buttonBase =
    'px-3 py-1.5 text-sm rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const buttonDefault = `${buttonBase} text-[#e6edf3] hover:bg-[#21262d] border-[#30363d]`
  const buttonActive = `${buttonBase} bg-[#1f6feb] text-white border-[#1f6feb]`

  return (
    <nav
      className="flex items-center justify-center gap-1"
      role="navigation"
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev || isLoading}
        className={buttonDefault}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {visiblePages.map((page, idx) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1.5 text-sm text-[#8b949e]"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={page === currentPage ? buttonActive : buttonDefault}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext || isLoading}
        className={buttonDefault}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

/**
 * Simple pagination info display
 */
export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage: number
}) {
  const start = (currentPage - 1) * itemsPerPage + 1
  const end = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : currentPage * itemsPerPage

  return (
    <span className="text-sm text-[#8b949e]">
      {totalItems ? (
        <>
          Showing {start}-{end} of {totalItems}
        </>
      ) : (
        <>
          Page {currentPage} of {totalPages}
        </>
      )}
    </span>
  )
}
