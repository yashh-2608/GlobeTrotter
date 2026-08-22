import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken } from "@/app/api/_utils"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const { id } = await params
  return proxyBackend(`/trips/${id}/budget`, {
    token: access.token,
  })
}
