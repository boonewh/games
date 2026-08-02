import { describe, expect, it } from 'vitest'
import { readApiJson } from './client-http'

describe('readApiJson', () => {
  it('returns a successful JSON response', async () => {
    const response = new Response(JSON.stringify({ characters: [] }), { status: 200 })

    await expect(readApiJson(response)).resolves.toEqual({ characters: [] })
  })

  it('describes an empty server response instead of throwing a JSON parse error', async () => {
    const response = new Response(null, { status: 500 })

    await expect(readApiJson(response)).rejects.toThrow('HTTP 500, empty response')
  })

  it('includes the server request reference in errors', async () => {
    const response = new Response(
      JSON.stringify({ error: 'Unable to load parties', requestId: 'abc123' }),
      { status: 500 }
    )

    await expect(readApiJson(response)).rejects.toThrow(
      'Unable to load parties (reference abc123)'
    )
  })
})
