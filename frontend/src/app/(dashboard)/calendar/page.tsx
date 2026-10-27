import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson } from "@/lib/backend-api"
import { CalendarView } from "@/components/travel/calendar-view"
import type { Trip } from "@/types/travel"

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")
  const trips = await backendJson<Trip[]>("/trips", { token: session.accessToken })
  return <CalendarView trips={trips} />
}
