import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `₹${Math.round(value).toLocaleString("en-IN")}`
  }
}

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return ""
  }

  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function getDaysRemaining(value?: string | Date | null) {
  if (!value) {
    return 0
  }

  const date = value instanceof Date ? value : new Date(value)
  const diff = date.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function generateShareSlug(title: string) {
  return `${title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Math.random().toString(36).slice(2, 8)}`
}
