import { headers } from "next/headers"
import type { Session } from "next-auth"
import { readDemoSessionFromCookieString } from "./demo-session"

type AppSession = Session & {
  accessToken?: string
}

export async function getServerSession() {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  const demoSession = readDemoSessionFromCookieString(cookie)
  if (demoSession) {
    return demoSession
  }

  if (!cookie) {
    return null
  }

  const host = requestHeaders.get("host")
  if (!host) {
    return null
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http"
  const sessionUrl = new URL("/api/auth/session", `${protocol}://${host}`)

  const response = await fetch(sessionUrl, {
    headers: { cookie },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  return (await response.json().catch(() => null)) as AppSession | null
}
