"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { SafeImage as Image } from "@/components/travel/safe-image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Edit3, Share2, Calendar, MapPin, Wallet,
  ExternalLink, Copy, Check, BarChart2, Layers, Clock
} from "lucide-react"
import { TripTimeline } from "@/components/travel/trip-timeline"
import { ItineraryDay } from "@/components/travel/itinerary-day"
import { BudgetChart } from "@/components/travel/budget-chart"
import { formatDate, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Trip as TravelTrip } from "@/types/travel"

type Trip = TravelTrip

type TabType = "itinerary" | "budget" | "overview"

const tabLabels: { key: TabType; label: string; icon: typeof BarChart2 }[] = [
  { key: "overview", label: "Overview", icon: Layers },
  { key: "itinerary", label: "Itinerary", icon: Calendar },
  { key: "budget", label: "Budget", icon: Wallet },
]

const statusConfig = {
  UPCOMING: { label: "Upcoming", class: "status-upcoming" },
  ONGOING: { label: "Ongoing", class: "status-ongoing" },
  COMPLETED: { label: "Completed", class: "status-completed" },
}

export function TripDetailClient({ trip }: { trip: Trip }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const totalDays = trip.stops.reduce((acc, s) => acc + s.daysCount, 0)
  const totalStops = trip.stops.length
  const estimatedTotal = trip.stops.reduce(
    (acc, s) => acc + s.estimatedCost + s.activities.reduce((a, act) => a + act.estimatedCost, 0),
    0
  )

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const res = await fetch(`/api/trips/${trip.id}/share`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate share link")
      setShareUrl(`${window.location.origin}/shared/${encodeURIComponent(data.shareSlug)}`)
      toast.success("Trip is now public!")
    } catch {
      toast.error("Failed to generate share link")
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopy = async () => {
    if (shareUrl) {
      try { await navigator.clipboard.writeText(shareUrl) } catch { toast.error("Could not copy the link"); return }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Link copied!")
    }
  }

  const heroImg = trip.coverImage ??
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop"

  // Budget data for chart
  const budgetData = {
    transport: trip.stops.flatMap((stop) => stop.activities).filter((activity) => activity.category?.toLowerCase() === "transport").reduce((sum, activity) => sum + activity.estimatedCost, 0),
    accommodation: trip.stops.flatMap((stop) => stop.activities).filter((activity) => activity.category?.toLowerCase() === "accommodation").reduce((sum, activity) => sum + activity.estimatedCost, 0),
    food: trip.stops.flatMap((stop) => stop.activities).filter((activity) => activity.category?.toLowerCase() === "food").reduce((sum, activity) => sum + activity.estimatedCost, 0),
    activities: trip.stops.flatMap((stop) => stop.activities).filter((activity) => !["transport", "food", "accommodation", "other"].includes(activity.category?.toLowerCase() ?? "")).reduce((sum, activity) => sum + activity.estimatedCost, 0),
    other: trip.stops.reduce((sum, stop) => sum + stop.estimatedCost, 0) + trip.stops.flatMap((stop) => stop.activities).filter((activity) => activity.category?.toLowerCase() === "other").reduce((sum, activity) => sum + activity.estimatedCost, 0),
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-72 md:h-96">
        <Image src={heroImg} alt={trip.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-[#050609]/50 to-[#050609]/20" />

        {/* Top bar */}
        <div className="absolute top-20 left-0 right-0 max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-muted-foreground hover:text-foreground text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Link
              href={`/trips/${trip.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-muted-foreground hover:text-foreground text-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit details
            </Link>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-muted-foreground hover:text-foreground text-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-6">
          <div className="mb-2">
            <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", statusConfig[trip.status].class)}>
              {statusConfig[trip.status].label}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{trip.title}</h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {trip.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(trip.startDate)} {trip.endDate ? `→ ${formatDate(trip.endDate)}` : ""}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{totalStops} stops · {totalDays} days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#6EE7B7]" />
              <span className="text-sm text-[#6EE7B7] font-semibold">{formatCurrency(estimatedTotal, trip.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share URL bar */}
      {shareUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-6 py-3"
        >
          <div className="flex items-center gap-3 p-3 rounded-xl glass border border-[#6EE7B7]/20">
            <ExternalLink className="w-4 h-4 text-[#6EE7B7] flex-shrink-0" />
            <span className="flex-1 text-sm text-muted-foreground truncate">{shareUrl}</span>
            <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#6EE7B7]/10 text-[#6EE7B7] text-xs font-medium transition-all hover:bg-[#6EE7B7]/20">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-1 p-1 glass rounded-xl w-fit mb-8">
          {tabLabels.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === key
                  ? "bg-[#7C8CFF]/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <h2 className="text-lg font-bold text-foreground mb-4">Journey Route</h2>
                <TripTimeline
                  currency={trip.currency}
                  stops={trip.stops.map((s) => ({
                    id: s.id,
                    destinationId: s.destinationId,
                    destinationName: s.destination?.name ?? s.destinationId,
                    startDate: s.startDate,
                    endDate: s.endDate,
                    daysCount: s.daysCount,
                    estimatedCost: s.estimatedCost,
                    order: s.order,
                  }))}
                  interactive
                  onStopClick={() => setActiveTab("itinerary")}
                />
              </div>
              <div className="space-y-4">
                {trip.notes && (
                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{trip.notes}</p>
                  </div>
                )}
                <div className="glass-card p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Quick Stats</h3>
                  {[
                    { label: "Total Budget", value: formatCurrency(trip.totalBudget, trip.currency), icon: Wallet, color: "text-primary" },
                    { label: "Estimated Cost", value: formatCurrency(estimatedTotal, trip.currency), icon: BarChart2, color: "text-[#6EE7B7]" },
                    { label: "Total Days", value: `${totalDays} days`, icon: Clock, color: "text-[#FBBF77]" },
                    { label: "Destinations", value: `${totalStops} cities`, icon: MapPin, color: "text-[#8BE7FF]" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("w-4 h-4", color)} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <span className={cn("text-sm font-semibold", color)}>{value}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/trips/${trip.id}/builder`}
                  className="block w-full text-center py-3 rounded-xl btn-primary text-white font-semibold text-sm"
                >
                  Open Itinerary Builder
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === "itinerary" && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {trip.stops.length === 0 ? (
                <div className="text-center py-16">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No itinerary yet</p>
                  <Link href={`/trips/${trip.id}/builder`} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white text-sm font-semibold">
                    Open Builder
                  </Link>
                </div>
              ) : (
                trip.stops.map((stop, i) => (
                  <ItineraryDay
                    currency={trip.currency}
                    key={stop.id}
                    dayNumber={i + 1}
                    date={stop.startDate ? formatDate(stop.startDate) : undefined}
                    city={stop.destination?.name ?? stop.destinationId}
                    activities={stop.activities}
                    totalCost={stop.estimatedCost + stop.activities.reduce((a, act) => a + act.estimatedCost, 0)}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <BudgetChart
                data={budgetData}
                totalBudget={trip.totalBudget}
                spent={estimatedTotal}
                currency={trip.currency}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
