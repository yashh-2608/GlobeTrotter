import type { Response } from "express"
import { z } from "zod"
import type { AuthenticatedRequest } from "../types/auth.js"
import { getCurrentUser, updateCurrentUser } from "../services/users.service.js"

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  preferences: z.array(z.string()).optional(),
})

export async function getMeController(req: AuthenticatedRequest, res: Response) {
  const user = await getCurrentUser(req.user!.id)
  res.json(user)
}

export async function updateMeController(req: AuthenticatedRequest, res: Response) {
  const input = updateProfileSchema.parse(req.body)
  const user = await updateCurrentUser(req.user!.id, input)
  res.json(user)
}
