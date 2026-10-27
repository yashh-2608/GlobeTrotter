import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson } from "@/lib/backend-api"
import type { Trip, UserProfile, Destination } from "@/types/travel"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  const [trips, user, destinations] = await Promise.all([
    backendJson<Trip[]>("/trips", {
      token: session.accessToken,
    }),
    backendJson<UserProfile>("/users/me", {
      token: session.accessToken,
    }),
    backendJson<Destination[]>("/destinations"),
  ])

  const upcoming = trips.filter((t) => t.status === "UPCOMING")
  const ongoing = trips.filter((t) => t.status === "ONGOING")
  const completed = trips.filter((t) => t.status === "COMPLETED")

  return (
    <DashboardClient
      userName={user?.name ?? session.user.name ?? "Explorer"}
      upcomingTrips={upcoming}
      ongoingTrips={ongoing}
      completedTrips={completed}
      destinations={destinations}
    />
  )
}
