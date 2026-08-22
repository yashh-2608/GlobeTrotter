"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Plus, ArrowRight, MapPin, Calendar, Sparkles,
  Globe, Compass, TrendingUp
} from "lucide-react"
import { TripCard } from "@/components/travel/trip-card"
import { DestinationCard } from "@/components/travel/destination-card"
import { DESTINATIONS } from "@/lib/data"
import { formatDate, getDaysRemaining } from "@/lib/utils"
import { toast } from "sonner"
import type { Trip as TravelTrip } from "@/types/travel"

type Trip = TravelTrip

interface DashboardClientProps {
  userName: string
  upcomingTrips: Trip[]
  ongoingTrips: Trip[]
  completedTrips: Trip[]
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&auto=format&fit=crop",
]

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

function HeroSection({ userName, nextTrip }: { userName: string; nextTrip: Trip | null }) {
  const daysLeft = nextTrip?.startDate ? getDaysRemaining(nextTrip.startDate) : null

  return (
    <div className="relative min-h-[70vh] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGES[0]}
          alt="Hero destination"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-[#050609]/50 to-[#050609]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/60 to-transparent" />
      </div>

      {/* Floating ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#7C8CFF]/40 animate-float"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-primary animate-spin-slow" />
            <span className="text-sm font-medium text-primary">GlobeTrotter Dashboard</span>
          </div>
          <h1 className="hero-display text-foreground mb-4">
            {getGreeting(userName.split(" ")[0])}
            <span className="block gradient-text">Where next?</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8">
            {nextTrip
              ? `Your next adventure to ${nextTrip.title} is ${daysLeft && daysLeft > 0 ? `${daysLeft} days away` : "coming up soon"}`
              : "You have no upcoming trips yet. Start planning your next escape."}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap gap-3"
        >
          <Link
            href="/trips/new"
            className="flex items-center gap-2 px-6 py-3 rounded-full btn-primary text-white font-semibold text-sm shadow-xl shadow-[#7C8CFF]/20"
          >
            <Plus className="w-4 h-4" />
            Plan New Trip
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 px-6 py-3 rounded-full glass border border-border text-foreground font-semibold text-sm hover:bg-white/8 transition-all"
          >
            <Compass className="w-4 h-4" />
            Explore Destinations
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center gap-6"
        >
          {[
            { icon: MapPin, value: "12", label: "Countries Visited" },
            { icon: Calendar, value: "8", label: "Trips Planned" },
            { icon: TrendingUp, value: "₹2.4L", label: "Avg Trip Budget" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function UpcomingTripBanner({ trip }: { trip: Trip }) {
  const daysLeft = trip.startDate ? getDaysRemaining(trip.startDate) : null

  return (
    <div className="glass-card p-5 border border-[#7C8CFF]/20 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#7C8CFF]/10 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C8CFF] to-[#8BE7FF] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#7C8CFF]/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-primary uppercase tracking-widest">Ongoing Journey</span>
            </div>
            <h3 className="font-bold text-foreground">{trip.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              {trip.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{formatDate(trip.startDate)}</span>
                </div>
              )}
              {daysLeft !== null && daysLeft > 0 && (
                <span className="text-xs font-semibold text-[#6EE7B7]">
                  {daysLeft} days to go
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/trips/${trip.id}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C8CFF]/10 hover:bg-[#7C8CFF]/20 text-primary text-sm font-medium transition-all"
        >
          View <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export function DashboardClient({
  userName,
  upcomingTrips,
  ongoingTrips,
  completedTrips,
}: DashboardClientProps) {
  const router = useRouter()
  const allTrips = [...ongoingTrips, ...upcomingTrips, ...completedTrips]
  const nextTrip = upcomingTrips[0] ?? ongoingTrips[0] ?? null
  const topDestinations = DESTINATIONS.slice(0, 6)

  const handleDeleteTrip = async (id: string) => {
    try {
      await fetch(`/api/trips/${id}`, { method: "DELETE" })
      toast.success("Trip deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete trip")
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection userName={userName} nextTrip={nextTrip} />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Ongoing trip banner */}
        {ongoingTrips.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UpcomingTripBanner trip={ongoingTrips[0]} />
          </motion.section>
        )}

        {/* Upcoming trips */}
        {upcomingTrips.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Upcoming Trips</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Adventures on the horizon</p>
              </div>
              <Link href="/trips" className="flex items-center gap-1 text-sm text-primary hover:text-[#8BE7FF] font-medium transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingTrips.slice(0, 3).map((trip, i) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  title={trip.title}
                  coverImage={trip.coverImage}
                  status={trip.status}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  totalBudget={trip.totalBudget}
                  destinations={trip.stops.map((s) => s.destinationId)}
                  index={i}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>
          </section>
        )}

        {/* Discover destinations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Discover Destinations</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Where would you like to go?</p>
            </div>
            <Link href="/explore" className="flex items-center gap-1 text-sm text-primary hover:text-[#8BE7FF] font-medium transition-colors">
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topDestinations.map((dest, i) => (
              <DestinationCard
                key={dest.id}
                id={dest.id}
                name={dest.name}
                country={dest.country}
                image={dest.image}
                description={dest.description}
                avgDailyCost={dest.avgDailyCost}
                popularity={dest.popularity}
                recommendedDays={dest.recommendedDays}
                bestTimeToVisit={dest.bestTimeToVisit}
                tags={dest.tags}
                size="md"
              />
            ))}
          </div>
        </section>

        {/* Past trips */}
        {completedTrips.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Past Adventures</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Memories you&apos;ve made</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedTrips.slice(0, 3).map((trip, i) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  title={trip.title}
                  coverImage={trip.coverImage}
                  status={trip.status}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  totalBudget={trip.totalBudget}
                  destinations={trip.stops.map((s) => s.destinationId)}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state if no trips */}
        {allTrips.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#7C8CFF]/20 to-[#8BE7FF]/20 flex items-center justify-center mx-auto mb-6">
              <Globe className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Your journey begins here</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              You haven&apos;t planned any trips yet. Start by exploring destinations and creating your first itinerary.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full btn-primary text-white font-semibold"
            >
              <Plus className="w-4 h-4" />
              Plan Your First Trip
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
