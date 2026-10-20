import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import type { Trip } from "@/types/travel"
import { TripsClient } from "./trips-client"

export default async function TripsPage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  const trips = await backendJson<Trip[]>("/trips", {
    token: session.accessToken,
  }).catch((error) => {
    if (error instanceof BackendError && error.status === 401) {
      return null
    }
    return []
  })

  if (trips === null) {
    redirect("/login")
  }

  const tripsArray = Array.isArray(trips) ? trips : []
  const upcoming = tripsArray.filter((t) => t.status === "UPCOMING")
  const ongoing = tripsArray.filter((t) => t.status === "ONGOING")
  const completed = tripsArray.filter((t) => t.status === "COMPLETED")

  return <TripsClient upcoming={upcoming} ongoing={ongoing} completed={completed} />
}
