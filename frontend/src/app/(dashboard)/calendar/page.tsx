import { redirect } from "next/navigation"
import { CalendarDays, Clock3, MapPin } from "lucide-react"
import { auth } from "@/auth"
import { backendJson } from "@/lib/backend-api"
import type { Trip } from "@/types/travel"

interface CalendarEvent {
  date: string
  title: string
  time: string
  location: string
  color: string
}

const EVENT_COLORS = ["text-primary", "text-[#8BE7FF]", "text-[#6EE7B7]", "text-[#FBBF77]", "text-[#FB7185]"]

function toDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString().slice(0, 10)
}

function buildEvents(trips: Trip[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  let colorIndex = 0

  for (const trip of trips) {
    for (const stop of trip.stops) {
      const destinationName = stop.destination?.name ?? stop.destinationId

      if (stop.startDate) {
        events.push({
          date: toDateKey(stop.startDate),
          title: `Arrive in ${destinationName}`,
          time: "—",
          location: destinationName,
          color: EVENT_COLORS[colorIndex++ % EVENT_COLORS.length],
        })
      }

      for (const activity of stop.activities) {
        if (!activity.scheduledDate) continue

        events.push({
          date: toDateKey(activity.scheduledDate),
          title: activity.title ?? activity.name,
          time: activity.scheduledTime ?? "—",
          location: destinationName,
          color: EVENT_COLORS[colorIndex++ % EVENT_COLORS.length],
        })
      }
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  const trips = await backendJson<Trip[]>("/trips", { token: session.accessToken }).catch(() => [])
  const events = buildEvents(trips)
  const eventsByDate = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const existing = eventsByDate.get(event.date) ?? []
    existing.push(event)
    eventsByDate.set(event.date, existing)
  }

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthLabel = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()
  const todayKey = toDateKey(today)

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  const upcoming = events.filter((event) => event.date >= todayKey).slice(0, 6)

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
      <section className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          </div>
          <span className="text-sm text-muted-foreground">{monthLabel}</span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-28" />
            }

            const dateKey = toDateKey(new Date(year, month, day))
            const dayEvents = eventsByDate.get(dateKey) ?? []
            const isToday = dateKey === todayKey

            return (
              <div
                key={dateKey}
                className={`min-h-28 rounded-2xl border p-3 flex flex-col justify-between gap-1 ${
                  isToday ? "border-primary/40 bg-primary/8" : "border-white/8 bg-white/4"
                }`}
              >
                <div className="text-sm font-semibold text-foreground">{day}</div>
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={`${event.date}-${event.title}`}
                    className="rounded-xl bg-[#7C8CFF]/10 border border-[#7C8CFF]/15 p-2 text-left"
                  >
                    <div className="text-xs font-semibold text-foreground line-clamp-1">{event.title}</div>
                    {event.time !== "—" && <div className="text-[11px] text-muted-foreground mt-1">{event.time}</div>}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="glass-card p-6">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Upcoming stops</div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((event) => (
                <div key={`${event.date}-${event.title}`} className="p-3 rounded-2xl bg-white/4 border border-white/8">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{event.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    </div>
                    <div className={`text-xs font-semibold ${event.color}`}>{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming stops yet. Plan a trip to see it here.</p>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Time block</div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock3 className="w-4 h-4 text-[#8BE7FF]" />
            Keep your mornings open and stack the bigger moves later in the day.
          </div>
        </div>
      </aside>
    </div>
  )
}
