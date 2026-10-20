"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft, ArrowRight, Check, Globe, MapPin, Calendar,
  Wallet, Camera, Loader2, Plus, X
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { Destination } from "@/types/travel"

/* ── Schema ─────────────────────────────── */
const Step1Schema = z.object({
  title: z.string().min(2, "Trip name must be at least 2 characters"),
  coverImage: z.string().optional(),
})

const Step2Schema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})

const Step3Schema = z.object({
  totalBudget: z.number().min(0, "Budget must be positive"),
  currency: z.string().default("INR"),
})

type Step1Data = z.infer<typeof Step1Schema>
type Step2Data = z.infer<typeof Step2Schema>
type Step3Data = z.infer<typeof Step3Schema>

/* ── Step configs ────────────────────────── */
const STEPS = [
  { id: 1, label: "Name it", icon: Globe },
  { id: 2, label: "Add Stops", icon: MapPin },
  { id: 3, label: "Set Dates", icon: Calendar },
  { id: 4, label: "Budget", icon: Wallet },
  { id: 5, label: "Cover", icon: Camera },
]

export default function NewTripPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [destinations, setDestinations] = useState<Destination[]>([])

  useEffect(() => {
    fetch("/api/destinations")
      .then((res) => res.json())
      .then((data: unknown) => setDestinations(Array.isArray(data) ? data as Destination[] : []))
      .catch(() => setDestinations([]))
  }, [])

  const coverImages = destinations.map((d) => ({ id: d.id, url: d.image, label: d.name }))

  // Collected data
  const [tripData, setTripData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    totalBudget: 50000,
    currency: "INR",
    coverImage: "",
    stops: [] as { destinationId: string; name: string; days: number; cost: number }[],
    notes: "",
  })

  const selectedCoverImage = tripData.coverImage || coverImages[0]?.url || ""

  const inputClass = (err?: boolean) =>
    cn(
      "w-full h-11 px-4 rounded-xl glass border text-foreground placeholder-[#A7ACB8]/50 text-sm transition-all outline-none",
      "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
      err ? "border-destructive/50" : "border-border"
    )

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tripData.title,
          startDate: tripData.startDate || null,
          endDate: tripData.endDate || null,
          totalBudget: tripData.totalBudget,
          currency: tripData.currency,
          coverImage: selectedCoverImage || undefined,
          notes: tripData.notes,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Failed to create trip")
        return
      }

      // Add stops
      for (const stop of tripData.stops) {
        await fetch(`/api/trips/${json.trip.id}/stops`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinationId: stop.destinationId,
            destinationName: stop.name,
            daysCount: stop.days,
            estimatedCost: stop.cost,
          }),
        })
      }

      toast.success("🎉 Trip created! Time to start planning.")
      router.push(`/trips/${json.trip.id}`)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsCreating(false)
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Plan a New Trip</h1>
        <p className="text-muted-foreground mt-1">Step {step} of {STEPS.length}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                id < step
                  ? "bg-[#6EE7B7] text-[#050609]"
                  : id === step
                  ? "bg-[#7C8CFF] text-white shadow-lg shadow-[#7C8CFF]/30"
                  : "glass border border-border text-muted-foreground"
              )}>
                {id < step ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={cn("text-[10px] font-medium hidden sm:block",
                id === step ? "text-primary" : "text-muted-foreground"
              )}>{label}</span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7C8CFF] to-[#8BE7FF] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="glass-card p-8">
        <AnimatePresence mode="wait">
          {/* Step 1 — Name */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Name your adventure</h2>
                <p className="text-muted-foreground text-sm">Give this trip a title that captures the vibe</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Trip Name</label>
                <input
                  value={tripData.title}
                  onChange={(e) => setTripData(d => ({ ...d, title: e.target.value }))}
                  placeholder="e.g. Summer in Southeast Asia"
                  className={inputClass(!tripData.title)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes <span className="text-muted-foreground">(optional)</span></label>
                <textarea
                  value={tripData.notes}
                  onChange={(e) => setTripData(d => ({ ...d, notes: e.target.value }))}
                  placeholder="Any initial ideas or requirements..."
                  rows={3}
                  className={cn(inputClass(), "h-auto py-3 resize-none")}
                />
              </div>
            </motion.div>
          )}

          {/* Step 2 — Destinations */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Where are you going?</h2>
                <p className="text-muted-foreground text-sm">Add up to 5 destinations</p>
              </div>

              {/* Current stops */}
              {tripData.stops.length > 0 && (
                <div className="space-y-2">
                  {tripData.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass border border-border">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium text-foreground">{stop.name}</span>
                      <span className="text-xs text-muted-foreground">{stop.days}d</span>
                      <button
                        onClick={() => setTripData(d => ({ ...d, stops: d.stops.filter((_, j) => j !== i) }))}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Destination picker */}
              {tripData.stops.length < 5 && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Select Destinations</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                    {destinations.filter(d => !tripData.stops.find(s => s.destinationId === d.id)).map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => setTripData(d => ({
                          ...d,
                          stops: [...d.stops, {
                            destinationId: dest.id,
                            name: dest.name,
                            days: dest.recommendedDays,
                            cost: dest.avgDailyCost * dest.recommendedDays,
                          }]
                        }))}
                        className="relative h-20 rounded-xl overflow-hidden group text-left"
                      >
                        <Image src={dest.image} alt={dest.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/80 to-transparent" />
                        <div className="absolute bottom-2 left-2">
                          <p className="text-xs font-bold text-white">{dest.name}</p>
                          <p className="text-[10px] text-muted-foreground">{dest.recommendedDays}d</p>
                        </div>
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C8CFF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                  {destinations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">Loading destinations...</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3 — Dates */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">When are you going?</h2>
                <p className="text-muted-foreground text-sm">Set your travel window</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Departure</label>
                  <input
                    type="date"
                    value={tripData.startDate}
                    onChange={(e) => setTripData(d => ({ ...d, startDate: e.target.value }))}
                    className={cn(inputClass(), "[color-scheme:dark]")}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Return</label>
                  <input
                    type="date"
                    value={tripData.endDate}
                    onChange={(e) => setTripData(d => ({ ...d, endDate: e.target.value }))}
                    className={cn(inputClass(), "[color-scheme:dark]")}
                    min={tripData.startDate}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Budget */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">What&apos;s your budget?</h2>
                <p className="text-muted-foreground text-sm">Set a total spending target</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Total Budget (₹)</label>
                <input
                  type="number"
                  value={tripData.totalBudget}
                  onChange={(e) => setTripData(d => ({ ...d, totalBudget: Number(e.target.value) }))}
                  placeholder="50000"
                  min="0"
                  className={inputClass()}
                />
              </div>
              {/* Budget presets */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick select</p>
                <div className="flex flex-wrap gap-2">
                  {[25000, 50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTripData(d => ({ ...d, totalBudget: amt }))}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        tripData.totalBudget === amt
                          ? "bg-[#7C8CFF]/20 text-primary border border-[#7C8CFF]/30"
                          : "glass border border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated from stops */}
              {tripData.stops.length > 0 && (
                <div className="p-4 rounded-xl bg-[#6EE7B7]/5 border border-[#6EE7B7]/15">
                  <p className="text-xs text-[#6EE7B7] font-medium">
                    Based on your stops: ₹{tripData.stops.reduce((a, s) => a + s.cost, 0).toLocaleString()} estimated
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5 — Cover Image */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Choose a cover photo</h2>
                <p className="text-muted-foreground text-sm">Pick an image that captures your trip</p>
              </div>
              <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {coverImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setTripData(d => ({ ...d, coverImage: img.url }))}
                    className={cn(
                      "relative h-24 rounded-xl overflow-hidden transition-all",
                      selectedCoverImage === img.url
                        ? "ring-2 ring-[#7C8CFF] ring-offset-1 ring-offset-[#050609]"
                        : "hover:ring-1 hover:ring-white/20"
                    )}
                  >
                    <Image src={img.url} alt={img.label} fill className="object-cover" />
                    {selectedCoverImage === img.url && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C8CFF] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < STEPS.length ? (
          <button
            onClick={() => {
              if (step === 1 && !tripData.title.trim()) {
                toast.error("Please give your trip a name")
                return
              }
              setStep(s => s + 1)
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white font-semibold text-sm"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={isCreating || !tripData.title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6EE7B7] hover:bg-[#5dd6a5] text-[#050609] font-semibold text-sm disabled:opacity-60 transition-all"
          >
            {isCreating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              <><Check className="w-4 h-4" /> Create Trip</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
