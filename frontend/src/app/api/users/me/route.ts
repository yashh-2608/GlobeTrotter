import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken } from "@/app/api/_utils"

export async function GET() {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  return proxyBackend("/users/me", {
    token: access.token,
  })
}

export async function PATCH(request: Request) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const body = await request.json()

  return proxyBackend("/users/me", {
    method: "PATCH",
    token: access.token,
    body,
  })
}

export async function DELETE() {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  return proxyBackend("/users/me", {
    method: "DELETE",
    token: access.token,
  })
}
