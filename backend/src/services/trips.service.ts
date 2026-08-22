import { ExpenseCategory } from "../../generated/prisma/client"
import { prisma } from "../config/prisma.js"
import { env } from "../config/env.js"
import { ApiError } from "../utils/api-error.js"

interface CreateTripInput {
  title: string
  status?: "UPCOMING" | "ONGOING" | "COMPLETED"
  coverImage?: string
  startDate?: string | null
  endDate?: string | null
  totalBudget?: number
  currency?: string
  notes?: string
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

function parseDate(value?: string | null) {
  return value ? new Date(value) : undefined
}

async function ensureDestination(input: CreateStopInput) {
  if (input.destinationId) {
    const existing = await prisma.destination.findUnique({
      where: { id: input.destinationId },
    })

    if (existing) {
      return existing.id
    }
  }

  const name = input.destinationName ?? input.destinationId ?? "Untitled Destination"
  const country = input.country ?? "TBD"

  const existingByName = await prisma.destination.findFirst({
    where: {
      name,
      country,
    },
  })

  if (existingByName) {
    return existingByName.id
  }

  const created = await prisma.destination.create({
    data: {
      name,
      country,
      region: input.region ?? "Global",
      image:
        input.image ??
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop",
      description: input.description ?? `${name} is ready to be explored.`,
      avgDailyCost: input.estimatedCost ?? 0,
      popularity: 80,
      bestTimeToVisit: "Year round",
      recommendedDays: input.daysCount ?? 3,
      tags: [],
    },
  })

  return created.id
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
  return prisma.trip.create({
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
    },
  })
}

export async function updateTrip(userId: string, tripId: string, input: Partial<CreateTripInput>) {
  await getTrip(userId, tripId)

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
  await getTrip(userId, tripId)

  const destinationId = await ensureDestination(input)

  const lastStop = await prisma.tripStop.findFirst({
    where: { tripId },
    orderBy: { order: "desc" },
  })

  return prisma.tripStop.create({
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

  return prisma.tripStop.update({
    where: { id: stopId },
    data: {
      startDate: input.startDate === undefined ? undefined : parseDate(input.startDate),
      endDate: input.endDate === undefined ? undefined : parseDate(input.endDate),
      daysCount: input.daysCount,
      estimatedCost: input.estimatedCost,
      notes: input.notes,
      order: input.order,
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

  const transport =
    trip.expenses
      .filter((expense) => expense.category === ExpenseCategory.TRANSPORT)
      .reduce((sum, expense) => sum + expense.amount, 0) +
    trip.stops
      .flatMap((stop) => stop.activities)
      .filter((activity) => activity.category?.toLowerCase() === "transport")
      .reduce((sum, activity) => sum + activity.estimatedCost, 0)

  const accommodation =
    trip.expenses
      .filter((expense) => expense.category === ExpenseCategory.ACCOMMODATION)
      .reduce((sum, expense) => sum + expense.amount, 0) +
    trip.stops.reduce((sum, stop) => sum + stop.estimatedCost, 0)

  const food = trip.expenses
    .filter((expense) => expense.category === ExpenseCategory.FOOD)
    .reduce((sum, expense) => sum + expense.amount, 0)

  const activities =
    trip.expenses
      .filter((expense) => expense.category === ExpenseCategory.ACTIVITIES)
      .reduce((sum, expense) => sum + expense.amount, 0) +
    trip.stops
      .flatMap((stop) => stop.activities)
      .filter((activity) => activity.category?.toLowerCase() !== "transport")
      .reduce((sum, activity) => sum + activity.estimatedCost, 0)

  const other = trip.expenses
    .filter((expense) => expense.category === ExpenseCategory.OTHER)
    .reduce((sum, expense) => sum + expense.amount, 0)

  const spent = transport + accommodation + food + activities + other

  return {
    totalBudget: trip.totalBudget,
    spent,
    remaining: trip.totalBudget - spent,
    breakdown: {
      transport,
      accommodation,
      food,
      activities,
      other,
    },
    currency: trip.currency,
  }
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
