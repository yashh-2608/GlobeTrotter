"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, MapPin, Utensils, Camera, Bed, Car, ChevronDown, Plus, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

interface Activity {
  id: string
  title?: string
  scheduledTime?: string | null
  scheduledDate?: string | Date | null
  duration?: string | null
  estimatedCost: number
  category?: string | null
  notes?: string | null
}

interface ItineraryDayProps {
  dayNumber: number
  date?: string
  city: string
  activities: Activity[]
  totalCost: number
  className?: string
  editable?: boolean
  onAddActivity?: (dayId: string) => void
  onDeleteActivity?: (activityId: string) => void
}

const categoryIcons: Record<string, React.ElementType> = {
  Food: Utensils,
  Sightseeing: Camera,
  Accommodation: Bed,
  Transport: Car,
  default: Clock,
}

const categoryColors: Record<string, string> = {
  Food: "text-[#FBBF77]",
  Sightseeing: "text-[#8BE7FF]",
  Accommodation: "text-primary",
  Transport: "text-[#6EE7B7]",
  default: "text-muted-foreground",
}

export function ItineraryDay({
  dayNumber,
  date,
  city,
  activities,
  totalCost,
  className,
  editable = false,
  onAddActivity,
  onDeleteActivity,
}: ItineraryDayProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      {/* Day header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C8CFF]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">D{dayNumber}</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Day {dayNumber}</span>
              {date && <span className="text-xs text-muted-foreground">· {date}</span>}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-sm text-muted-foreground capitalize">{city}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#6EE7B7]">{formatCurrency(totalCost)}</span>
          <ChevronDown
            className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")}
          />
        </div>
      </button>

      {/* Activities */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-2">
              {activities.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No activities yet</p>
              ) : (
                activities.map((activity, idx) => {
                  const Icon = categoryIcons[activity.category ?? ""] ?? categoryIcons.default
                  const color = categoryColors[activity.category ?? ""] ?? categoryColors.default

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                    >
                      {/* Time */}
                      <div className="w-14 flex-shrink-0 text-center">
                        {activity.scheduledTime ? (
                          <span className="text-xs font-mono text-muted-foreground">{activity.scheduledTime}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">-:-</span>
                        )}
                      </div>

                      {/* Connector dot */}
                      <div className="w-2 h-2 rounded-full bg-[#7C8CFF]/40 flex-shrink-0" />

                      {/* Icon + name */}
                      <div className={cn("flex-shrink-0", color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                        {(activity.category || activity.duration || activity.scheduledDate) && (
                          <p className="text-xs text-muted-foreground">
                            {[activity.category, activity.duration, activity.scheduledDate ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(activity.scheduledDate)) : null].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {activity.notes && <p className="mt-1 whitespace-normal text-xs text-muted-foreground/80">{activity.notes}</p>}
                      </div>

                      {/* Cost */}
                      <span className="text-xs font-semibold text-[#6EE7B7] flex-shrink-0">
                        {formatCurrency(activity.estimatedCost)}
                      </span>

                      {/* Edit/delete actions */}
                      {editable && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={() => onDeleteActivity?.(activity.id)}
                            className="w-6 h-6 rounded-lg bg-[#FB7185]/10 hover:bg-[#FB7185]/20 flex items-center justify-center text-destructive"
                            aria-label="Delete activity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}

              {/* Add activity */}
              {editable && (
                <button
                  onClick={() => onAddActivity?.(String(dayNumber))}
                  className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-[#7C8CFF]/40 text-muted-foreground hover:text-primary text-xs font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add activity
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
