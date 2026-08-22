import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson } from "@/lib/backend-api"
import type { Trip, UserProfile } from "@/types/travel"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  const [profile, trips] = await Promise.all([
    backendJson<UserProfile>("/users/me", { token: session.accessToken }),
    backendJson<Trip[]>("/trips", { token: session.accessToken }).catch(() => []),
  ])

  return <ProfileClient profile={profile} recentTrip={trips[0] ?? null} />
}
