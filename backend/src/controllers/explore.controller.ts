import type { Request, Response } from "express"
import { listActivities, listDestinations } from "../services/explore.service.js"

export async function listDestinationsController(req: Request, res: Response) {
  const destinations = await listDestinations({
    q: req.query.q?.toString(),
    country: req.query.country?.toString(),
    region: req.query.region?.toString(),
    sort: req.query.sort?.toString(),
  })

  res.json(destinations)
}

export async function listActivitiesController(req: Request, res: Response) {
  const activities = await listActivities({
    q: req.query.q?.toString(),
    destinationId: req.query.destinationId?.toString(),
    category: req.query.category?.toString(),
    sort: req.query.sort?.toString(),
  })

  res.json(activities)
}
