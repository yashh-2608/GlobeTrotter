"use client"

import { useEffect, useState } from "react"
import { Search, SlidersHorizontal, Loader2 } from "lucide-react"
import { DestinationCard } from "@/components/travel/destination-card"
import { cn } from "@/lib/utils"
import type { Destination } from "@/types/travel"
import { readApiResponse } from "@/lib/api-response"

export default function DestinationsPage() {
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("All")
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false

    fetch("/api/destinations")
      .then(readApiResponse<Destination[]>)
      .then((data: Destination[]) => {
        if (cancelled) return
        setRegions(["All", ...Array.from(new Set(data.map((item) => item.region)))])
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (region !== "All") params.set("region", region)

    const timeout = setTimeout(() => {
      setIsLoading(true)
      setLoadError("")
      fetch(`/api/destinations${params.toString() ? `?${params}` : ""}`, { signal: controller.signal })
        .then(readApiResponse<Destination[]>)
        .then((data: Destination[]) => setDestinations(data))
        .catch((error) => {
          if (error.name !== "AbortError") { setLoadError(error.message); setDestinations([]) }
        })
        .finally(() => { if (!controller.signal.aborted) setIsLoading(false) })
    }, 250)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query, region])

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-2">Destination library</p>
          <h1 className="text-4xl font-bold text-foreground">Browse places worth planning around</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Filter by region or search for the mood you want, then open a destination card for a
            faster path into trip planning.
          </p>
        </div>
        <div className="glass-card p-4 flex items-center gap-3 w-full lg:w-[28rem]">
          <Search className="w-4 h-4 text-primary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places, countries, vibes..."
            className="w-full bg-transparent outline-none text-foreground placeholder-[#A7ACB8]/60 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground mr-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter
        </div>
        {regions.map((item) => (
          <button
            key={item}
            onClick={() => setRegion(item)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border",
              region === item
                ? "bg-[#7C8CFF]/15 border-[#7C8CFF]/30 text-primary"
                : "bg-white/4 border-white/10 text-muted-foreground hover:text-foreground"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading destinations...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              id={destination.id}
              name={destination.name}
              country={destination.country}
              image={destination.image}
              description={destination.description}
              avgDailyCost={destination.avgDailyCost}
              popularity={destination.popularity}
              recommendedDays={destination.recommendedDays}
              bestTimeToVisit={destination.bestTimeToVisit ?? undefined}
              tags={destination.tags}
              size="md"
            />
          ))}
        </div>
      )}

      {loadError && <p role="alert" className="text-destructive">{loadError}. Change a filter to retry.</p>}
      {!isLoading && !loadError && destinations.length === 0 && (
        <div className="py-20 text-center text-muted-foreground glass-card">
          No destinations match your search. Try another region or a broader keyword.
        </div>
      )}
    </div>
  )
}
