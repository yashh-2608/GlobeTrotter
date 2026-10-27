"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Compass, Sparkles, MapPin, Telescope } from "lucide-react"
import type { Destination } from "@/types/travel"
import { DestinationCard } from "@/components/travel/destination-card"

export default function ExploreClient({ destinations }: { destinations: Destination[] }) {
  const featuredDestination = destinations[0]
  if (!featuredDestination) return <div className="mx-auto max-w-xl px-6 pt-32 text-center"><h1 className="text-2xl font-bold">Destinations are on their way</h1><p className="mt-4 text-muted-foreground">Check back soon, or start a trip and add destinations later.</p><Link href="/trips/new" className="inline-block mt-6 btn-primary px-5 py-3 rounded-xl">Plan a trip</Link></div>

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={featuredDestination.image}
            alt={featuredDestination.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/90 via-[#050609]/55 to-[#050609]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-transparent to-[#050609]/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-16 min-h-[78vh] flex items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-border text-[#8BE7FF] text-xs font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Curated travel inspiration
            </div>
            <h1 className="hero-display text-foreground mb-5">
              Explore the world
              <span className="block gradient-text">one trip at a time.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Discover places, build routes, and follow journeys designed for people who want
              their next escape to feel thoughtful from the very first click.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/destinations" className="inline-flex items-center gap-2 px-5 py-3 rounded-full btn-primary text-white font-semibold text-sm">
                Browse destinations <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/activities" className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass border border-border text-foreground font-semibold text-sm hover:bg-white/8 transition-all">
                <Compass className="w-4 h-4" />
                Find activities
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-10 max-w-lg">
              {[
                { label: "Places", value: `${destinations.length}` },
                { label: "Regions", value: `${new Set(destinations.map((item) => item.region)).size}` },
                { label: "Styles", value: `${new Set(destinations.flatMap((item) => item.tags)).size}` },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4">
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-14 space-y-16">
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-2">Featured place</p>
              <h2 className="text-2xl font-bold text-foreground">This week&apos;s spotlight</h2>
            </div>
            <Link href="/destinations" className="text-sm text-primary hover:text-[#8BE7FF] font-medium inline-flex items-center gap-1">
              All destinations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 items-stretch">
            <DestinationCard
              id={featuredDestination.id}
              name={featuredDestination.name}
              country={featuredDestination.country}
              image={featuredDestination.image}
              description={featuredDestination.description}
              avgDailyCost={featuredDestination.avgDailyCost}
              popularity={featuredDestination.popularity}
              recommendedDays={featuredDestination.recommendedDays}
              bestTimeToVisit={featuredDestination.bestTimeToVisit ?? undefined}
              tags={featuredDestination.tags}
              size="lg"
            />
            <div className="space-y-5">
              <div className="glass-card p-8 h-full flex flex-col justify-center">
                <h2 className="text-2xl font-bold">Make room for your next adventure</h2>
                <p className="mt-4 text-muted-foreground">Choose destinations, set your dates, and build a schedule around the things you want to do.</p>
                <Link href="/trips/new" className="mt-6 inline-flex w-fit btn-primary rounded-xl px-5 py-3 font-semibold">Plan your trip <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-2">Curated grid</p>
              <h2 className="text-2xl font-bold text-foreground">Popular destinations</h2>
            </div>
            <Link href="/destinations" className="text-sm text-primary hover:text-[#8BE7FF] font-medium inline-flex items-center gap-1">
              Refine your search <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.slice(0, 6).map((destination) => (
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
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_0.65fr] gap-5">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Travel flow</h2>
            </div>
            <div className="space-y-4">
              {[
                "Search by vibe, budget, or season.",
                "Shortlist destinations into a trip.",
                "Shape each stop into a journey.",
              ].map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/4 border border-white/5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#7C8CFF]/10 text-primary font-bold flex items-center justify-center">
                    0{index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Telescope className="w-4 h-4 text-[#8BE7FF]" />
              <h2 className="text-xl font-bold text-foreground">Discovery notes</h2>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Explore is intentionally broad. It gives you a high-level view before you drop
                into destination-specific research or activity planning.
              </p>
              <p>
                From here, you can jump into curated places, browse specific activities, or move
                directly into a trip plan.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
