import { SafeImage as Image } from "@/components/travel/safe-image"
import { MapPin, Share2 } from "lucide-react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import { TripTimeline } from "@/components/travel/trip-timeline"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { Trip } from "@/types/travel"
import { SharedTripActions } from "./shared-trip-actions"

interface SharedTrip extends Trip {
  user?: {
    id: string
    name: string
    username: string
    avatar?: string | null
  }
}

export default async function SharedTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  const trip = await backendJson<SharedTrip>(`/shared/${slug}`).catch((error) => {
    if (error instanceof BackendError && error.status === 404) {
      return null
    }
    throw error
  })

  if (!trip) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={trip.coverImage ?? ""} alt={trip.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-[#050609]/55 to-[#050609]/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16 min-h-[70vh] flex items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-border text-[#8BE7FF] text-xs font-medium mb-5">
              <Share2 className="w-3.5 h-3.5" />
              Public itinerary
            </div>
            <h1 className="hero-display text-foreground mb-5">{trip.title}</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              {formatDate(trip.startDate)} {trip.endDate ? `- ${formatDate(trip.endDate)}` : ""} · {formatCurrency(trip.totalBudget, trip.currency)}
            </p>
            {trip.user && (
              <p className="text-sm text-muted-foreground mt-2">Curated by @{trip.user.username}</p>
            )}

            <SharedTripActions slug={slug} isAuthenticated={Boolean(session?.accessToken)} />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="space-y-5">
          <TripTimeline
              currency={trip.currency}
            stops={trip.stops.map((stop) => ({
              id: stop.id,
              destinationId: stop.destinationId,
              destinationName: stop.destination?.name ?? stop.destinationId,
              startDate: stop.startDate,
              endDate: stop.endDate,
              daysCount: stop.daysCount,
              estimatedCost: stop.estimatedCost,
              order: stop.order,
            }))}
          />
        </div>

        <aside className="space-y-4">
          {trip.notes && (
            <div className="glass-card p-6">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">About this trip</div>
              <p className="text-sm text-foreground leading-relaxed">{trip.notes}</p>
            </div>
          )}

          <div className="glass-card p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Stops</div>
            <div className="space-y-3">
              {trip.stops.map((stop) => (
                <div key={stop.id} className="rounded-2xl bg-white/4 border border-white/8 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{stop.destination?.name ?? stop.destinationId}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {stop.activities.length} activities
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#6EE7B7]">{formatCurrency(stop.estimatedCost, trip.currency)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
