import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import type { Trip } from "@/types/travel"
import { notFound, redirect } from "next/navigation"
import { TripEditForm } from "./trip-edit-form"

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.accessToken) redirect("/login")

  const trip = await backendJson<Trip>(`/trips/${id}`, { token: session.accessToken }).catch((error) => {
    if (error instanceof BackendError && error.status === 404) return null
    if (error instanceof BackendError && error.status === 401) return "unauthorized" as const
    throw error
  })

  if (trip === "unauthorized") redirect(`/login?callbackUrl=${encodeURIComponent(`/trips/${id}/edit`)}&sessionExpired=1`)
  if (!trip) notFound()

  return <TripEditForm trip={trip} />
}
