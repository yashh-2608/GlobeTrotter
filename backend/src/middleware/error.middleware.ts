import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../utils/api-error.js"
import { ZodError } from "zod"

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found"))
}

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: error.flatten(),
    })
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ error: error.message })
  }

  return res.status(500).json({
    error: "Something went wrong while processing your request.",
  })
}
