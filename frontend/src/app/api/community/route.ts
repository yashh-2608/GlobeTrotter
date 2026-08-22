import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken, withSearch } from "../_utils"

export async function GET(request: Request) {
  return proxyBackend(withSearch("/community", request))
}

export async function POST(request: Request) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const body = await request.json()

  return proxyBackend("/community", {
    method: "POST",
    token: access.token,
    body,
  })
}
