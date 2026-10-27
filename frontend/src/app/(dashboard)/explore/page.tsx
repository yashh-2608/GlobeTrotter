import { backendJson } from "@/lib/backend-api"
import type { Destination } from "@/types/travel"
import ExploreClient from "./explore-client"

export default async function ExplorePage() {
  const destinations = await backendJson<Destination[]>("/destinations")
  return <ExploreClient destinations={destinations} />
}
