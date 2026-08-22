"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, MapPin, Users, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { CommunityPost } from "@/types/travel"

function CommunityPostCard({
  post,
  liked,
  isAuthenticated,
  onToggleLike,
}: {
  post: CommunityPost
  liked: boolean
  isAuthenticated: boolean
  onToggleLike: (id: string) => void
}) {
  return (
    <article className="glass-card overflow-hidden">
      <div className="p-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-white/8 flex items-center justify-center flex-shrink-0">
          {post.user.avatar ? (
            <Image src={post.user.avatar} alt={post.user.name} width={44} height={44} className="object-cover" />
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">{post.user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-foreground">{post.user.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {post.location ?? "Somewhere out there"}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.24em] text-[#8BE7FF]">Story</div>
      </div>

      {post.images[0] && (
        <div className="relative aspect-[4/3]">
          <Image src={post.images[0]} alt={post.caption} fill className="object-cover" />
        </div>
      )}

      <div className="p-5 space-y-4">
        <p className="text-sm text-foreground leading-relaxed">{post.caption}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button
            onClick={() => (isAuthenticated ? onToggleLike(post.id) : toast.error("Sign in to like a story"))}
            className={cn(
              "inline-flex items-center gap-1.5 transition-colors",
              liked ? "text-destructive" : "hover:text-destructive"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
            {post._count.likes}
          </button>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-[#8BE7FF]" />
            {post._count.comments}
          </span>
        </div>
      </div>
    </article>
  )
}

export function CommunityClient({
  initialPosts,
  isAuthenticated,
}: {
  initialPosts: CommunityPost[]
  isAuthenticated: boolean
}) {
  const [posts, setPosts] = useState(initialPosts)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const stats = useMemo(() => {
    const creators = new Set(posts.map((post) => post.user.id)).size
    const totalLikes = posts.reduce((sum, post) => sum + post._count.likes, 0)
    return [
      { value: creators.toLocaleString(), label: "Creators" },
      { value: totalLikes.toLocaleString(), label: "Likes shared" },
      { value: posts.length.toLocaleString(), label: "Travel moments" },
    ]
  }, [posts])

  const handleToggleLike = async (id: string) => {
    const wasLiked = likedIds.has(id)

    setLikedIds((prev) => {
      const next = new Set(prev)
      if (wasLiked) next.delete(id)
      else next.add(id)
      return next
    })
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, _count: { ...post._count, likes: post._count.likes + (wasLiked ? -1 : 1) } }
          : post
      )
    )

    try {
      const res = await fetch(`/api/community/${id}/like`, { method: "POST" })
      if (!res.ok) throw new Error()
    } catch {
      toast.error("Couldn't update like — try again")
      setLikedIds((prev) => {
        const next = new Set(prev)
        if (wasLiked) next.add(id)
        else next.delete(id)
        return next
      })
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? { ...post, _count: { ...post._count, likes: post._count.likes + (wasLiked ? 1 : -1) } }
            : post
        )
      )
    }
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5 items-stretch">
        <div className="glass-card p-8 relative overflow-hidden">
          <div className="absolute -right-24 -top-16 w-72 h-72 rounded-full bg-[#7C8CFF]/10 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-3">
              <Users className="w-3.5 h-3.5" />
              Community feed
            </div>
            <h1 className="text-4xl font-bold text-foreground max-w-xl">
              See where other travelers are finding their best moments.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              A social layer for trip inspiration, fresh recommendations, and a little proof that
              the right light can make any place feel unforgettable.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="text-xl font-bold text-foreground">{item.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Tip of the day
            </div>
            <h2 className="text-2xl font-bold text-foreground">Post the trip before the trip.</h2>
            <p className="text-muted-foreground mt-3">
              Public trip snapshots help friends follow along and make your planning feel more
              alive while you&apos;re still building it.
            </p>
          </div>
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#7C8CFF]/15 to-[#8BE7FF]/10 border border-white/10 p-5">
            <div className="text-sm font-semibold text-foreground mb-2">What people share</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Sunset clips from moving trains and ferries</li>
              <li>• Breakfast tables worth building a detour around</li>
              <li>• Small route changes that make a whole day feel better</li>
            </ul>
          </div>
        </div>
      </section>

      {posts.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ delay: index * 0.08 }}
            >
              <CommunityPostCard
                post={post}
                liked={likedIds.has(post.id)}
                isAuthenticated={isAuthenticated}
                onToggleLike={handleToggleLike}
              />
            </motion.div>
          ))}
        </section>
      ) : (
        <section className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No stories shared yet. Be the first to post from a trip.</p>
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl btn-primary text-white font-semibold text-sm"
          >
            Go to my trips
          </Link>
        </section>
      )}
    </div>
  )
}
