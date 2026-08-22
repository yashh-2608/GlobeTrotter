"use client"

import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ShieldCheck, Users, Route, Globe2, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const colors = ["#7C8CFF", "#8BE7FF", "#6EE7B7", "#FBBF77", "#FB7185", "#A7ACB8", "#C4B5FD"]

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

export function AdminDashboard({ stats }: { stats: AdminStats }) {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-8">
      <section className="glass-card p-8">
        <div className="inline-flex items-center gap-2 text-[#8BE7FF] text-xs uppercase tracking-[0.28em] mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin console
        </div>
        <h1 className="text-4xl font-bold text-foreground">Platform health at a glance</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Live aggregate stats pulled straight from the database.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Users", value: stats.totals.users, icon: Users },
          { label: "Trips", value: stats.totals.trips, icon: Route },
          { label: "Active trips", value: stats.totals.activeTrips, icon: Globe2 },
          { label: "Public shares", value: stats.totals.publicShares, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
                <div className="text-3xl font-bold text-foreground mt-3">{value.toLocaleString()}</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">Trips created — last 7 days</h2>
            <div className="text-sm text-muted-foreground">{formatCurrency(stats.totals.totalBudget)} planned</div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.traffic}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#A7ACB8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#A7ACB8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(11,13,18,0.95)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  color: "#F5F5F5",
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {stats.traffic.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Repeat planners</div>
            <div className="text-4xl font-bold text-foreground">{stats.retention}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              Share of users who have planned more than one trip — a proxy for how often people come back.
            </p>
          </div>
          <div className="glass-card p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3">Total planned budget</div>
            <div className="text-4xl font-bold text-foreground">{formatCurrency(stats.totals.totalBudget)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Sum of the budgets travelers have set across every trip on the platform.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Most popular destinations</h2>
          <div className="space-y-3">
            {stats.popularDestinations.map((destination) => (
              <div key={destination.id} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8">
                <div>
                  <div className="text-sm font-semibold text-foreground">{destination.name}</div>
                  <div className="text-xs text-muted-foreground">{destination.country}</div>
                </div>
                <div className="text-sm font-semibold text-[#8BE7FF]">{destination.popularity}</div>
              </div>
            ))}
            {stats.popularDestinations.length === 0 && (
              <p className="text-sm text-muted-foreground">No destinations yet.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent trips</h2>
          <div className="space-y-3">
            {stats.recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8">
                <div>
                  <div className="text-sm font-semibold text-foreground">{trip.title}</div>
                  <div className="text-xs text-muted-foreground">by @{trip.user.username}</div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/8 text-muted-foreground">
                  {trip.status}
                </span>
              </div>
            ))}
            {stats.recentTrips.length === 0 && (
              <p className="text-sm text-muted-foreground">No trips yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
