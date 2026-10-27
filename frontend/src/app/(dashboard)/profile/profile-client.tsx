"use client"

import { useState } from "react"
import { SafeImage as Image } from "@/components/travel/safe-image"
import { useRouter } from "next/navigation"
import { Pencil, X, Check, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DestinationCard } from "@/components/travel/destination-card"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
import type { Trip, UserProfile } from "@/types/travel"

interface ProfileFormState {
  name: string
  avatar: string
  city: string
  country: string
  phone: string
  bio: string
  preferences: string[]
}

function toFormState(profile: UserProfile): ProfileFormState {
  return {
    name: profile.name,
    avatar: profile.avatar ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
    preferences: profile.preferences,
  }
}

const inputClass =
  "w-full h-11 px-4 rounded-xl glass border border-border text-foreground placeholder-[#A7ACB8]/50 text-sm transition-all outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"

export function ProfileClient({
  profile,
  recentTrip,
}: {
  profile: UserProfile
  recentTrip: Trip | null
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ProfileFormState>(toFormState(profile))
  const [preferenceDraft, setPreferenceDraft] = useState("")

  const startEditing = () => {
    setForm(toFormState(profile))
    setIsEditing(true)
  }

  const addPreference = () => {
    const value = preferenceDraft.trim()
    if (!value || form.preferences.includes(value)) {
      setPreferenceDraft("")
      return
    }
    setForm((prev) => ({ ...prev, preferences: [...prev.preferences, value] }))
    setPreferenceDraft("")
  }

  const removePreference = (value: string) => {
    setForm((prev) => ({ ...prev, preferences: prev.preferences.filter((p) => p !== value) }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name can't be empty")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          avatar: form.avatar.trim() || undefined,
          city: form.city.trim(),
          country: form.country.trim(),
          phone: form.phone.trim(),
          bio: form.bio.trim(),
          preferences: form.preferences,
        }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error(json?.error ?? "Failed to update profile")
        return
      }

      toast.success("Profile updated")
      setIsEditing(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
        <div className="glass-card p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl overflow-hidden ring-1 ring-white/10 bg-white/4 flex-shrink-0">
                {(isEditing ? form.avatar : profile.avatar) ? (
                  <Image
                    src={(isEditing ? form.avatar : profile.avatar) as string}
                    alt={profile.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#8BE7FF] mb-2">Traveler profile</p>
                {isEditing ? (
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={cn(inputClass, "h-9 text-xl font-bold px-3")}
                    placeholder="Your name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                )}
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-border text-muted-foreground hover:text-foreground text-sm transition-all flex-shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Photo URL</label>
                <input
                  value={form.avatar}
                  onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className={cn(inputClass, "h-auto py-3 resize-none")}
                  placeholder="A little about how you like to travel..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Country</label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Preferences</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.preferences.map((preference) => (
                    <Badge
                      key={preference}
                      variant="outline"
                      className="border-white/10 text-foreground bg-white/4 gap-1.5"
                    >
                      {preference}
                      <button onClick={() => removePreference(preference)} aria-label={`Remove ${preference}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={preferenceDraft}
                    onChange={(e) => setPreferenceDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addPreference()
                      }
                    }}
                    placeholder="Add a preference..."
                    className={inputClass}
                  />
                  <button
                    onClick={addPreference}
                    className="w-11 h-11 rounded-xl glass border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
                    aria-label="Add preference"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white font-semibold text-sm disabled:opacity-60"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Save changes</>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl glass border border-border text-muted-foreground hover:text-foreground text-sm font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                {profile.bio || "No bio yet — tell other travelers what you're about."}
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                {profile.preferences.length > 0 ? (
                  profile.preferences.map((preference) => (
                    <Badge key={preference} variant="outline" className="border-white/10 text-foreground bg-white/4">
                      {preference}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No preferences added yet.</span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Trips planned", value: profile._count.trips },
            { label: "Saved trips", value: profile._count.savedTrips },
            { label: "Published posts", value: profile._count.posts },
            { label: "Member since", value: formatDate(profile.createdAt) },
          ].map((item) => (
            <Card key={item.label} className="glass-card border-0">
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{item.label}</div>
                <div className="text-2xl font-bold text-foreground mt-3">{item.value}</div>
              </CardContent>
            </Card>
          ))}

          <Card className="glass-card border-0 col-span-2">
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Primary location</div>
              <div className="text-xl font-bold text-foreground">
                {profile.city || profile.country ? `${profile.city ?? ""}${profile.city && profile.country ? ", " : ""}${profile.country ?? ""}` : "Not set"}
              </div>
              <div className="text-sm text-muted-foreground mt-2">{profile.email}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {recentTrip && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-2">Recent route</p>
              <h2 className="text-2xl font-bold text-foreground">Most recent trip</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Budgeted at <span className="text-[#6EE7B7] font-semibold">{formatCurrency(recentTrip.totalBudget, recentTrip.currency)}</span>
            </div>
          </div>
          {recentTrip.stops[0] && (
            <DestinationCard
              id={recentTrip.stops[0].destinationId}
              name={recentTrip.stops[0].destination?.name ?? recentTrip.stops[0].destinationId}
              country={recentTrip.stops[0].destination?.country ?? ""}
              image={recentTrip.coverImage ?? recentTrip.stops[0].destination?.image ?? ""}
              description={recentTrip.notes ?? "A recent journey summary."}
              avgDailyCost={recentTrip.stops[0].estimatedCost}
              popularity={recentTrip.stops[0].destination?.popularity ?? 90}
              recommendedDays={recentTrip.stops[0].daysCount}
              bestTimeToVisit={recentTrip.stops[0].destination?.bestTimeToVisit ?? ""}
              tags={recentTrip.stops[0].destination?.tags ?? []}
              size="lg"
            />
          )}
        </section>
      )}
    </div>
  )
}
