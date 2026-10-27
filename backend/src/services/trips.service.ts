import { Prisma } from "../../generated/prisma/client"
import { prisma } from "../config/prisma.js"
import { env } from "../config/env.js"
import { ApiError } from "../utils/api-error.js"
import { parseDate, validateDates, validateWindow } from "../utils/trip-validation.js"

interface CreateTripInput {
  title: string
  status?: "UPCOMING" | "ONGOING" | "COMPLETED"
  coverImage?: string | null
  startDate?: string | null
  endDate?: string | null
  totalBudget?: number
  currency?: string
  notes?: string
  stops?: CreateStopInput[]
}

interface CreateStopInput {
  destinationId?: string
  destinationName?: string
  country?: string
  region?: string
  image?: string
  description?: string
  startDate?: string | null
  endDate?: string | null
  daysCount?: number
  estimatedCost?: number
  notes?: string
}

interface UpdateStopInput {
  startDate?: string | null
  endDate?: string | null
  daysCount?: number
  estimatedCost?: number
  notes?: string
  order?: number
}

interface CreateTripActivityInput {
  tripStopId: string
  activityId?: string
  title: string
  scheduledDate?: string | null
  scheduledTime?: string | null
  duration?: string | null
  notes?: string | null
  estimatedCost?: number
  category?: string | null
}

