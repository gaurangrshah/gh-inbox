import { describe, expect, it, vi, beforeEach } from 'vitest'
import { githubGet } from './github'

function makeResponse({
  status,
  json,
  headers = {},
}: {
  status: number
  json?: unknown
  headers?: Record<string, string>
}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: async () => json,
  } as unknown as Response
}

describe('githubGet', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns cached data on 304 Not Modified when ETag caching is enabled', async () => {
    const token = 't'

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        makeResponse({
          status: 200,
          json: [{ id: '1' }],
          headers: { ETag: '"abc"', 'X-RateLimit-Remaining': '4999', 'X-RateLimit-Limit': '5000', 'X-RateLimit-Reset': '0' },
        })
      )
      .mockResolvedValueOnce(
        makeResponse({
          status: 304,
          headers: { ETag: '"abc"', 'X-RateLimit-Remaining': '4998', 'X-RateLimit-Limit': '5000', 'X-RateLimit-Reset': '0' },
        })
      )

    const first = await githubGet<unknown[]>('/notifications', token, true)
    const second = await githubGet<unknown[]>('/notifications', token, true)

    expect(first).toEqual([{ id: '1' }])
    expect(second).toEqual([{ id: '1' }])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})


