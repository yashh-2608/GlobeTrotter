import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../utils/api-error.js"
import { ZodError } from "zod"
import { Prisma } from "../../generated/prisma/client"

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
      error: error.issues[0]?.message ?? "Validation failed",
      issues: error.flatten(),
    })
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ error: error.message })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return res.status(409).json({ error: "This record already exists. Refresh and try again." })
    if (error.code === "P2025") return res.status(404).json({ error: "Record not found" })
    if (error.code === "P2003") return res.status(400).json({ error: "A referenced record does not exist" })
    if (error.code === "P2034") return res.status(409).json({ error: "Another request changed this record. Please retry." })
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({ error: "The database is temporarily unavailable" })
  }

  console.error("Internal Server Error:", error)

  return res.status(500).json({
    error: "Something went wrong while processing your request.",
  })
}
