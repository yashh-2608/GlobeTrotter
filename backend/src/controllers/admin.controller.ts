import type { Response } from "express"
import type { AuthenticatedRequest } from "../types/auth.js"
import { getAdminStats } from "../services/admin.service.js"

export async function adminStatsController(_req: AuthenticatedRequest, res: Response) {
  const stats = await getAdminStats()
  res.json(stats)
}
