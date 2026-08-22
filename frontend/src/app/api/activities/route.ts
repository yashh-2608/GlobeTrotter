import { proxyBackend } from "@/lib/backend-api"
import { withSearch } from "../_utils"

export async function GET(request: Request) {
  return proxyBackend(withSearch("/activities", request))
}
