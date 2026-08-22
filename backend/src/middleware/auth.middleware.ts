import type { NextFunction, Response } from "express"
import { ApiError } from "../utils/api-error.js"
import { verifyAccessToken } from "../utils/jwt.js"
import type { AuthenticatedRequest } from "../types/auth.js"
import type { UserRole } from "../../generated/prisma/client"

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"))
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length))
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    }
    return next()
  } catch {
    return next(new ApiError(401, "Invalid or expired session"))
  }
}

export function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Administrator access required"))
  }

  return next()
}
