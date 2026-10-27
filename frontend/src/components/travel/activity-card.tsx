"use client"

import { SafeImage as Image } from "@/components/travel/safe-image"
import { motion } from "framer-motion"
import { Clock, Star, MapPin, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

interface ActivityCardProps {
  id: string
  name: string
  location: string
  image: string
  category: string
  duration?: string
  estimatedCost: number
  rating: number
  description: string
  className?: string
  onAdd?: (id: string) => void
  layout?: "grid" | "horizontal"
}

const categoryColors: Record<string, string> = {
  Sightseeing: "text-[#8BE7FF] border-[#8BE7FF]/20",
  Culture: "text-primary border-[#7C8CFF]/20",
  Adventure: "text-[#6EE7B7] border-[#6EE7B7]/20",
  Nature: "text-[#6EE7B7] border-[#6EE7B7]/20",
  Food: "text-[#FBBF77] border-[#FBBF77]/20",
  History: "text-muted-foreground border-[#A7ACB8]/20",
  Experience: "text-destructive border-[#FB7185]/20",
}

export function ActivityCard({
  id,
  name,
  location,
  image,
  category,
  duration,
  estimatedCost,
  rating,
  description,
  className,
  onAdd,
  layout = "grid",
}: ActivityCardProps) {
  const catColor = categoryColors[category] ?? "text-muted-foreground border-[#A7ACB8]/20"

  if (layout === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn("glass-card flex gap-4 p-4 group", className)}
      >
        <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full glass border", catColor)}>
                {category}
              </span>
              <h3 className="mt-1 text-sm font-semibold text-foreground leading-tight">{name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{location}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3 h-3 text-[#FBBF77] fill-[#FBBF77]" />
                <span className="text-xs text-foreground font-medium">{rating.toFixed(1)}</span>
              </div>
              <div className="text-xs text-[#6EE7B7] font-semibold mt-0.5">{formatCurrency(estimatedCost)}</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              {duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{duration}</span>
                </div>
              )}
            </div>
            {onAdd && (
              <button
                onClick={() => onAdd(id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7C8CFF]/10 hover:bg-[#7C8CFF]/20 text-primary text-xs font-medium transition-all"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card overflow-hidden group flex flex-col", className)}
    >
      <div className="relative h-44 overflow-hidden">
        <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/90 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full glass border", catColor)}>
            {category}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-[#FBBF77] fill-[#FBBF77]" />
          <span className="text-xs text-foreground font-medium">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground leading-tight">{name}</h3>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{location}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{description}</p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{duration}</span>
              </div>
            )}
            <span className="text-sm font-semibold text-[#6EE7B7]">{formatCurrency(estimatedCost)}</span>
          </div>
          {onAdd && (
            <button
              onClick={() => onAdd(id)}
              className="w-8 h-8 rounded-lg bg-[#7C8CFF] hover:bg-[#8B9BFF] flex items-center justify-center transition-all hover:scale-110"
              aria-label={`Add ${name} to itinerary`}
            >
              <Plus className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
