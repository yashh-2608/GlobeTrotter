import type { Request, Response } from "express"
import { getDestination, listActivities, listDestinations } from "../services/explore.service.js"
import { routeParam } from "../utils/route-param.js"

export async function getDestinationController(req: Request, res: Response) {
  res.json(await getDestination(routeParam(req.params.id)))
}

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
