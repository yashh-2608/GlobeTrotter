"use client"

import { SafeImage as Image } from "@/components/travel/safe-image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, ArrowRight, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate, getDaysRemaining } from "@/lib/utils"
import { use3DTilt } from "@/hooks/use-3d-tilt"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TripCardProps {
  id: string
  title: string
  coverImage?: string | null
  status: "UPCOMING" | "ONGOING" | "COMPLETED"
  startDate?: string | Date | null
  endDate?: string | Date | null
  totalBudget: number
  currency?: string
  destinations?: string[]
  className?: string
  onDelete?: (id: string) => void
  index?: number
}

const statusConfig = {
  UPCOMING: {
    label: "Upcoming",
    className: "status-upcoming",
  },
  ONGOING: {
    label: "Ongoing",
    className: "status-ongoing",
  },
  COMPLETED: {
    label: "Completed",
    className: "status-completed",
  },
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop",
]

export function TripCard({
  id,
  title,
  coverImage,
  status,
  startDate,
  totalBudget,
  currency = "INR",
  destinations = [],
  className,
  onDelete,
  index = 0,
}: TripCardProps) {
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt({ maxRotate: 4 })
  const router = useRouter()
  const config = statusConfig[status]
  const imgSrc = coverImage ?? fallbackImages[index % fallbackImages.length]
  const daysRemaining = startDate ? getDaysRemaining(startDate) : null

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn("group relative rounded-2xl overflow-hidden", "glass-card", className)}
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609] via-[#050609]/50 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full", config.className)}>
            {config.label}
          </span>
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-100 md:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger aria-label={`Actions for ${title}`} className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-stronger border-border bg-popover">
              <DropdownMenuItem className="text-foreground cursor-pointer" onClick={() => router.push(`/trips/${id}/builder`)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => onDelete(id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-base leading-tight truncate">{title}</h3>

        {destinations.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{destinations.join(" → ")}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            {startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">{formatDate(startDate)}</span>
              </div>
            )}
            <div className="text-sm font-semibold text-[#6EE7B7] mt-0.5">{formatCurrency(totalBudget, currency)}</div>
          </div>

          {daysRemaining !== null && status === "UPCOMING" && daysRemaining > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Departs in</div>
              <div className="text-sm font-bold text-primary">{daysRemaining}d</div>
            </div>
          )}
        </div>

        <Link
          href={`/trips/${id}`}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl glass hover:bg-white/8 text-muted-foreground hover:text-foreground text-sm font-medium transition-all group/btn"
        >
          View Trip
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  )
}
