import { z } from 'zod'

const API_BASE = '/api/v1'

export class ApiError extends Error {
  status: number
  statusText: string

  constructor(status: number, statusText: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
  }
}

async function handleResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    throw new ApiError(response.status, response.statusText, text)
  }

  const json = await response.json()
  const result = schema.safeParse(json)

  if (!result.success) {
    console.error('Schema validation failed:', result.error)
    throw new Error(`Invalid response shape: ${result.error.message}`)
  }

  return result.data
}

export async function get<T>(endpoint: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse(response, schema)
}

export async function post<T>(
  endpoint: string,
  body: unknown,
  schema: z.ZodType<T>
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return handleResponse(response, schema)
}

export async function put<T>(
  endpoint: string,
  body: unknown,
  schema: z.ZodType<T>
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return handleResponse(response, schema)
}

export async function del<T>(endpoint: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return handleResponse(response, schema)
}
