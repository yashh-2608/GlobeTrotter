import { NextResponse } from "next/server"

const DEFAULT_API_BASE_URL = "http://localhost:4000/api"

export class BackendError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export function getApiBaseUrl() {
  return process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
}

export async function isBackendHealthy() {
  try {
    const response = await backendRequest("/ready")
    return response.ok
  } catch {
    return false
  }
}

interface BackendRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  token?: string
}

export async function backendRequest(path: string, options: BackendRequestOptions = {}) {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`)
  }

  let body: BodyInit | undefined
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json")
    body = JSON.stringify(options.body)
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
    body,
    cache: "no-store",
    signal: options.signal ?? AbortSignal.timeout(15000),
  })
}

export async function backendJson<T>(path: string, options: BackendRequestOptions = {}) {
  const response = await backendRequest(path, options)
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new BackendError(
      response.status,
      (payload as { error?: string } | null)?.error ?? "Backend request failed",
      payload
    )
  }

  return payload as T
}

const NO_BODY_STATUSES = new Set([101, 103, 204, 205, 304])

export async function proxyBackend(path: string, options: BackendRequestOptions = {}) {
  try {
  const response = await backendRequest(path, options)

  if (NO_BODY_STATUSES.has(response.status)) {
    return new NextResponse(null, { status: response.status })
  }

  const text = await response.text()

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  })
  } catch {
    return NextResponse.json({ error: "The trip service is temporarily unavailable. Please try again." }, { status: 503 })
  }
}
