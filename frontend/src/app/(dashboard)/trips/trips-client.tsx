"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, Map } from "lucide-react"
import { TripCard } from "@/components/travel/trip-card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Trip as TravelTrip } from "@/types/travel"

type Trip = TravelTrip

type TabType = "all" | "upcoming" | "ongoing" | "completed"

export function TripsClient({
  upcoming,
  ongoing,
  completed,
}: {
  upcoming: Trip[]
  ongoing: Trip[]
  completed: Trip[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [search, setSearch] = useState("")

  const allTrips = [...ongoing, ...upcoming, ...completed]

  const tabMap: Record<TabType, Trip[]> = {
    all: allTrips,
    upcoming,
    ongoing,
    completed,
  }

  const filtered = tabMap[activeTab].filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/trips/${id}`, { method: "DELETE" })
      toast.success("Trip deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete trip")
    }
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "all", label: "All Trips", count: allTrips.length },
    { key: "ongoing", label: "Ongoing", count: ongoing.length },
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "completed", label: "Completed", count: completed.length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Trips</h1>
            <p className="text-muted-foreground mt-1">All your adventures, in one place</p>
          </div>
          <Link
            href="/trips/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Link>
        </div>
      </motion.div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="w-full h-10 pl-9 pr-4 rounded-xl glass border border-border text-foreground placeholder-[#A7ACB8]/50 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 p-1 glass rounded-xl w-fit">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "relative px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === key
                ? "bg-[#7C8CFF]/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                "ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                activeTab === key ? "bg-[#7C8CFF]/20 text-primary" : "bg-white/8 text-muted-foreground"
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#7C8CFF]/10 flex items-center justify-center mb-5">
            <Map className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {search ? "No trips match your search" : "No trips here yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search ? "Try a different keyword" : "Start planning your next adventure"}
          </p>
          {!search && (
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white font-semibold text-sm"
            >
              <Plus className="w-4 h-4" /> Plan a Trip
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trip, i) => (
            <TripCard
              key={trip.id}
              id={trip.id}
              title={trip.title}
              coverImage={trip.coverImage}
              status={trip.status}
              startDate={trip.startDate}
              endDate={trip.endDate}
              totalBudget={trip.totalBudget}
              destinations={trip.stops.map((s) => s.destination?.name ?? s.destinationId)}
              index={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
