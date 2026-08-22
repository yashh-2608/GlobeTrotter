import type { Response } from "express"
import { z } from "zod"
import type { AuthenticatedRequest } from "../types/auth.js"
import {
  addStop,
  addTripActivity,
  copySharedTrip,
  createShareLink,
  createTrip,
  deleteStop,
  deleteTrip,
  deleteTripActivity,
  getBudgetSummary,
  getSharedTrip,
  getTrip,
  listTrips,
  updateStop,
  updateTrip,
} from "../services/trips.service.js"

const tripSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]).optional(),
  coverImage: z.string().url().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  totalBudget: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
})

const stopSchema = z.object({
  destinationId: z.string().optional(),
  destinationName: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  daysCount: z.number().int().positive().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
})

const updateStopSchema = z.object({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  daysCount: z.number().int().positive().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
})

const tripActivitySchema = z.object({
  tripStopId: z.string(),
  activityId: z.string().optional(),
  title: z.string().min(1),
  scheduledDate: z.string().nullable().optional(),
  scheduledTime: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  category: z.string().nullable().optional(),
})

export async function listTripsController(req: AuthenticatedRequest, res: Response) {
  const trips = await listTrips(req.user!.id)
  res.json(trips)
}

export async function createTripController(req: AuthenticatedRequest, res: Response) {
  const input = tripSchema.parse(req.body)
  const trip = await createTrip(req.user!.id, input)
  res.status(201).json({ trip })
}

export async function getTripController(req: AuthenticatedRequest, res: Response) {
  const trip = await getTrip(req.user!.id, req.params.id)
  res.json(trip)
}

export async function updateTripController(req: AuthenticatedRequest, res: Response) {
  const input = tripSchema.partial().parse(req.body)
  const trip = await updateTrip(req.user!.id, req.params.id, input)
  res.json({ trip })
}

export async function deleteTripController(req: AuthenticatedRequest, res: Response) {
  await deleteTrip(req.user!.id, req.params.id)
  res.status(204).send()
}

export async function addStopController(req: AuthenticatedRequest, res: Response) {
  const input = stopSchema.parse(req.body)
  const stop = await addStop(req.user!.id, req.params.id, input)
  res.status(201).json({ stop })
}

export async function updateStopController(req: AuthenticatedRequest, res: Response) {
  const input = updateStopSchema.parse(req.body)
  const stop = await updateStop(req.user!.id, req.params.id, input)
  res.json({ stop })
}

export async function deleteStopController(req: AuthenticatedRequest, res: Response) {
  await deleteStop(req.user!.id, req.params.id)
  res.status(204).send()
}

export async function addTripActivityController(req: AuthenticatedRequest, res: Response) {
  const input = tripActivitySchema.parse(req.body)
  const activity = await addTripActivity(req.user!.id, req.params.id, input)
  res.status(201).json({ activity })
}

export async function deleteTripActivityController(req: AuthenticatedRequest, res: Response) {
  await deleteTripActivity(req.user!.id, req.params.id)
  res.status(204).send()
}

export async function getBudgetController(req: AuthenticatedRequest, res: Response) {
  const budget = await getBudgetSummary(req.user!.id, req.params.id)
  res.json(budget)
}

export async function shareTripController(req: AuthenticatedRequest, res: Response) {
  const share = await createShareLink(req.user!.id, req.params.id)
  res.json(share)
}

export async function sharedTripController(req: AuthenticatedRequest, res: Response) {
  const trip = await getSharedTrip(req.params.slug)
  res.json(trip)
}

export async function copySharedTripController(req: AuthenticatedRequest, res: Response) {
  const trip = await copySharedTrip(req.user!.id, req.params.slug)
  res.status(201).json({ trip })
}
