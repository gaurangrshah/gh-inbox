/**
 * URL Utility Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { apiUrlToWebUrl, openInNewTab } from './url'

describe('apiUrlToWebUrl', () => {
  it('converts API issue URLs to web URLs', () => {
    const apiUrl = 'https://api.github.com/repos/owner/repo/issues/123'
    const result = apiUrlToWebUrl(apiUrl, 'https://github.com/owner/repo')
    expect(result).toBe('https://github.com/owner/repo/issues/123')
  })

  it('converts API pull request URLs to web URLs', () => {
    const apiUrl = 'https://api.github.com/repos/owner/repo/pulls/456'
    const result = apiUrlToWebUrl(apiUrl, 'https://github.com/owner/repo')
    expect(result).toBe('https://github.com/owner/repo/pull/456')
  })

  it('returns fallback URL when apiUrl is null', () => {
    const fallback = 'https://github.com/owner/repo'
    const result = apiUrlToWebUrl(null, fallback)
    expect(result).toBe(fallback)
  })

  it('returns fallback URL when apiUrl is empty string', () => {
    const fallback = 'https://github.com/owner/repo'
    const result = apiUrlToWebUrl('', fallback)
    expect(result).toBe(fallback)
  })

  it('handles commit URLs', () => {
    const apiUrl = 'https://api.github.com/repos/owner/repo/commits/abc123'
    const result = apiUrlToWebUrl(apiUrl, 'https://github.com/owner/repo')
    expect(result).toBe('https://github.com/owner/repo/commits/abc123')
  })
})

describe('openInNewTab', () => {
  it('opens URL in new tab with security attributes', () => {
    const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null)

    openInNewTab('https://github.com/owner/repo')

    expect(mockOpen).toHaveBeenCalledWith(
      'https://github.com/owner/repo',
      '_blank',
      'noopener,noreferrer'
    )

    mockOpen.mockRestore()
  })
})
