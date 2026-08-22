import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken } from "@/app/api/_utils"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const body = await request.json()
  const { id } = await params

  return proxyBackend(`/stops/${id}`, {
    method: "PATCH",
    token: access.token,
    body,
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const { id } = await params
  return proxyBackend(`/stops/${id}`, {
    method: "DELETE",
    token: access.token,
  })
}
