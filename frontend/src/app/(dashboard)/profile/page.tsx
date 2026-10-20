import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import type { Trip, UserProfile } from "@/types/travel"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  let profile: UserProfile
  let trips: Trip[]

  try {
    ;[profile, trips] = await Promise.all([
      backendJson<UserProfile>("/users/me", { token: session.accessToken }),
      backendJson<Trip[]>("/trips", { token: session.accessToken }).catch(() => []),
    ])
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      // Token is invalid/expired (e.g. demo session) — build profile from session data
      profile = {
        id: session.user?.id ?? "",
        email: session.user?.email ?? "",
        name: session.user?.name ?? "Explorer",
        username: (session.user as { username?: string } | undefined)?.username ?? session.user?.email?.split("@")[0] ?? "explorer",
        avatar: session.user?.image ?? null,
        city: null,
        country: null,
        phone: null,
        bio: null,
        preferences: [],
        role: (session.user as { role?: string } | undefined)?.role ?? "USER",
        createdAt: new Date().toISOString(),
        _count: { trips: 0, posts: 0, savedTrips: 0 },
      }
      trips = []
    } else {
      throw error
    }
  }

  const tripsArray = Array.isArray(trips) ? trips : []

  return <ProfileClient profile={profile} recentTrip={tripsArray[0] ?? null} />
}
