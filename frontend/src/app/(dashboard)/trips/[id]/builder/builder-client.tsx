"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowLeft, Plus, GripVertical, Search, X, Zap, Loader2 } from "lucide-react"
import { DESTINATIONS, ACTIVITIES } from "@/lib/data"
import { ActivityCard } from "@/components/travel/activity-card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { TripStop } from "@/types/travel"

type Stop = TripStop

interface BuilderClientProps {
  tripId: string
  tripTitle: string
  stops: Stop[]
}

function SortableStop({
  stop,
  onRemove,
}: {
  stop: Stop & {
    dest?: {
      image: string
      name: string
    }
  }
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-stretch gap-3 glass-card p-4 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            {stop.dest?.image ? (
              <Image src={stop.dest.image} alt={stop.dest.name} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-[#7C8CFF]/10 flex items-center justify-center text-primary text-xs font-bold">
                {stop.destinationId[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground capitalize">{stop.destinationId.replace(/-/g, " ")}</h3>
            <p className="text-xs text-muted-foreground">{stop.daysCount} days · {stop.activities.length} activities</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(stop.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Remove stop"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function BuilderClient({ tripId, tripTitle, stops: initialStops }: BuilderClientProps) {
  const router = useRouter()
  const [stops, setStops] = useState(initialStops)
  const [activitySearch, setActivitySearch] = useState("")
  const [selectedDestId, setSelectedDestId] = useState<string | null>(stops[0]?.destinationId ?? null)
  const [isGenerating, setIsGenerating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredActivities = ACTIVITIES.filter((a) => {
    const matchDest = selectedDestId ? a.destinationId === selectedDestId : true
    const matchSearch = activitySearch ? a.name.toLowerCase().includes(activitySearch.toLowerCase()) : true
    return matchDest && matchSearch
  })

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setStops((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleAddActivity = async (activityId: string) => {
    if (!stops.length) {
      toast.error("Add a destination stop first")
      return
    }
    const targetStop = selectedDestId ? stops.find((s) => s.destinationId === selectedDestId) : stops[0]
    if (!targetStop) return

    const activity = ACTIVITIES.find((a) => a.id === activityId)
    if (!activity) return

    try {
      await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId: activity.destinationId,
          title: activity.name,
          estimatedCost: activity.estimatedCost,
          category: activity.category,
          duration: activity.duration,
        }),
      })
      toast.success(`${activity.name} added!`)
    } catch {
      toast.error("Failed to add activity")
    }
  }

  const handleSmartPlan = async () => {
    setIsGenerating(true)
    // Simulate AI planning
    await new Promise((r) => setTimeout(r, 2500))
    toast.success("✨ Smart itinerary generated! Check your updated stops.")
    setIsGenerating(false)
  }

  const stopsWithDest = stops.map((s) => ({
    ...s,
    dest: DESTINATIONS.find((d) => d.id === s.destinationId),
  }))

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="glass-nav px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-sm">{tripTitle}</h1>
            <p className="text-[10px] text-muted-foreground">Itinerary Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSmartPlan}
            disabled={isGenerating || stops.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#7C8CFF]/20 to-[#8BE7FF]/20 border border-[#7C8CFF]/30 text-primary text-xs font-semibold hover:from-[#7C8CFF]/30 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Smart Plan
          </button>
          <button
            onClick={() => router.push(`/trips/${tripId}`)}
            className="px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>

      {/* Main panel: 3-column */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Stops (sortable) */}
        <div className="w-64 border-r border-border flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stops</h2>
              <Link href={`/trips/${tripId}`} className="text-primary hover:text-[#8BE7FF] transition-colors">
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {stopsWithDest.map((stop) => (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedDestId(stop.destinationId)}
                    className={cn(
                      "cursor-pointer",
                      selectedDestId === stop.destinationId && "ring-1 ring-[#7C8CFF]/40 rounded-2xl"
                    )}
                  >
                    <SortableStop stop={stop} onRemove={() => {}} />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
            {stops.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No stops yet. Create trip stops first.</p>
            )}
          </div>
        </div>

        {/* Middle: Day view */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedDestId ? (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 capitalize">
                {selectedDestId.replace(/-/g, " ")} — Activities
              </h2>
              {stops.find(s => s.destinationId === selectedDestId)?.activities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No activities added yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Browse the panel on the right to add activities</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stops.find(s => s.destinationId === selectedDestId)?.activities.map((act) => (
                    <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl glass border border-border">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{act.title}</p>
                        {act.scheduledTime && <p className="text-xs text-muted-foreground">{act.scheduledTime}</p>}
                      </div>
                      <span className="text-xs font-semibold text-[#6EE7B7]">
                        ₹{act.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a stop to view its activities
            </div>
          )}
        </div>

        {/* Right: Activity picker */}
        <div className="w-72 border-l border-border flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Add Activities</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-8 pr-3 rounded-lg glass border border-border text-foreground text-xs outline-none placeholder-[#A7ACB8]/50 focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                id={activity.id}
                name={activity.name}
                location={DESTINATIONS.find(d => d.id === activity.destinationId)?.name ?? ""}
                image={activity.image}
                category={activity.category}
                duration={activity.duration}
                estimatedCost={activity.estimatedCost}
                rating={activity.rating}
                description={activity.description}
                layout="horizontal"
                onAdd={handleAddActivity}
              />
            ))}
            {filteredActivities.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No activities found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
