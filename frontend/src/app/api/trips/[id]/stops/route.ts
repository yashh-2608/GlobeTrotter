import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken } from "@/app/api/_utils"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const body = await request.json()
  const { id } = await params

  return proxyBackend(`/trips/${id}/stops`, {
    method: "POST",
    token: access.token,
    body,
  })
}
