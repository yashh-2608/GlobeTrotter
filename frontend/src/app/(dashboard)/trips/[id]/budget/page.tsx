import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import { BudgetChart } from "@/components/travel/budget-chart"
import type { BudgetSummary, Trip } from "@/types/travel"

export default async function TripBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  const result = await Promise.all([
    backendJson<Trip>(`/trips/${id}`, { token: session.accessToken }),
    backendJson<BudgetSummary>(`/trips/${id}/budget`, { token: session.accessToken }),
  ]).catch((error) => {
    if (error instanceof BackendError && error.status === 404) {
      return null
    }
    if (error instanceof BackendError && error.status === 401) {
      return "unauthorized" as const
    }
    throw error
  })

  if (result === "unauthorized") {
    redirect("/login")
  }

  if (!result) {
    notFound()
  }

  const [trip, budget] = result

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16">
      <div className="mb-8">
        <p className="text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-2">Trip budget</p>
        <h1 className="text-4xl font-bold text-foreground">{trip.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          A quick budget view to keep the experience feeling premium rather than guess-driven.
        </p>
      </div>

      <p className="mb-5 text-sm text-muted-foreground">Actual expenses: {new Intl.NumberFormat("en-IN", { style: "currency", currency: budget.currency }).format(budget.spent)}</p>
      <BudgetChart data={budget.breakdown} totalBudget={budget.totalBudget} spent={budget.estimated} currency={budget.currency} />
    </div>
  )
}
