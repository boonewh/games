type ApiErrorBody = {
  error?: unknown
  requestId?: unknown
}

export async function readApiJson<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text) {
    throw new Error(`Request failed (HTTP ${response.status}, empty response)`)
  }

  let body: ApiErrorBody & T
  try {
    body = JSON.parse(text) as ApiErrorBody & T
  } catch {
    throw new Error(`Request failed (HTTP ${response.status}, invalid response)`)
  }

  if (!response.ok) {
    const message = typeof body.error === 'string' ? body.error : `HTTP ${response.status}`
    const requestId = typeof body.requestId === 'string' ? ` (reference ${body.requestId})` : ''
    throw new Error(`${message}${requestId}`)
  }

  return body
}
