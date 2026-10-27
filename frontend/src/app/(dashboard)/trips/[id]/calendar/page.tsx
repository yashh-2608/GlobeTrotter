import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import { CalendarView } from "@/components/travel/calendar-view"
import type { Trip } from "@/types/travel"

export default async function TripCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.accessToken) redirect("/login")
  const trip = await backendJson<Trip>(`/trips/${id}`, { token: session.accessToken }).catch((error) => {
    if (error instanceof BackendError && error.status === 404) notFound()
    throw error
  })
  return <CalendarView trips={[trip]} title={trip.title} />
}
