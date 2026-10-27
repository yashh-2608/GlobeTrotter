"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import type { Trip } from "@/types/travel"

const inputClass = "w-full rounded-xl glass border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50"
const dateValue = (value?: string | Date | null) => value ? new Date(value).toISOString().slice(0, 10) : ""

export function TripEditForm({ trip }: { trip: Trip }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: trip.title,
    status: trip.status,
    startDate: dateValue(trip.startDate),
    endDate: dateValue(trip.endDate),
    totalBudget: String(trip.totalBudget),
    currency: trip.currency,
    coverImage: trip.coverImage ?? "",
    notes: trip.notes ?? "",
  })

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          totalBudget: Number(form.totalBudget),
          coverImage: form.coverImage || null,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error ?? "Could not save trip details")
      toast.success("Trip details saved")
      router.push(`/trips/${trip.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save trip details")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-28">
      <Link href={`/trips/${trip.id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to trip
      </Link>
      <h1 className="text-3xl font-bold text-foreground">Trip details</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">Update the information shown across your trip.</p>

      <form onSubmit={save} className="glass-card space-y-5 p-6">
        <label className="block space-y-2 text-sm font-medium">Trip name
          <input className={inputClass} required minLength={2} value={form.title} onChange={(e) => update("title", e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium">Status
            <select className={inputClass} value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="UPCOMING">Upcoming</option><option value="ONGOING">Ongoing</option><option value="COMPLETED">Completed</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium">Currency
            <select className={inputClass} value={form.currency} onChange={(e) => update("currency", e.target.value)}>
              {["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"].map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium">Start date
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
          </label>
          <label className="block space-y-2 text-sm font-medium">End date
            <input type="date" min={form.startDate || undefined} className={inputClass} value={form.endDate} onChange={(e) => update("endDate", e.target.value)} />
          </label>
        </div>
        <label className="block space-y-2 text-sm font-medium">Total budget
          <input type="number" min="0" step="0.01" className={inputClass} value={form.totalBudget} onChange={(e) => update("totalBudget", e.target.value)} />
        </label>
        <label className="block space-y-2 text-sm font-medium">Cover image URL
          <input type="url" className={inputClass} placeholder="https://…" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} />
        </label>
        <label className="block space-y-2 text-sm font-medium">Trip notes
          <textarea rows={5} className={inputClass} placeholder="Plans, reminders, and anything else to remember" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </label>
        <div className="flex justify-end">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl btn-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save trip details
          </button>
        </div>
      </form>
      <div className="mt-5 rounded-xl border border-border p-4 text-sm text-muted-foreground">
        Destination stops, days, costs, and activities can be added in the <Link className="text-primary hover:underline" href={`/trips/${trip.id}/builder`}>itinerary builder</Link>.
      </div>
    </main>
  )
}
