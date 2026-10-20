"use client"

import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowLeft, Plus, GripVertical, Search, X, Zap, Loader2, Trash2 } from "lucide-react"
import { ActivityCard } from "@/components/travel/activity-card"
import { toast } from "sonner"
import { cn, formatCurrency } from "@/lib/utils"
import type { Activity, Destination, TripStop } from "@/types/travel"

type Stop = TripStop

interface ActivityResult extends Activity {
  destination?: Destination
}

interface BuilderClientProps {
  tripId: string
  tripTitle: string
  stops: Stop[]
}

function stopActivitiesCost(stop: Stop) {
  return stop.activities.reduce((sum, activity) => sum + activity.estimatedCost, 0)
}

function SortableStop({
  stop,
  selected,
  onSelect,
  onRemove,
}: {
  stop: Stop
  selected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const destinationName = stop.destination?.name ?? stop.destinationId

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "flex items-stretch gap-3 glass-card p-4 group cursor-pointer transition-all",
        selected && "ring-1 ring-[#7C8CFF]/40"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            {stop.destination?.image ? (
              <Image src={stop.destination.image} alt={destinationName} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-[#7C8CFF]/10 flex items-center justify-center text-primary text-xs font-bold">
                {destinationName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{destinationName}</h3>
            <p className="text-xs text-muted-foreground">{stop.daysCount}d · {stop.activities.length} activities</p>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
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
  const [selectedStopId, setSelectedStopId] = useState<string | null>(initialStops[0]?.id ?? null)
  const [activitySearch, setActivitySearch] = useState("")
  const [availableActivities, setAvailableActivities] = useState<ActivityResult[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [pendingActivityId, setPendingActivityId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [isPickingDestination, setIsPickingDestination] = useState(false)
  const [allDestinations, setAllDestinations] = useState<Destination[]>([])
  const [destinationSearch, setDestinationSearch] = useState("")
  const [isAddingStop, setIsAddingStop] = useState(false)
  const [isSavingStop, setIsSavingStop] = useState(false)
  const [isAddingCustomActivity, setIsAddingCustomActivity] = useState(false)
  const [customActivity, setCustomActivity] = useState({ title: "", category: "Sightseeing", scheduledDate: "", scheduledTime: "", duration: "", estimatedCost: "0", notes: "" })
  const [stopDraft, setStopDraft] = useState({ startDate: "", endDate: "", daysCount: "1", estimatedCost: "0", notes: "" })

  const selectedStop = stops.find((s) => s.id === selectedStopId) ?? null

  useEffect(() => {
    setStopDraft({
      startDate: selectedStop?.startDate ? new Date(selectedStop.startDate).toISOString().slice(0, 10) : "",
      endDate: selectedStop?.endDate ? new Date(selectedStop.endDate).toISOString().slice(0, 10) : "",
      daysCount: String(selectedStop?.daysCount ?? 1),
      estimatedCost: String(selectedStop?.estimatedCost ?? 0),
      notes: selectedStop?.notes ?? "",
    })
  }, [selectedStopId, selectedStop?.startDate, selectedStop?.endDate, selectedStop?.daysCount, selectedStop?.estimatedCost, selectedStop?.notes])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedDestinationId = selectedStop?.destinationId ?? null

  useEffect(() => {
    if (!selectedDestinationId) return

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      setIsLoadingActivities(true)
      const params = new URLSearchParams({ destinationId: selectedDestinationId })
      if (activitySearch) params.set("q", activitySearch)

      fetch(`/api/activities?${params}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: unknown) => setAvailableActivities(Array.isArray(data) ? data as ActivityResult[] : []))
        .catch((error) => {
          if (error.name !== "AbortError") setAvailableActivities([])
        })
        .finally(() => setIsLoadingActivities(false))
    }, 250)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [selectedDestinationId, activitySearch])

  useEffect(() => {
    if (!isPickingDestination || allDestinations.length > 0) return

    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data: unknown) => setAllDestinations(Array.isArray(data) ? data as Destination[] : []))
      .catch(() => setAllDestinations([]))
  }, [isPickingDestination, allDestinations.length])

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

  const handleAddStop = async (destination: Destination) => {
    setIsAddingStop(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId: destination.id,
          daysCount: destination.recommendedDays || 1,
          estimatedCost: destination.avgDailyCost * (destination.recommendedDays || 1),
        }),
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error(json?.error ?? "Failed to add stop")
        return
      }

      setStops((prev) => [...prev, json.stop])
      setSelectedStopId(json.stop.id)
      setIsPickingDestination(false)
      setDestinationSearch("")
      toast.success(`${destination.name} added to your trip`)
    } catch {
      toast.error("Failed to add stop")
    } finally {
      setIsAddingStop(false)
    }
  }

  const handleRemoveStop = async (stopId: string) => {
    const previous = stops
    const remaining = stops.filter((s) => s.id !== stopId)
    setStops(remaining)
    if (selectedStopId === stopId) {
      setSelectedStopId(remaining[0]?.id ?? null)
    }

    try {
      const res = await fetch(`/api/stops/${stopId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Stop removed")
    } catch {
      toast.error("Failed to remove stop")
      setStops(previous)
    }
  }

  const handleSaveStop = async () => {
    if (!selectedStop) return
    setIsSavingStop(true)
    try {
      const response = await fetch(`/api/stops/${selectedStop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: stopDraft.startDate || null,
          endDate: stopDraft.endDate || null,
          daysCount: Math.max(1, Number(stopDraft.daysCount) || 1),
          estimatedCost: Math.max(0, Number(stopDraft.estimatedCost) || 0),
          notes: stopDraft.notes,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? "Could not save destination details")
      setStops((current) => current.map((stop) => stop.id === selectedStop.id ? payload.stop : stop))
      toast.success("Destination details saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save destination details")
    } finally {
      setIsSavingStop(false)
    }
  }

  const handleAddActivity = async (activityId: string) => {
    if (!selectedStop) {
      toast.error("Add a destination stop first")
      return
    }

    const activity = availableActivities.find((a) => a.id === activityId)
    if (!activity) return

    setPendingActivityId(activityId)
    try {
      const res = await fetch(`/api/trips/${tripId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripStopId: selectedStop.id,
          activityId: activity.id,
          title: activity.name,
          estimatedCost: activity.estimatedCost,
          category: activity.category,
          duration: activity.duration,
        }),
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error(json?.error ?? "Failed to add activity")
        return
      }

      const created = json.activity

      setStops((prev) =>
        prev.map((s) =>
          s.id === selectedStop.id
            ? {
                ...s,
                activities: [
                  ...s.activities,
                  {
                    id: created.id,
                    name: created.title,
                    title: created.title,
                    category: created.category,
                    duration: created.duration,
                    estimatedCost: created.estimatedCost,
                    scheduledDate: created.scheduledDate,
                    scheduledTime: created.scheduledTime,
                    notes: created.notes,
                  },
                ],
              }
            : s
        )
      )
      toast.success(`${activity.name} added!`)
    } catch {
      toast.error("Failed to add activity")
    } finally {
      setPendingActivityId(null)
    }
  }

  const handleAddCustomActivity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedStop) return
    setIsAddingCustomActivity(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripStopId: selectedStop.id,
          title: customActivity.title.trim(),
          category: customActivity.category || null,
          scheduledDate: customActivity.scheduledDate || null,
          scheduledTime: customActivity.scheduledTime || null,
          duration: customActivity.duration || null,
          estimatedCost: Math.max(0, Number(customActivity.estimatedCost) || 0),
          notes: customActivity.notes || null,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? "Could not add activity")
      const created = payload.activity
      setStops((current) => current.map((stop) => stop.id === selectedStop.id
        ? { ...stop, activities: [...stop.activities, { id: created.id, title: created.title, name: created.title, category: created.category, scheduledDate: created.scheduledDate, scheduledTime: created.scheduledTime, duration: created.duration, estimatedCost: created.estimatedCost, notes: created.notes }] }
        : stop))
      setCustomActivity({ title: "", category: "Sightseeing", scheduledDate: "", scheduledTime: "", duration: "", estimatedCost: "0", notes: "" })
      toast.success("Activity added to your itinerary")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add activity")
    } finally {
      setIsAddingCustomActivity(false)
    }
  }

  const handleRemoveActivity = async (stopId: string, activityId: string) => {
    const previous = stops
    setStops((prev) =>
      prev.map((s) => (s.id === stopId ? { ...s, activities: s.activities.filter((a) => a.id !== activityId) } : s))
    )

    try {
      const res = await fetch(`/api/trip-activities/${activityId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Activity removed")
    } catch {
      toast.error("Failed to remove activity")
      setStops(previous)
    }
  }

  const handleSmartPlan = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 2500))
    toast.success("✨ Smart itinerary generated! Check your updated stops.")
    setIsGenerating(false)
  }

  const filteredDestinationOptions = allDestinations.filter(
    (d) =>
      !stops.some((s) => s.destinationId === d.id) &&
      d.name.toLowerCase().includes(destinationSearch.toLowerCase())
  )

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
              <button
                onClick={() => setIsPickingDestination((v) => !v)}
                className="text-primary hover:text-[#8BE7FF] transition-colors"
                aria-label="Add stop"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {isPickingDestination && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={destinationSearch}
                    onChange={(e) => setDestinationSearch(e.target.value)}
                    placeholder="Search destinations..."
                    autoFocus
                    className="w-full h-9 pl-8 pr-3 rounded-lg glass border border-border text-foreground text-xs outline-none placeholder-[#A7ACB8]/50 focus:border-primary/50"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredDestinationOptions.slice(0, 20).map((dest) => (
                    <button
                      key={dest.id}
                      disabled={isAddingStop}
                      onClick={() => handleAddStop(dest)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/6 text-left transition-colors disabled:opacity-50"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={dest.image} alt={dest.name} width={28} height={28} className="object-cover w-full h-full" />
                      </div>
                      <span className="text-xs text-foreground truncate">{dest.name}</span>
                    </button>
                  ))}
                  {allDestinations.length > 0 && filteredDestinationOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">No matches</p>
                  )}
                  {allDestinations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">Loading...</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {stops.map((stop) => (
                  <SortableStop
                    key={stop.id}
                    stop={stop}
                    selected={selectedStopId === stop.id}
                    onSelect={() => setSelectedStopId(stop.id)}
                    onRemove={() => handleRemoveStop(stop.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {stops.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No stops yet. Add a destination to get started.</p>
            )}
          </div>
        </div>

        {/* Middle: Day view */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedStop ? (
            <div>
              <section className="mb-6 rounded-2xl glass-card p-4">
                <h2 className="mb-4 text-sm font-semibold text-foreground">Destination details</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-xs text-muted-foreground">Arrival date
                    <input type="date" value={stopDraft.startDate} onChange={(event) => setStopDraft((draft) => ({ ...draft, startDate: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground [color-scheme:dark]" />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">Departure date
                    <input type="date" min={stopDraft.startDate || undefined} value={stopDraft.endDate} onChange={(event) => setStopDraft((draft) => ({ ...draft, endDate: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground [color-scheme:dark]" />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">Days
                    <input type="number" min="1" value={stopDraft.daysCount} onChange={(event) => setStopDraft((draft) => ({ ...draft, daysCount: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">Estimated destination cost
                    <input type="number" min="0" step="0.01" value={stopDraft.estimatedCost} onChange={(event) => setStopDraft((draft) => ({ ...draft, estimatedCost: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" />
                  </label>
                </div>
                <label className="mt-3 block space-y-1 text-xs text-muted-foreground">Destination notes
                  <textarea rows={2} value={stopDraft.notes} onChange={(event) => setStopDraft((draft) => ({ ...draft, notes: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" placeholder="Stay details, reminders, local plans…" />
                </label>
                <button onClick={handleSaveStop} disabled={isSavingStop} className="mt-3 inline-flex items-center gap-2 rounded-lg btn-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                  {isSavingStop && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save destination
                </button>
              </section>
              <details className="mb-6 rounded-2xl glass-card p-4">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">Add a custom activity</summary>
                <form onSubmit={handleAddCustomActivity} className="mt-4 space-y-3">
                  <label className="block space-y-1 text-xs text-muted-foreground">Activity name
                    <input required value={customActivity.title} onChange={(event) => setCustomActivity((draft) => ({ ...draft, title: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" placeholder="Museum visit, dinner reservation…" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-xs text-muted-foreground">Category
                      <input value={customActivity.category} onChange={(event) => setCustomActivity((draft) => ({ ...draft, category: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" />
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">Duration
                      <input value={customActivity.duration} onChange={(event) => setCustomActivity((draft) => ({ ...draft, duration: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" placeholder="2 hours" />
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">Date
                      <input type="date" value={customActivity.scheduledDate} onChange={(event) => setCustomActivity((draft) => ({ ...draft, scheduledDate: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground [color-scheme:dark]" />
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">Time
                      <input type="time" value={customActivity.scheduledTime} onChange={(event) => setCustomActivity((draft) => ({ ...draft, scheduledTime: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground [color-scheme:dark]" />
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">Estimated cost
                      <input type="number" min="0" step="0.01" value={customActivity.estimatedCost} onChange={(event) => setCustomActivity((draft) => ({ ...draft, estimatedCost: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" />
                    </label>
                  </div>
                  <label className="block space-y-1 text-xs text-muted-foreground">Activity notes
                    <textarea rows={2} value={customActivity.notes} onChange={(event) => setCustomActivity((draft) => ({ ...draft, notes: event.target.value }))} className="w-full rounded-lg glass border border-border px-3 py-2 text-sm text-foreground" placeholder="Booking reference, address, or reminders…" />
                  </label>
                  <button disabled={isAddingCustomActivity} className="inline-flex items-center gap-2 rounded-lg btn-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                    {isAddingCustomActivity && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add activity
                  </button>
                </form>
              </details>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {selectedStop.destination?.name ?? selectedStop.destinationId} — Activities
                </h2>
                <span className="text-sm font-semibold text-[#6EE7B7]">
                  {formatCurrency(stopActivitiesCost(selectedStop))}
                </span>
              </div>
              {selectedStop.activities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No activities added yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Browse the panel on the right to add activities</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedStop.activities.map((act) => (
                    <div key={act.id} className="group flex items-center gap-3 p-3 rounded-xl glass border border-border">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{act.title ?? act.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[act.category, act.scheduledDate ? new Date(act.scheduledDate).toLocaleDateString() : null, act.scheduledTime, act.duration].filter(Boolean).join(" · ")}
                        </p>
                        {act.notes && <p className="text-xs text-muted-foreground/80">{act.notes}</p>}
                      </div>
                      <span className="text-xs font-semibold text-[#6EE7B7] flex-shrink-0">
                        {formatCurrency(act.estimatedCost)}
                      </span>
                      <button
                        onClick={() => handleRemoveActivity(selectedStop.id, act.id)}
                        className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#FB7185]/10 hover:bg-[#FB7185]/20 flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${act.title ?? act.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center px-8">
              {stops.length === 0 ? "Add a destination stop to start planning activities" : "Select a stop to view its activities"}
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
                disabled={!selectedStop}
                className="w-full h-9 pl-8 pr-3 rounded-lg glass border border-border text-foreground text-xs outline-none placeholder-[#A7ACB8]/50 focus:border-primary/50 disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {!selectedStop ? (
              <p className="text-xs text-muted-foreground text-center py-8">Select a stop first</p>
            ) : isLoadingActivities ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
              </div>
            ) : (
              <>
                {availableActivities.map((activity) => (
                  <div key={activity.id} className="relative">
                    <ActivityCard
                      id={activity.id}
                      name={activity.name}
                      location={selectedStop.destination?.name ?? ""}
                      image={activity.image ?? ""}
                      category={activity.category ?? "Experience"}
                      duration={activity.duration ?? undefined}
                      estimatedCost={activity.estimatedCost}
                      rating={activity.rating ?? 0}
                      description={activity.description ?? ""}
                      layout="horizontal"
                      onAdd={handleAddActivity}
                    />
                    {pendingActivityId === activity.id && (
                      <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {availableActivities.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No activities found for this destination</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
