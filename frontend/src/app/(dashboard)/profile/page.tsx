import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import type { Trip, UserProfile } from "@/types/travel"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/login")
  const result = await Promise.all([
    backendJson<UserProfile>("/users/me", { token: session.accessToken }),
    backendJson<Trip[]>("/trips", { token: session.accessToken }),
  ]).catch((error) => {
    if (error instanceof BackendError && error.status === 401) redirect("/login?sessionExpired=1")
    throw error
  })
  return <ProfileClient profile={result[0]} recentTrip={result[1][0] ?? null} />
}
