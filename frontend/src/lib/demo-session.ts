import type { Session } from "next-auth"

export const DEMO_SESSION_COOKIE = "globetrotter_demo_session"
const DEMO_SESSION_MAX_AGE = 60 * 60 * 24 * 7

export type DemoSession = Session & {
  accessToken?: string
}

export function buildDemoSession(input: {
  id: string
  name: string
  email: string
  username: string
  image?: string | null
  role?: string
  accessToken?: string
}): DemoSession {
  return {
    user: {
      id: input.id,
      name: input.name,
      email: input.email,
      image: input.image ?? null,
      username: input.username,
      role: input.role ?? "USER",
    },
    accessToken: input.accessToken ?? "demo-access-token",
    expires: new Date(Date.now() + DEMO_SESSION_MAX_AGE * 1000).toISOString(),
  }
}

function parseSession(value: string): DemoSession | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as DemoSession

    if (!parsed?.user?.id || !parsed?.user?.email || !parsed?.user?.name) {
      return null
    }

    if (parsed.expires && new Date(parsed.expires).getTime() < Date.now()) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function readDemoSessionFromCookieString(cookieHeader: string | null | undefined) {
  if (!cookieHeader) {
    return null
  }

  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DEMO_SESSION_COOKIE}=`))

  if (!entry) {
    return null
  }

  return parseSession(entry.slice(DEMO_SESSION_COOKIE.length + 1))
}

export function setDemoSessionCookie(session: DemoSession) {
  if (typeof document === "undefined") {
    return
  }

  document.cookie = [
    `${DEMO_SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(session))}`,
    "Path=/",
    `Max-Age=${DEMO_SESSION_MAX_AGE}`,
    "SameSite=Lax",
  ].join("; ")
}

export function clearDemoSessionCookie() {
  if (typeof document === "undefined") {
    return
  }

  document.cookie = [
    `${DEMO_SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
  ].join("; ")
}
