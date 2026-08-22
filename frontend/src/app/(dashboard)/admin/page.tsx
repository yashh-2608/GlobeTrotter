import { redirect } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { auth } from "@/auth"
import { backendJson, BackendError } from "@/lib/backend-api"
import { AdminDashboard } from "./admin-dashboard"

interface AdminStats {
  totals: {
    users: number
    trips: number
    destinations: number
    activities: number
    activeTrips: number
    publicShares: number
    totalBudget: number
  }
  retention: number
  traffic: { name: string; value: number }[]
  popularDestinations: { id: string; name: string; country: string; popularity: number }[]
  recentTrips: { id: string; title: string; status: string; user: { name: string; username: string } }[]
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/login")
  }

  if (session.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
        <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Admin access required</h1>
        <p className="text-muted-foreground mt-2">This dashboard is limited to platform administrators.</p>
      </div>
    )
  }

  const stats = await backendJson<AdminStats>("/admin/stats", { token: session.accessToken }).catch((error) => {
    if (error instanceof BackendError && error.status === 403) {
      return null
    }
    throw error
  })

  if (!stats) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
        <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Admin access required</h1>
        <p className="text-muted-foreground mt-2">This dashboard is limited to platform administrators.</p>
      </div>
    )
  }

  return <AdminDashboard stats={stats} />
}
