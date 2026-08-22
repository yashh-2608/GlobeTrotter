import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken } from "@/app/api/_utils"

export async function GET() {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  return proxyBackend("/admin/stats", {
    token: access.token,
  })
}
