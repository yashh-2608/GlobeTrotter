import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import type { Trip } from "@/types/travel"
import { notFound, redirect } from "next/navigation"
import { BuilderClient } from "./builder-client"

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.accessToken) return null

  const trip = await backendJson<Trip>(`/trips/${id}`, {
    token: session.accessToken,
  }).catch((error) => {
    if (error instanceof BackendError && error.status === 404) {
      return null
    }
    if (error instanceof BackendError && error.status === 401) {
      return "unauthorized" as const
    }

    throw error
  })

  if (trip === "unauthorized") {
    redirect("/login")
  }

  if (!trip) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <BuilderClient
        tripId={trip.id}
        tripTitle={trip.title}
        stops={trip.stops}
        currency={trip.currency}
      />
    </div>
  )
}
