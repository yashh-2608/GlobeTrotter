"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { TrendingUp, AlertTriangle } from "lucide-react"

interface BudgetData {
  transport: number
  accommodation: number
  food: number
  activities: number
  other: number
}

interface TooltipPayload {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
  }>
}

interface BudgetChartProps {
  data: BudgetData
  totalBudget: number
  spent: number
  currency?: string
  className?: string
}

const BUDGET_COLORS = {
  transport: "#7C8CFF",
  accommodation: "#8BE7FF",
  food: "#FBBF77",
  activities: "#6EE7B7",
  other: "#A7ACB8",
}

const CustomTooltip = ({ active, payload }: TooltipPayload) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-stronger rounded-xl px-3 py-2 text-sm">
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="text-[#6EE7B7] font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export function BudgetChart({ data, totalBudget, spent, className }: BudgetChartProps) {
  const pieData = [
    { name: "Transport", value: data.transport, color: BUDGET_COLORS.transport },
    { name: "Stay", value: data.accommodation, color: BUDGET_COLORS.accommodation },
    { name: "Food", value: data.food, color: BUDGET_COLORS.food },
    { name: "Activities", value: data.activities, color: BUDGET_COLORS.activities },
    { name: "Other", value: data.other, color: BUDGET_COLORS.other },
  ].filter((d) => d.value > 0)

  const barData = [
    { name: "Transport", value: data.transport },
    { name: "Stay", value: data.accommodation },
    { name: "Food", value: data.food },
    { name: "Activities", value: data.activities },
    { name: "Other", value: data.other },
  ]

  const percentUsed = totalBudget > 0 ? (spent / totalBudget) * 100 : 0
  const isOverBudget = spent > totalBudget
  const remaining = totalBudget - spent

  return (
    <div className={cn("space-y-6", className)}>
      {/* Budget meter */}
      <div className="glass-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Total Estimated</p>
            <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(spent)}</p>
            <p className="text-sm text-muted-foreground mt-0.5">of {formatCurrency(totalBudget)} budget</p>
          </div>
          {isOverBudget ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FB7185]/10 border border-[#FB7185]/20">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Over Budget</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6EE7B7]/10 border border-[#6EE7B7]/20">
              <TrendingUp className="w-3.5 h-3.5 text-[#6EE7B7]" />
              <span className="text-xs font-semibold text-[#6EE7B7]">On Track</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isOverBudget
                ? "bg-gradient-to-r from-[#FBBF77] to-[#FB7185]"
                : percentUsed > 80
                ? "bg-gradient-to-r from-[#7C8CFF] to-[#FBBF77]"
                : "bg-gradient-to-r from-[#7C8CFF] to-[#8BE7FF]"
            )}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted-foreground">{percentUsed.toFixed(1)}% used</span>
          <span className={cn("text-xs font-semibold", isOverBudget ? "text-destructive" : "text-[#6EE7B7]")}>
            {isOverBudget ? `₹${Math.abs(remaining).toLocaleString()} over` : `₹${remaining.toLocaleString()} left`}
          </span>
        </div>

        {isOverBudget && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-[#FB7185]/5 border border-[#FB7185]/15">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              You&apos;re entering over-budget territory. Consider reducing costs in some categories.
            </p>
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">By Category</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">No expenses yet</div>
          )}
        </div>

        {/* Bar chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Breakdown</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={barData} barSize={16}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#A7ACB8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => {
                  const colors = Object.values(BUDGET_COLORS)
                  return <Cell key={index} fill={colors[index % colors.length]} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
