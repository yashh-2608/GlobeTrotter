import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken, withSearch } from "../_utils"

export async function GET(request: Request) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  return proxyBackend(withSearch("/trips", request), {
    token: access.token,
  })
}

export async function POST(request: Request) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const body = await request.json()

  return proxyBackend("/trips", {
    method: "POST",
    token: access.token,
    body,
  })
}
