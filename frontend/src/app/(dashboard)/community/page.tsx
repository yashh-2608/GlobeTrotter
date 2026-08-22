import { auth } from "@/auth"
import { backendJson } from "@/lib/backend-api"
import type { CommunityPost } from "@/types/travel"
import { CommunityClient } from "./community-client"

export default async function CommunityPage() {
  const session = await auth()
  const posts = await backendJson<CommunityPost[]>("/community").catch(() => [])

  return <CommunityClient initialPosts={posts} isAuthenticated={Boolean(session?.accessToken)} />
}
