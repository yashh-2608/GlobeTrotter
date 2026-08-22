import { notFound } from "next/navigation"
import { CalendarDays, MapPin } from "lucide-react"
import { getMockTripById } from "@/lib/mock-content"

export default async function TripCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = getMockTripById(id)

  if (!trip) {
    notFound()
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
      <section className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{trip.title}</h1>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="min-h-28 rounded-2xl border border-white/8 bg-white/4 p-3 flex flex-col justify-between"
            >
              <div className="text-sm font-semibold text-foreground">{index + 1}</div>
              {index % 6 === 0 && trip.stops[index / 6] && (
                <div className="rounded-xl bg-[#7C8CFF]/10 border border-[#7C8CFF]/15 p-2 text-left">
                  <div className="text-xs font-semibold text-foreground capitalize">
                    {trip.stops[index / 6]?.destination?.name ?? trip.stops[index / 6]?.destinationId}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {trip.stops[index / 6]?.daysCount} days
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <aside className="glass-card p-6 space-y-4">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Itinerary markers</div>
        {trip.stops.map((stop) => (
          <div key={stop.id} className="p-4 rounded-2xl bg-white/4 border border-white/8">
            <div className="text-sm font-semibold text-foreground capitalize">
              {stop.destination?.name ?? stop.destinationId}
            </div>
            <div className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {stop.daysCount} days, {stop.activities.length} activities
            </div>
          </div>
        ))}
      </aside>
    </div>
  )
}
