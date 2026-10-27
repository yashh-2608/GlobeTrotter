export type TripStatus = "UPCOMING" | "ONGOING" | "COMPLETED"

export interface Destination {
  id: string
  name: string
  country: string
  region: string
  image: string
  description: string
  avgDailyCost: number
  popularity: number
  bestTimeToVisit?: string | null
  recommendedDays: number
  tags: string[]
}

export interface Activity {
  id: string
  destinationId?: string
  name: string
  title?: string
  category?: string | null
  image?: string
  description?: string
  duration?: string | null
  estimatedCost: number
  actualCost?: number | null
  rating?: number
  scheduledDate?: string | Date | null
  scheduledTime?: string | null
  notes?: string | null
  activity?: {
    id: string
    name: string
  } | null
}

export interface TripStop {
  id: string
  destinationId: string
  order: number
  startDate?: string | Date | null
  endDate?: string | Date | null
  daysCount: number
  estimatedCost: number
  notes?: string | null
  destination?: Destination
  activities: Activity[]
  expenses?: Array<{
    id: string
    amount: number
    category: string
    description: string
  }>
}

export interface Trip {
  id: string
  title: string
  status: TripStatus
  coverImage?: string | null
  startDate?: string | Date | null
  endDate?: string | Date | null
  totalBudget: number
  currency: string
  shareSlug?: string | null
  isPublic?: boolean
  notes?: string | null
  stops: TripStop[]
  expenses?: Array<{
    id: string
    amount: number
    category: string
    description: string
  }>
  _count?: {
    stops: number
  }
}

export interface CommunityPost {
  id: string
  caption: string
  images: string[]
  location?: string | null
  createdAt: string | Date
  user: {
    id: string
    name: string
    username: string
    avatar?: string | null
    city?: string | null
    country?: string | null
  }
  trip?: {
    id: string
    title: string
    coverImage?: string | null
  } | null
  comments: Array<{
    id: string
    content: string
    createdAt: string | Date
    user: {
      id: string
      name: string
      username: string
      avatar?: string | null
    }
  }>
  _count: {
    likes: number
    comments: number
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string
  username: string
  avatar?: string | null
  city?: string | null
  country?: string | null
  phone?: string | null
  bio?: string | null
  preferences: string[]
  role: string
  createdAt: string | Date
  _count: {
    trips: number
    posts: number
    savedTrips: number
  }
}

export interface BudgetSummary {
  totalBudget: number
  spent: number
  estimated: number
  remaining: number
  currency: string
  breakdown: {
    transport: number
    accommodation: number
    food: number
    activities: number
    other: number
  }
}
