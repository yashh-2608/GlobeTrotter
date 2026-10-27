"use client"

import Link from "next/link"

export default function DashboardError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-xl px-6 pt-32 text-center">
    <h1 className="text-2xl font-bold">We couldn’t load this page</h1>
    <p className="my-4 text-muted-foreground">Your saved plans haven’t been removed. The service may be temporarily unavailable.</p>
    <button onClick={reset} className="btn-primary rounded-xl px-5 py-3">Try again</button>
    <Link href="/explore" className="ml-4 text-primary">Explore destinations</Link>
  </section>
}
