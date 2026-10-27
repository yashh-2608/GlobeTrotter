import type { Request } from "express"
import type { UserRole } from "../../generated/prisma/client"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

export interface AuthenticatedRequest extends Request<Record<string, string>> {
  user?: AuthUser
}
