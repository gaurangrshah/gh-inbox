/**
 * URL utilities for GitHub API
 */

/**
 * Convert GitHub API URL to web URL
 *
 * GitHub API URLs look like: https://api.github.com/repos/owner/repo/issues/123
 * Web URLs look like: https://github.com/owner/repo/issues/123
 *
 * @param apiUrl - GitHub API URL (e.g., from notification.subject.url)
 * @param fallbackUrl - Fallback URL if apiUrl is empty
 * @returns Web-accessible GitHub URL
 */
export function apiUrlToWebUrl(apiUrl: string | null, fallbackUrl: string): string {
  if (!apiUrl) return fallbackUrl

  return apiUrl
    .replace('api.github.com/repos', 'github.com')
    .replace('/pulls/', '/pull/')
}

/**
 * Open a URL in a new tab with security best practices
 *
 * @param url - URL to open
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}
