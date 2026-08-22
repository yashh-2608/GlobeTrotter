"use client"

import { motion } from "framer-motion"
import { MapPin, Calendar, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Stop {
  id: string
  destinationId: string
  destinationName: string
  startDate?: string | Date | null
  endDate?: string | Date | null
  daysCount: number
  estimatedCost: number
  order: number
}

interface TripTimelineProps {
  stops: Stop[]
  className?: string
  interactive?: boolean
  onStopClick?: (stopId: string) => void
}

const destinationImages: Record<string, string> = {
  paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop",
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&auto=format&fit=crop",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&auto=format&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop",
  amsterdam: "https://images.unsplash.com/photo-1468376892789-d0b9e13da756?w=400&auto=format&fit=crop",
  maldives: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&auto=format&fit=crop",
  barcelona: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&auto=format&fit=crop",
}

export function TripTimeline({ stops, className, interactive = false, onStopClick }: TripTimelineProps) {
  if (stops.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <MapPin className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">No destinations added yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Add your first stop to begin</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Vertical connecting line */}
      <div className="absolute left-[22px] top-8 bottom-8 w-px timeline-line" />

      <div className="space-y-4">
        {stops.map((stop, idx) => (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => interactive && onStopClick?.(stop.id)}
            className={cn(
              "relative flex items-start gap-4",
              interactive && "cursor-pointer"
            )}
          >
            {/* Node */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-card border-2 border-primary/50 flex items-center justify-center shadow-lg shadow-[#7C8CFF]/10">
                <span className="text-xs font-bold text-primary">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Content card */}
            <div className={cn(
              "flex-1 glass-card p-4 group",
              interactive && "hover:border-[rgba(124,140,255,0.25)] hover:bg-white/6 transition-all"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground capitalize">{stop.destinationName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {stop.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span className="text-xs text-muted-foreground">{formatDate(stop.startDate)}</span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{stop.daysCount} {stop.daysCount === 1 ? "day" : "days"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#6EE7B7]">{formatCurrency(stop.estimatedCost)}</div>
                  {interactive && <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto group-hover:text-primary transition-colors" />}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* End node */}
        <div className="relative flex items-center gap-4">
          <div className="relative z-10 flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-[#6EE7B7]/10 border-2 border-[#6EE7B7]/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#6EE7B7]" />
            </div>
          </div>
          <span className="text-sm text-[#6EE7B7] font-medium">Journey Complete</span>
        </div>
      </div>
    </div>
  )
}
