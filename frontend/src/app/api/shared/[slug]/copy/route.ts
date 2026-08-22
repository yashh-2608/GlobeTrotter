import { proxyBackend } from "@/lib/backend-api"
import { requireAccessToken } from "@/app/api/_utils"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const access = await requireAccessToken()
  if ("response" in access) {
    return access.response
  }

  const { slug } = await params

  return proxyBackend(`/shared/${slug}/copy`, {
    method: "POST",
    token: access.token,
  })
}
