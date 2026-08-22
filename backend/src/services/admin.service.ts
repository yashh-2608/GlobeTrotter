import { prisma } from "../config/prisma.js"

const TREND_DAYS = 7

export async function getAdminStats() {
  const [
    users,
    trips,
    destinations,
    activities,
    activeTrips,
    publicShares,
    budgetAgg,
    usersWithTripCounts,
    recentTrips,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.destination.count(),
    prisma.activity.count(),
    prisma.trip.count({ where: { status: "ONGOING" } }),
    prisma.trip.count({ where: { isPublic: true } }),
    prisma.trip.aggregate({ _sum: { totalBudget: true } }),
    prisma.user.findMany({
      select: {
        _count: { select: { trips: true } },
      },
    }),
    prisma.trip.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    }),
  ])

  const repeatPlanners = usersWithTripCounts.filter((user) => user._count.trips > 1).length
  const retention = users > 0 ? Math.round((repeatPlanners / users) * 100) : 0

  const popularDestinations = await prisma.destination.findMany({
    take: 5,
    orderBy: { popularity: "desc" },
    select: {
      id: true,
      name: true,
      country: true,
      popularity: true,
    },
  })

  const trendStart = new Date()
  trendStart.setHours(0, 0, 0, 0)
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1))

  const tripsInWindow = await prisma.trip.findMany({
    where: { createdAt: { gte: trendStart } },
    select: { createdAt: true },
  })

  const traffic = Array.from({ length: TREND_DAYS }, (_, index) => {
    const day = new Date(trendStart)
    day.setDate(day.getDate() + index)
    const label = day.toLocaleDateString("en-US", { weekday: "short" })

    const value = tripsInWindow.filter((trip) => {
      const created = trip.createdAt
      return (
        created.getFullYear() === day.getFullYear() &&
        created.getMonth() === day.getMonth() &&
        created.getDate() === day.getDate()
      )
    }).length

    return { name: label, value }
  })

  return {
    totals: {
      users,
      trips,
      destinations,
      activities,
      activeTrips,
      publicShares,
      totalBudget: budgetAgg._sum.totalBudget ?? 0,
    },
    retention,
    traffic,
    popularDestinations,
    recentTrips,
  }
}
