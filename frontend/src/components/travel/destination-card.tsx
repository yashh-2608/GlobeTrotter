"use client"

import { SafeImage as Image } from "@/components/travel/safe-image"
import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Clock, Star, IndianRupee, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { use3DTilt } from "@/hooks/use-3d-tilt"
import { formatCurrency } from "@/lib/utils"

interface DestinationCardProps {
  id: string
  name: string
  country: string
  image: string
  description: string
  avgDailyCost: number
  popularity: number
  recommendedDays: number
  bestTimeToVisit?: string
  tags?: string[]
  className?: string
  onAdd?: (id: string) => void
  size?: "sm" | "md" | "lg"
}

export function DestinationCard({
  id,
  name,
  country,
  image,
  description,
  avgDailyCost,
  popularity,
  recommendedDays,
  bestTimeToVisit,
  tags = [],
  className,
  onAdd,
  size = "md",
}: DestinationCardProps) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt({ maxRotate: 5 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer",
        "glass-card",
        size === "sm" && "h-48",
        size === "md" && "h-72",
        size === "lg" && "h-96",
        className
      )}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-[#050609]/60 to-transparent" />
      </div>

      {/* Popularity badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
        <Star className="w-3 h-3 text-[#FBBF77] fill-[#FBBF77]" />
        <span className="text-xs text-foreground font-medium">{(popularity / 10).toFixed(1)}</span>
      </div>

      {/* Tags */}
      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[70%]">
        {tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full glass text-[#8BE7FF] border border-[#8BE7FF]/20">
            {tag}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground leading-tight"><Link href={`/destinations/${id}`} className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-primary">{name}</Link></h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{country}</span>
            </div>

            {/* Stats row */}
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{description}</p>
            {bestTimeToVisit && <p className="mt-1 text-xs text-muted-foreground">Best time: {bestTimeToVisit}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">{recommendedDays}d recommended</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-[#6EE7B7]" />
                <span className="text-xs text-muted-foreground">{formatCurrency(avgDailyCost)}/day</span>
              </div>
            </div>
          </div>

          {onAdd && (
            <button
              onClick={(e) => { e.preventDefault(); onAdd(id) }}
              className="relative z-10 ml-3 w-9 h-9 rounded-xl flex-shrink-0 bg-[#7C8CFF] hover:bg-[#8B9BFF] flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-[#7C8CFF]/30"
              aria-label={`Add ${name} to trip`}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
