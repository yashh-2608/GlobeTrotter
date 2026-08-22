import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function requireAccessToken() {
  const session = await auth()

  if (!session?.accessToken) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const
  }

  return { token: session.accessToken } as const
}

export function withSearch(path: string, request: Request) {
  const search = new URL(request.url).search
  return search ? `${path}${search}` : path
}
