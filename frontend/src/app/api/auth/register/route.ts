import { proxyBackend } from "@/lib/backend-api"

export async function POST(request: Request) {
  const body = await request.json()
  return proxyBackend("/auth/register", {
    method: "POST",
    body,
  })
}
