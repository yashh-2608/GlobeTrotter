import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson } from "@/lib/backend-api"
import type { Trip } from "@/types/travel"
import { TripsClient } from "./trips-client"

export default async function TripsPage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  const trips = await backendJson<Trip[]>("/trips", {
    token: session.accessToken,
  }).catch(() => [])

  const upcoming = trips.filter((t) => t.status === "UPCOMING")
  const ongoing = trips.filter((t) => t.status === "ONGOING")
  const completed = trips.filter((t) => t.status === "COMPLETED")

  return <TripsClient upcoming={upcoming} ongoing={ongoing} completed={completed} />
}
