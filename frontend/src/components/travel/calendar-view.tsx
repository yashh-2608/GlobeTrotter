"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Trip } from "@/types/travel"

export function CalendarView({ trips, title = "Travel calendar" }: { trips: Trip[]; title?: string }) {
  const [month, setMonth] = useState(() => {
    const initial = trips.length === 1 && trips[0].startDate ? new Date(trips[0].startDate) : new Date()
    return new Date(Date.UTC(initial.getUTCFullYear(), initial.getUTCMonth(), 1))
  })
  const events = useMemo(() => trips.flatMap((trip) => trip.stops.flatMap((stop) => {
    const location = stop.destination?.name ?? stop.destinationId
    const result = stop.startDate ? [{ date: new Date(stop.startDate).toISOString().slice(0, 10), title: `Arrive in ${location}`, time: "", tripId: trip.id }] : []
    return [...result, ...stop.activities.filter((activity) => activity.scheduledDate).map((activity) => ({
      date: new Date(activity.scheduledDate!).toISOString().slice(0, 10), title: activity.title ?? activity.name,
      time: activity.scheduledTime ?? "", tripId: trip.id,
    }))]
  })).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [trips])
  const year = month.getUTCFullYear()
  const monthIndex = month.getUTCMonth()
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const cells = [...Array.from({ length: month.getUTCDay() }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const visible = events.filter((event) => event.date.startsWith(month.toISOString().slice(0, 7)))
  const move = (delta: number) => setMonth(new Date(Date.UTC(year, monthIndex + delta, 1)))

  return <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-12 space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        <button onClick={() => move(-1)} aria-label="Previous month" className="glass rounded-xl p-3"><ChevronLeft className="h-4 w-4" /></button>
        <h2 aria-live="polite" className="min-w-36 text-center text-sm font-semibold">{month.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}</h2>
        <button onClick={() => move(1)} aria-label="Next month" className="glass rounded-xl p-3"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
    <section className="glass-card p-2 sm:p-5" aria-label="Month overview">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-2 text-[10px] sm:text-xs text-muted-foreground">{day}</div>)}
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} />
          const key = new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10)
          const items = events.filter((event) => event.date === key)
          return <div key={key} className="min-w-0 min-h-16 sm:min-h-28 rounded-lg border border-border p-1 sm:p-2 text-left">
            <span className="text-xs sm:text-sm font-semibold">{day}</span>
            {items.length > 0 && <div className="sm:hidden mt-2 rounded-full h-1.5 w-1.5 bg-primary" aria-label={`${items.length} events`} />}
            <div className="hidden sm:block space-y-1 mt-1">{items.slice(0, 2).map((event, i) => <Link key={i} href={`/trips/${event.tripId}`} className="block truncate rounded bg-primary/10 p-1 text-[11px] text-primary" title={event.title}>{event.time} {event.title}</Link>)}
              {items.length > 2 && <span className="text-[10px] text-muted-foreground">+{items.length - 2} more below</span>}
            </div>
          </div>
        })}
      </div>
    </section>
    <section className="glass-card p-5">
      <h2 className="font-semibold mb-4">Plans this month</h2>
      {visible.length ? <ul className="space-y-3">{visible.map((event, i) => <li key={i} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
        <time className="shrink-0 text-sm text-primary" dateTime={event.date}>{new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })}</time>
        <Link href={`/trips/${event.tripId}`} className="min-w-0 text-sm hover:text-primary">{event.title}<span className="block text-xs text-muted-foreground">{event.time || "Time not set"}</span></Link>
      </li>)}</ul> : <p className="text-sm text-muted-foreground">No dated plans this month. Add arrival dates and activity dates in your itinerary builder.</p>}
    </section>
  </div>
}
