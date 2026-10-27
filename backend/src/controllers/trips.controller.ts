import type { Response } from "express"
import { z } from "zod"
import type { AuthenticatedRequest } from "../types/auth.js"
import { dateInput, moneyInput, stopSchema, tripSchema } from "../utils/trip-validation.js"
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
  reorderStops,
  autoPlanTrip,
} from "../services/trips.service.js"

const createTripSchema = tripSchema.extend({ stops: z.array(stopSchema).max(20).optional() })

const updateStopSchema = z.object({
  startDate: dateInput,
  endDate: dateInput,
  daysCount: z.number().int().min(1).max(365).optional(),
  estimatedCost: moneyInput.optional(),
  notes: z.string().optional(),
})

const tripActivitySchema = z.object({
  tripStopId: z.string(),
  activityId: z.string().optional(),
  title: z.string().min(1),
  scheduledDate: dateInput,
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(),
  duration: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  estimatedCost: moneyInput.optional(),
  category: z.string().nullable().optional(),
})

export async function listTripsController(req: AuthenticatedRequest, res: Response) {
  const trips = await listTrips(req.user!.id)
  res.json(trips)
}

export async function createTripController(req: AuthenticatedRequest, res: Response) {
  const input = createTripSchema.parse(req.body)
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

export async function reorderStopsController(req: AuthenticatedRequest, res: Response) {
  const { stopIds } = z.object({ stopIds: z.array(z.string().min(1)).max(100) }).parse(req.body)
  await reorderStops(req.user!.id, req.params.id, stopIds)
  res.json({ saved: true })
}

export async function autoPlanController(req: AuthenticatedRequest, res: Response) {
  const trip = await autoPlanTrip(req.user!.id, req.params.id)
  res.json({ trip })
}
