import { proxyBackend } from "@/lib/backend-api"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return proxyBackend(`/shared/${slug}`)
}
