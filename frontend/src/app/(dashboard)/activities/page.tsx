"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Loader2 } from "lucide-react"
import { ActivityCard } from "@/components/travel/activity-card"
import { cn } from "@/lib/utils"
import type { Activity, Destination } from "@/types/travel"

interface ActivityResult extends Activity {
  destination?: Destination
}

export default function ActivitiesPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [destinationId, setDestinationId] = useState("All")
  const [results, setResults] = useState<ActivityResult[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [destinations, setDestinations] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch("/api/activities")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return
        const arr = Array.isArray(data) ? data as ActivityResult[] : []
        setCategories(["All", ...Array.from(new Set(arr.map((item) => item.category).filter(Boolean)))] as string[])
        const uniqueDestinations = new Map<string, string>()
        for (const item of arr) {
          if (item.destination) uniqueDestinations.set(item.destination.id, item.destination.name)
        }
        setDestinations(Array.from(uniqueDestinations, ([id, name]) => ({ id, name })))
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
    if (category !== "All") params.set("category", category)
    if (destinationId !== "All") params.set("destinationId", destinationId)

    const timeout = setTimeout(() => {
      setIsLoading(true)
      fetch(`/api/activities${params.toString() ? `?${params}` : ""}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: unknown) => setResults(Array.isArray(data) ? data as ActivityResult[] : []))
        .catch((error) => {
          if (error.name !== "AbortError") setResults([])
        })
        .finally(() => setIsLoading(false))
    }, 250)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query, category, destinationId])

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-2">Activity search</p>
          <h1 className="text-4xl font-bold text-foreground">Find the experiences that shape the trip</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Search by activity style, filter by destination, and discover things that are worth
            building an itinerary around.
          </p>
        </div>
        <div className="glass-card p-4 flex items-center gap-3 w-full lg:w-[28rem]">
          <Search className="w-4 h-4 text-primary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search activities..."
            className="w-full bg-transparent outline-none text-foreground placeholder-[#A7ACB8]/60 text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                category === item
                  ? "bg-[#7C8CFF]/15 border-[#7C8CFF]/30 text-primary"
                  : "bg-white/4 border-white/10 text-muted-foreground hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDestinationId("All")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border",
              destinationId === "All"
                ? "bg-[#8BE7FF]/15 border-[#8BE7FF]/30 text-[#8BE7FF]"
                : "bg-white/4 border-white/10 text-muted-foreground hover:text-foreground"
            )}
          >
            All destinations
          </button>
          {destinations.map((item) => (
            <button
              key={item.id}
              onClick={() => setDestinationId(item.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                destinationId === item.id
                  ? "bg-[#8BE7FF]/15 border-[#8BE7FF]/30 text-[#8BE7FF]"
                  : "bg-white/4 border-white/10 text-muted-foreground hover:text-foreground"
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading activities...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {results.map((activity) => (
            <ActivityCard
              key={activity.id}
              id={activity.id}
              name={activity.name}
              location={activity.destination?.name ?? ""}
              image={activity.image ?? ""}
              category={activity.category ?? "Experience"}
              duration={activity.duration ?? undefined}
              estimatedCost={activity.estimatedCost}
              rating={activity.rating ?? 0}
              description={activity.description ?? ""}
              layout="horizontal"
            />
          ))}
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="py-20 text-center text-muted-foreground glass-card">
          No activities match your filters. Try broadening the search.
        </div>
      )}
    </div>
  )
}
