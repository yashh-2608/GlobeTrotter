import { Router } from "express"
import {
  addStopController,
  addTripActivityController,
  copySharedTripController,
  createTripController,
  deleteStopController,
  deleteTripActivityController,
  deleteTripController,
  getBudgetController,
  getTripController,
  listTripsController,
  shareTripController,
  sharedTripController,
  updateStopController,
  updateTripController,
} from "../controllers/trips.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"

export const tripsRouter = Router()
export const stopsRouter = Router()
export const tripActivitiesRouter = Router()
export const sharedRouter = Router()

tripsRouter.use(requireAuth)
tripsRouter.get("/", asyncHandler(listTripsController))
tripsRouter.post("/", asyncHandler(createTripController))
tripsRouter.get("/:id", asyncHandler(getTripController))
tripsRouter.patch("/:id", asyncHandler(updateTripController))
tripsRouter.delete("/:id", asyncHandler(deleteTripController))
tripsRouter.post("/:id/stops", asyncHandler(addStopController))
tripsRouter.get("/:id/budget", asyncHandler(getBudgetController))
tripsRouter.post("/:id/share", asyncHandler(shareTripController))
tripsRouter.post("/:id/activities", asyncHandler(addTripActivityController))

stopsRouter.use(requireAuth)
stopsRouter.patch("/:id", asyncHandler(updateStopController))
stopsRouter.delete("/:id", asyncHandler(deleteStopController))

tripActivitiesRouter.use(requireAuth)
tripActivitiesRouter.delete("/:id", asyncHandler(deleteTripActivityController))

sharedRouter.get("/:slug", asyncHandler(sharedTripController))
sharedRouter.post("/:slug/copy", requireAuth, asyncHandler(copySharedTripController))