function generateShareSlug(title: string) {
  const safeTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${safeTitle}-${Math.random().toString(36).slice(2, 8)}`
}

async function ensureDestination(input: CreateStopInput, db: Prisma.TransactionClient = prisma) {
  const destination = input.destinationId
    ? await db.destination.findUnique({ where: { id: input.destinationId } })
    : null
  if (!destination) throw new ApiError(400, "Select an existing destination")
  return destination.id
}

async function lockTrip(tx: Prisma.TransactionClient, userId: string, tripId: string) {
  await tx.$queryRaw`SELECT "id" FROM "Trip" WHERE "id" = ${tripId} AND "userId" = ${userId} FOR UPDATE`
  const trip = await tx.trip.findFirst({ where: { id: tripId, userId } })
  if (!trip) throw new ApiError(404, "Trip not found")
  return trip
}

export async function listTrips(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          destination: true,
          activities: {
            orderBy: { scheduledTime: "asc" },
          },
        },
      },
      expenses: true,
      _count: {
        select: {
          stops: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId,
    },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          destination: true,
          activities: {
            orderBy: { scheduledTime: "asc" },
            include: {
              activity: true,
            },
          },
          expenses: true,
        },
      },
      expenses: true,
      _count: {
        select: {
          stops: true,
        },
      },
    },
  })

  if (!trip) {
    throw new ApiError(404, "Trip not found")
  }

  return trip
}

export async function createTrip(userId: string, input: CreateTripInput) {
  validateDates(input.startDate, input.endDate)
  const stops = input.stops ?? []
  return prisma.$transaction(async (tx) => {
    const stopData = []
    for (const [order, stop] of stops.entries()) {
      validateWindow(stop.startDate, stop.endDate, input.startDate, input.endDate)
      stopData.push({ destinationId: await ensureDestination(stop, tx), order,
        daysCount: stop.daysCount ?? 1, estimatedCost: stop.estimatedCost ?? 0,
        startDate: parseDate(stop.startDate), endDate: parseDate(stop.endDate), notes: stop.notes })
    }
    return tx.trip.create({
    data: {
      userId,
      title: input.title,
      status: input.status ?? "UPCOMING",
      coverImage: input.coverImage,
      startDate: parseDate(input.startDate),
      endDate: parseDate(input.endDate),
      totalBudget: input.totalBudget ?? 0,
      currency: input.currency ?? "INR",
      shareSlug: generateShareSlug(input.title),
      notes: input.notes,
      stops: { create: stopData },
    },
    include: { stops: { orderBy: { order: "asc" }, include: { destination: true, activities: true } } },
    })
  })
}

export async function updateTrip(userId: string, tripId: string, input: Partial<CreateTripInput>) {
  const existing = await getTrip(userId, tripId)
  const start = input.startDate === undefined ? existing.startDate : input.startDate
  const end = input.endDate === undefined ? existing.endDate : input.endDate
  validateDates(start, end)
  for (const stop of existing.stops) validateWindow(stop.startDate, stop.endDate, start, end)

  return prisma.trip.update({
    where: { id: tripId },
    data: {
      title: input.title,
      status: input.status,
      coverImage: input.coverImage,
      startDate: input.startDate === undefined ? undefined : parseDate(input.startDate),
      endDate: input.endDate === undefined ? undefined : parseDate(input.endDate),
      totalBudget: input.totalBudget,
      currency: input.currency,
      notes: input.notes,
    },
  })
}

export async function deleteTrip(userId: string, tripId: string) {
  await getTrip(userId, tripId)
  await prisma.trip.delete({
    where: { id: tripId },
  })
}

export async function addStop(userId: string, tripId: string, input: CreateStopInput) {
  return prisma.$transaction(async (tx) => {
  const trip = await lockTrip(tx, userId, tripId)
  validateWindow(input.startDate, input.endDate, trip.startDate, trip.endDate)
  const destinationId = await ensureDestination(input, tx)
  const lastStop = await tx.tripStop.findFirst({
    where: { tripId },
    orderBy: { order: "desc" },
  })

  return tx.tripStop.create({
    data: {
      tripId,
      destinationId,
      order: (lastStop?.order ?? -1) + 1,
      startDate: parseDate(input.startDate),
      endDate: parseDate(input.endDate),
      daysCount: input.daysCount ?? 1,
      estimatedCost: input.estimatedCost ?? 0,
      notes: input.notes,
    },
    include: {
      destination: true,
      activities: true,
    },
  })
  })
}

export async function updateStop(userId: string, stopId: string, input: UpdateStopInput) {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: {
      trip: true,
    },
  })

  if (!stop || stop.trip.userId !== userId) {
    throw new ApiError(404, "Stop not found")
  }

  validateWindow(input.startDate === undefined ? stop.startDate : input.startDate,
    input.endDate === undefined ? stop.endDate : input.endDate, stop.trip.startDate, stop.trip.endDate)

  return prisma.tripStop.update({
    where: { id: stopId },
    data: {
      startDate: input.startDate === undefined ? undefined : parseDate(input.startDate),
      endDate: input.endDate === undefined ? undefined : parseDate(input.endDate),
      daysCount: input.daysCount,
      estimatedCost: input.estimatedCost,
      notes: input.notes,
    },
    include: {
      destination: true,
      activities: true,
    },
  })
}

export async function deleteStop(userId: string, stopId: string) {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: {
      trip: true,
    },
  })

  if (!stop || stop.trip.userId !== userId) {
    throw new ApiError(404, "Stop not found")
  }

  await prisma.tripStop.delete({
    where: { id: stopId },
  })
}

export async function addTripActivity(userId: string, tripId: string, input: CreateTripActivityInput) {
  await getTrip(userId, tripId)

  const stop = await prisma.tripStop.findUnique({
    where: { id: input.tripStopId },
  })

  if (!stop || stop.tripId !== tripId) {
    throw new ApiError(404, "Trip stop not found")
  }

  validateWindow(input.scheduledDate, input.scheduledDate, stop.startDate, stop.endDate)
  if (input.activityId) {
    const activity = await prisma.activity.findFirst({ where: { id: input.activityId, destinationId: stop.destinationId } })
    if (!activity) throw new ApiError(400, "Activity does not belong to this destination")
  }

  return prisma.tripActivity.create({
    data: {
      tripStopId: input.tripStopId,
      activityId: input.activityId,
      title: input.title,
      scheduledDate: parseDate(input.scheduledDate),
      scheduledTime: input.scheduledTime ?? undefined,
      duration: input.duration ?? undefined,
      notes: input.notes ?? undefined,
      estimatedCost: input.estimatedCost ?? 0,
      category: input.category ?? undefined,
    },
    include: {
      activity: true,
    },
  })
}

export async function deleteTripActivity(userId: string, tripActivityId: string) {
  const tripActivity = await prisma.tripActivity.findUnique({
    where: { id: tripActivityId },
    include: {
      tripStop: {
        include: {
          trip: true,
        },
      },
    },
  })

  if (!tripActivity || tripActivity.tripStop.trip.userId !== userId) {
    throw new ApiError(404, "Trip activity not found")
  }

  await prisma.tripActivity.delete({
    where: { id: tripActivityId },
  })
}

export async function getBudgetSummary(userId: string, tripId: string) {
  const trip = await getTrip(userId, tripId)
  const breakdown = { transport: 0, accommodation: 0, food: 0, activities: 0, other: 0 }
  const categoryKey = (category?: string | null): keyof typeof breakdown => {
    const key = category?.toLowerCase()
    return key && Object.hasOwn(breakdown, key) ? key as keyof typeof breakdown : "activities"
  }
  for (const stop of trip.stops) {
    breakdown.other += stop.estimatedCost
    for (const activity of stop.activities) breakdown[categoryKey(activity.category)] += activity.estimatedCost
  }
  const actualBreakdown = { transport: 0, accommodation: 0, food: 0, activities: 0, other: 0 }
  for (const expense of trip.expenses) actualBreakdown[categoryKey(expense.category)] += expense.amount
  const round = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100
  for (const key of Object.keys(breakdown) as Array<keyof typeof breakdown>) {
    breakdown[key] = round(breakdown[key])
    actualBreakdown[key] = round(actualBreakdown[key])
  }
  const estimated = round(Object.values(breakdown).reduce((sum, value) => sum + value, 0))
  const spent = round(Object.values(actualBreakdown).reduce((sum, value) => sum + value, 0))

  return {
    totalBudget: trip.totalBudget,
    spent,
    estimated,
    remaining: round(trip.totalBudget - spent),
    breakdown,
    actualBreakdown,
    currency: trip.currency,
  }
}

export async function reorderStops(userId: string, tripId: string, stopIds: string[]) {
  await prisma.$transaction(async (tx) => {
    await lockTrip(tx, userId, tripId)
    const stops = await tx.tripStop.findMany({ where: { tripId } })
    if (new Set(stopIds).size !== stopIds.length || stops.length !== stopIds.length || stops.some((stop) => !stopIds.includes(stop.id))) {
      throw new ApiError(400, "Provide every destination stop exactly once")
    }
    // Move positions out of the occupied range before assigning the final order.
    const offset = Math.max(0, ...stops.map((stop) => stop.order)) + stops.length + 1
    await tx.tripStop.updateMany({ where: { tripId }, data: { order: { increment: offset } } })
    for (const [order, id] of stopIds.entries()) await tx.tripStop.update({ where: { id }, data: { order } })
  })
}

export async function autoPlanTrip(userId: string, tripId: string) {
  await prisma.$transaction(async (tx) => {
    await lockTrip(tx, userId, tripId)
    const stops = await tx.tripStop.findMany({ where: { tripId }, include: { activities: true }, orderBy: { order: "asc" } })
    if (!stops.length) throw new ApiError(400, "Add a destination before planning activities")
    for (const stop of stops) {
      // Preserve existing plans; repeated requests must not duplicate activities.
      if (stop.activities.length) continue
      const activities = await tx.activity.findMany({ where: { destinationId: stop.destinationId }, orderBy: { rating: "desc" }, take: Math.min(stop.daysCount * 2, 12) })
      for (const [index, activity] of activities.entries()) {
        const date = stop.startDate ? new Date(stop.startDate) : null
        if (date) date.setUTCDate(date.getUTCDate() + Math.floor(index / 2))
        if (date && stop.endDate && date > stop.endDate) break
        await tx.tripActivity.create({ data: { tripStopId: stop.id, activityId: activity.id, title: activity.name,
          category: activity.category, estimatedCost: activity.estimatedCost, duration: activity.duration,
          scheduledDate: date, scheduledTime: index % 2 ? "15:00" : "10:00" } })
      }
    }
  }, { timeout: 15000 })
  return getTrip(userId, tripId)
}

export async function createShareLink(userId: string, tripId: string) {
  const trip = await getTrip(userId, tripId)

  const shareSlug = trip.shareSlug ?? generateShareSlug(trip.title)

  await prisma.trip.update({
    where: { id: tripId },
    data: {
      shareSlug,
      isPublic: true,
    },
  })

  return {
    shareSlug,
    shareUrl: `${env.FRONTEND_URL}/shared/${shareSlug}`,
  }
}

export async function copySharedTrip(userId: string, shareSlug: string) {
  const source = await getSharedTrip(shareSlug)

  return prisma.trip.create({
    data: {
      userId,
      title: `${source.title} (Copy)`,
      status: "UPCOMING",
      coverImage: source.coverImage,
      startDate: source.startDate,
      endDate: source.endDate,
      totalBudget: source.totalBudget,
      currency: source.currency,
      notes: source.notes,
      stops: {
        create: source.stops.map((stop) => ({
          destinationId: stop.destinationId,
          order: stop.order,
          startDate: stop.startDate,
          endDate: stop.endDate,
          daysCount: stop.daysCount,
          estimatedCost: stop.estimatedCost,
          notes: stop.notes,
          activities: {
            create: stop.activities.map((activity) => ({
              activityId: activity.activityId,
              title: activity.title,
              scheduledDate: activity.scheduledDate,
              scheduledTime: activity.scheduledTime,
              duration: activity.duration,
              notes: activity.notes,
              estimatedCost: activity.estimatedCost,
              category: activity.category,
            })),
          },
        })),
      },
    },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          destination: true,
          activities: true,
        },
      },
    },
  })
}

export async function getSharedTrip(shareSlug: string) {
  const trip = await prisma.trip.findFirst({
    where: {
      shareSlug,
      isPublic: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      stops: {
        orderBy: { order: "asc" },
        include: {
          destination: true,
          activities: {
            orderBy: { scheduledTime: "asc" },
          },
        },
      },
    },
  })

  if (!trip) {
    throw new ApiError(404, "Shared itinerary not found")
  }

  return trip
}
