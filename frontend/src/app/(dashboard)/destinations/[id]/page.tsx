import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { backendJson, BackendError } from "@/lib/backend-api"
import { formatCurrency } from "@/lib/utils"
import { ActivityCard } from "@/components/travel/activity-card"
import type { Destination, Activity } from "@/types/travel"

export default async function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = await backendJson<Destination & { activities: Activity[] }>(`/destinations/${id}`).catch((error) => {
    if (error instanceof BackendError && error.status === 404) notFound()
    throw error
  })
  return <div className="mx-auto max-w-5xl px-6 pt-28 pb-12 space-y-6">
    <Link href="/destinations" className="text-sm text-primary">← All destinations</Link>
    <div className="relative h-60 sm:h-80 overflow-hidden rounded-2xl"><Image src={destination.image} alt={destination.name} fill sizes="(max-width: 768px) 100vw, 1024px" className="object-cover" priority /></div>
    <div><p className="text-primary">{destination.country}</p><h1 className="text-4xl font-bold mt-2">{destination.name}</h1><p className="mt-4 text-muted-foreground">{destination.description}</p></div>
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground"><span>{formatCurrency(destination.avgDailyCost)} / day estimated</span><span>{destination.recommendedDays} days recommended</span><span>Best time: {destination.bestTimeToVisit ?? "Year round"}</span></div>
    <Link href={`/trips/new?destination=${id}`} className="inline-flex rounded-xl btn-primary px-5 py-3 font-semibold">Plan a trip here</Link>
    <section><h2 className="text-2xl font-bold mb-4">Things to do</h2><div className="grid gap-4 sm:grid-cols-2">{destination.activities.map((activity) => <ActivityCard key={activity.id} id={activity.id} name={activity.name} location={destination.name} image={activity.image ?? destination.image} category={activity.category ?? "Experience"} duration={activity.duration ?? undefined} estimatedCost={activity.estimatedCost} rating={activity.rating ?? 0} description={activity.description ?? ""} />)}</div></section>
  </div>
}
