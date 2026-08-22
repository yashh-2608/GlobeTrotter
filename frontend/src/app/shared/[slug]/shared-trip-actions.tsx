"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function SharedTripActions({ slug, isAuthenticated }: { slug: string; isAuthenticated: boolean }) {
  const router = useRouter()
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isCopyingTrip, setIsCopyingTrip] = useState(false)

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopiedUrl(true)
    window.setTimeout(() => setCopiedUrl(false), 1800)
  }

  const handleCopyTrip = async () => {
    setIsCopyingTrip(true)
    try {
      const res = await fetch(`/api/shared/${slug}/copy`, { method: "POST" })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error(json?.error ?? "Failed to copy trip")
        return
      }

      toast.success("Trip copied to your account!")
      router.push(`/trips/${json.trip.id}`)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsCopyingTrip(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 mt-8">
      <button
        onClick={handleCopyUrl}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass border border-border text-foreground font-semibold text-sm hover:bg-white/8 transition-all"
      >
        <Copy className="w-4 h-4" />
        {copiedUrl ? "Link copied" : "Copy link"}
      </button>

      {isAuthenticated ? (
        <button
          onClick={handleCopyTrip}
          disabled={isCopyingTrip}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full btn-primary text-white font-semibold text-sm disabled:opacity-60"
        >
          {isCopyingTrip ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isCopyingTrip ? "Copying..." : "Copy this trip"}
        </button>
      ) : (
        <Link
          href={`/login?callbackUrl=/shared/${slug}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full btn-primary text-white font-semibold text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Sign in to copy this trip
        </Link>
      )}
    </div>
  )
}
