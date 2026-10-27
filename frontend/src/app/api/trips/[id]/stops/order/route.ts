import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken } from "@/app/api/_utils"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAccessToken()
  if ("response" in access) return access.response
  const { id } = await params
  return proxyBackend(`/trips/${id}/stops/order`, { method: "PUT", token: access.token, body: await request.json() })
}
