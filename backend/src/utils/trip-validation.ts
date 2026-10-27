import { z } from "zod"
import { ApiError } from "./api-error.js"

export const dateInput = z.string().regex(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/, "Use an ISO date")
  .refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value.slice(0, 10), "Invalid date")
  .nullable().optional()
export const moneyInput = z.number().finite().nonnegative().max(1_000_000_000)
export const stopSchema = z.object({
  destinationId: z.string().min(1),
  startDate: dateInput,
  endDate: dateInput,
  daysCount: z.number().int().min(1).max(365).optional(),
  estimatedCost: moneyInput.optional(),
  notes: z.string().max(10000).optional(),
})
export const tripSchema = z.object({
  title: z.string().trim().min(1).max(150),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional(),
  coverImage: z.string().url().nullable().optional(),
  startDate: dateInput,
  endDate: dateInput,
  totalBudget: moneyInput.optional(),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"]).optional(),
  notes: z.string().max(10000).optional(),
})

export function parseDate(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) throw new ApiError(400, "Invalid date")
  return date
}

export function validateDates(start?: string | Date | null, end?: string | Date | null) {
  if (start && end && new Date(start) > new Date(end)) {
    throw new ApiError(400, "The end date must be on or after the start date")
  }
}

export function validateWindow(start: string | Date | null | undefined, end: string | Date | null | undefined, parentStart?: string | Date | null, parentEnd?: string | Date | null) {
  validateDates(start, end)
  for (const value of [start, end]) {
    if (value && ((parentStart && new Date(value) < new Date(parentStart)) || (parentEnd && new Date(value) > new Date(parentEnd)))) {
      throw new ApiError(400, "Dates must fall within the trip or destination dates")
    }
  }
}
