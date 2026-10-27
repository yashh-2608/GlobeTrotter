import { prisma } from "../config/prisma.js"
import { ApiError } from "../utils/api-error.js"

export async function getDestination(id: string) {
  const destination = await prisma.destination.findUnique({ where: { id }, include: { activities: true } })
  if (!destination) throw new ApiError(404, "Destination not found")
  return destination
}

interface DestinationFilters {
  q?: string
  country?: string
  region?: string
  sort?: string
}

interface ActivityFilters {
  q?: string
  destinationId?: string
  category?: string
  sort?: string
}

export async function listDestinations(filters: DestinationFilters) {
  const destinations = await prisma.destination.findMany({
    where: {
      AND: [
        filters.country ? { country: filters.country } : {},
        filters.region ? { region: filters.region } : {},
        filters.q
          ? {
              OR: [
                { name: { contains: filters.q, mode: "insensitive" } },
                { country: { contains: filters.q, mode: "insensitive" } },
                { region: { contains: filters.q, mode: "insensitive" } },
                { tags: { has: filters.q } },
              ],
            }
          : {},
      ],
    },
    orderBy:
      filters.sort === "cost"
        ? { avgDailyCost: "asc" }
        : filters.sort === "name"
          ? { name: "asc" }
          : { popularity: "desc" },
    include: {
      _count: {
        select: {
          activities: true,
        },
      },
    },
  })

  return destinations
}

export async function listActivities(filters: ActivityFilters) {
  const activities = await prisma.activity.findMany({
    where: {
      AND: [
        filters.destinationId ? { destinationId: filters.destinationId } : {},
        filters.category ? { category: filters.category } : {},
        filters.q
          ? {
              OR: [
                { name: { contains: filters.q, mode: "insensitive" } },
                { description: { contains: filters.q, mode: "insensitive" } },
                { destination: { name: { contains: filters.q, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    },
    include: {
      destination: true,
    },
    orderBy:
      filters.sort === "price"
        ? { estimatedCost: "asc" }
        : filters.sort === "rating"
          ? { rating: "desc" }
          : { createdAt: "desc" },
  })

  return activities
}
