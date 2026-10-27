import type { NextFunction, Request, Response } from "express"
import type { AuthenticatedRequest } from "../types/auth.js"

type AsyncRoute = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>

export function asyncHandler(handler: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req as AuthenticatedRequest, res, next).catch(next)
  }
}
