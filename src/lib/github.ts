/**
 * GitHub API Client
 *
 * Handles all GitHub API interactions with:
 * - Authorization header injection
 * - Rate limit tracking
 * - Exponential backoff on 403
 * - ETag caching for conditional requests
 * - Comprehensive error handling
 */

import { API_BASE_URL } from './constants'
import type { RateLimitInfo } from '../types/github'

// Store rate limit info globally
let rateLimitInfo: RateLimitInfo = {
  remaining: 5000,
  limit: 5000,
  resetAt: new Date(Date.now() + 3600000), // Default 1 hour from now
}

// ETag cache for conditional requests
const etagCache = new Map<string, string>()

// Response-body cache for conditional requests (URL -> last JSON)
// Used to return stable data on 304 Not Modified.
const responseCache = new Map<string, unknown>()

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

/**
 * Get current rate limit information
 */
export function getRateLimitInfo(): RateLimitInfo {
  return { ...rateLimitInfo }
}

/**
 * Update rate limit info from response headers
 */
function updateRateLimitFromHeaders(headers: Headers): void {
  const remaining = headers.get('X-RateLimit-Remaining')
  const limit = headers.get('X-RateLimit-Limit')
  const reset = headers.get('X-RateLimit-Reset')

  if (remaining && limit && reset) {
    rateLimitInfo = {
      remaining: parseInt(remaining, 10),
      limit: parseInt(limit, 10),
      resetAt: new Date(parseInt(reset, 10) * 1000),
    }
  }
}

/**
 * Sleep for exponential backoff
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Make authenticated request to GitHub API with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 1000
): Promise<Response> {
  try {
    const response = await fetch(url, options)

    // Update rate limit info
    updateRateLimitFromHeaders(response.headers)

    // 304 Not Modified is an expected outcome for conditional GETs.
    // Treat it as a successful response so callers can return cached data.
    if (response.status === 304) {
      return response
    }

    // Handle rate limiting with exponential backoff
    if (response.status === 403 && retries > 0) {
      const resetTime = rateLimitInfo.resetAt.getTime()
      const now = Date.now()
      const waitTime = Math.min(resetTime - now, backoff)

      if (waitTime > 0) {
        console.warn(`Rate limited. Waiting ${waitTime}ms before retry...`)
        await sleep(waitTime)
        return fetchWithRetry(url, options, retries - 1, backoff * 2)
      }
    }

    // Handle 401 - unauthorized
    if (response.status === 401) {
      throw new GitHubAPIError('Unauthorized. Please log in again.', 401, response)
    }

    // Handle other errors
    if (!response.ok) {
      const errorData: unknown = await response.json().catch(() => ({}))
      const message =
        errorData &&
        typeof errorData === 'object' &&
        'message' in errorData &&
        typeof (errorData as Record<string, unknown>).message === 'string'
          ? String((errorData as Record<string, unknown>).message)
          : undefined
      throw new GitHubAPIError(
        message || `Request failed with status ${response.status}`,
        response.status,
        response
      )
    }

    return response
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      throw error
    }
    throw new GitHubAPIError(
      error instanceof Error ? error.message : 'Network request failed',
      0
    )
  }
}

interface GitHubRequestOptions extends RequestInit {
  token: string
  useETag?: boolean
}

/**
 * Make authenticated request to GitHub API
 *
 * @param endpoint - API endpoint (e.g., '/notifications')
 * @param options - Request options including token
 * @returns Response object
 */
export async function githubRequest(
  endpoint: string,
  options: GitHubRequestOptions
): Promise<Response> {
  const { token, useETag = true, ...fetchOptions } = options
  const url = `${API_BASE_URL}${endpoint}`

  // Build headers
  const headers = new Headers(fetchOptions.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Accept', 'application/vnd.github.v3+json')

  // Add ETag for conditional requests
  if (useETag && fetchOptions.method === 'GET') {
    const cachedETag = etagCache.get(url)
    if (cachedETag) {
      headers.set('If-None-Match', cachedETag)
    }
  }

  const response = await fetchWithRetry(url, {
    ...fetchOptions,
    headers,
  })

  // Cache ETag for future requests
  if (useETag && response.status === 200) {
    const etag = response.headers.get('ETag')
    if (etag) {
      etagCache.set(url, etag)
    }
  }

  return response
}

/**
 * Make authenticated GET request
 */
export async function githubGet<T>(
  endpoint: string,
  token: string,
  useETag = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await githubRequest(endpoint, {
    method: 'GET',
    token,
    useETag,
  })

  // Handle 304 Not Modified
  if (response.status === 304) {
    const cached = responseCache.get(url)
    if (cached !== undefined) {
      return cached as T
    }
    // If we don't have cached data, treat as error (should be rare).
    throw new GitHubAPIError('Not modified (no cache)', 304, response)
  }

  const data = (await response.json()) as T
  if (useETag) {
    responseCache.set(url, data as unknown)
  }
  return data
}

/**
 * Make authenticated POST request
 */
export async function githubPost<T>(
  endpoint: string,
  token: string,
  body?: unknown
): Promise<T | void> {
  const response = await githubRequest(endpoint, {
    method: 'POST',
    token,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : {},
  })

  // Some POST requests return no content (204)
  if (response.status === 204) {
    return
  }

  return response.json()
}

/**
 * Make authenticated PATCH request
 */
export async function githubPatch<T>(
  endpoint: string,
  token: string,
  body?: unknown
): Promise<T | void> {
  const response = await githubRequest(endpoint, {
    method: 'PATCH',
    token,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : {},
  })

  if (response.status === 204 || response.status === 205) {
    return
  }

  return response.json()
}

/**
 * Make authenticated DELETE request
 */
export async function githubDelete(
  endpoint: string,
  token: string
): Promise<void> {
  await githubRequest(endpoint, {
    method: 'DELETE',
    token,
  })
}

/**
 * Make authenticated PUT request
 */
export async function githubPut<T>(
  endpoint: string,
  token: string,
  body?: unknown
): Promise<T | void> {
  const response = await githubRequest(endpoint, {
    method: 'PUT',
    token,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : {},
  })

  if (response.status === 204 || response.status === 205) {
    return
  }

  return response.json()
}
