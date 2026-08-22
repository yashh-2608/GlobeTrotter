import { ACTIVITIES, DESTINATIONS } from "@/lib/data"
import type { Activity, CommunityPost, Trip, UserProfile } from "@/types/travel"

const activityMap = Object.fromEntries(ACTIVITIES.map((activity) => [activity.id, activity]))

function makeActivity(
  id: string,
  scheduledTime: string,
  notes: string
): Activity {
  const activity = activityMap[id]

  return {
    id: activity.id,
    name: activity.name,
    title: activity.name,
    scheduledTime,
    duration: activity.duration,
    estimatedCost: activity.estimatedCost,
    category: activity.category,
    notes,
  }
}

function makeStop(params: {
  id: string
  destinationId: string
  order: number
  startDate: string
  endDate: string
  daysCount: number
  estimatedCost: number
  activityIds: string[]
}): Trip["stops"][number] {
  const destination = DESTINATIONS.find((item) => item.id === params.destinationId)

  return {
    id: params.id,
    destinationId: params.destinationId,
    order: params.order,
    startDate: params.startDate,
    endDate: params.endDate,
    daysCount: params.daysCount,
    estimatedCost: params.estimatedCost,
    destination,
    activities: params.activityIds.map((activityId, index) =>
      makeActivity(
        activityId,
        `${String(10 + index).padStart(2, "0")}:00`,
        `Hand-picked for the ${destination?.name ?? params.destinationId} leg of the trip.`
      )
    ),
    expenses: [],
  }
}

export const MOCK_TRIPS: Trip[] = [
  {
    id: "tokyo-bali-reset",
    title: "Tokyo to Bali Reset",
    status: "ONGOING",
    coverImage: DESTINATIONS.find((item) => item.id === "tokyo")?.image ?? "",
    startDate: "2026-08-18",
    endDate: "2026-08-28",
    totalBudget: 180000,
    currency: "INR",
    shareSlug: "tokyo-bali-reset",
    isPublic: true,
    notes: "A calm-paced escape with iconic city energy and a soft landing by the sea.",
    stops: [
      makeStop({
        id: "stop-tokyo",
        destinationId: "tokyo",
        order: 1,
        startDate: "2026-08-18",
        endDate: "2026-08-22",
        daysCount: 4,
        estimatedCost: 52000,
        activityIds: ["shibuya-crossing", "senso-ji"],
      }),
      makeStop({
        id: "stop-bali",
        destinationId: "bali",
        order: 2,
        startDate: "2026-08-23",
        endDate: "2026-08-28",
        daysCount: 5,
        estimatedCost: 68000,
        activityIds: ["bali-temples", "bali-rice-terraces"],
      }),
    ],
    expenses: [],
  },
  {
    id: "paris-rome-classic",
    title: "Paris and Rome Classic",
    status: "COMPLETED",
    coverImage: DESTINATIONS.find((item) => item.id === "paris")?.image ?? "",
    startDate: "2026-05-12",
    endDate: "2026-05-22",
    totalBudget: 210000,
    currency: "INR",
    shareSlug: "paris-rome-classic",
    isPublic: true,
    notes: "A slow, art-forward route with long dinners and museum mornings.",
    stops: [
      makeStop({
        id: "stop-paris",
        destinationId: "paris",
        order: 1,
        startDate: "2026-05-12",
        endDate: "2026-05-16",
        daysCount: 4,
        estimatedCost: 76000,
        activityIds: ["eiffel-tour", "louvre-museum", "seine-cruise"],
      }),
      makeStop({
        id: "stop-rome",
        destinationId: "rome",
        order: 2,
        startDate: "2026-05-17",
        endDate: "2026-05-22",
        daysCount: 5,
        estimatedCost: 85000,
        activityIds: ["colosseum-rome"],
      }),
    ],
    expenses: [],
  },
  {
    id: "dubai-skyline-sprint",
    title: "Dubai Skyline Sprint",
    status: "UPCOMING",
    coverImage: DESTINATIONS.find((item) => item.id === "dubai")?.image ?? "",
    startDate: "2026-11-08",
    endDate: "2026-11-13",
    totalBudget: 130000,
    currency: "INR",
    shareSlug: "dubai-skyline-sprint",
    isPublic: false,
    notes: "Luxury-forward with a strong evening agenda and a desert finale.",
    stops: [
      makeStop({
        id: "stop-dubai",
        destinationId: "dubai",
        order: 1,
        startDate: "2026-11-08",
        endDate: "2026-11-13",
        daysCount: 5,
        estimatedCost: 98000,
        activityIds: ["dubai-desert-safari", "burj-khalifa"],
      }),
    ],
    expenses: [],
  },
]

export const MOCK_PROFILE: UserProfile = {
  id: "user-globetrotter",
  email: "explorer@globetrotter.travel",
  name: "Aarav Mehta",
  username: "aarav_explores",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop",
  city: "Mumbai",
  country: "India",
  phone: "+91 98765 43210",
  bio: "Designing slower trips with strong coffee, better light, and fewer compromises.",
  preferences: ["Food", "Design", "Nature", "Wellness"],
  role: "ADMIN",
  createdAt: "2025-12-14",
  _count: {
    trips: MOCK_TRIPS.length,
    posts: 14,
    savedTrips: 7,
  },
}

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    caption: "Tokyo at dusk always feels like the future arriving early.",
    images: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&auto=format&fit=crop",
    ],
    location: "Shibuya, Tokyo",
    createdAt: "2026-08-21T15:30:00.000Z",
    user: {
      id: "user-1",
      name: "Maya Kapoor",
      username: "mayaontheroad",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop",
      city: "Bengaluru",
      country: "India",
    },
    trip: {
      id: "tokyo-bali-reset",
      title: "Tokyo to Bali Reset",
      coverImage: DESTINATIONS.find((item) => item.id === "tokyo")?.image ?? "",
    },
    comments: [
      {
        id: "comment-1",
        content: "That light is unreal.",
        createdAt: "2026-08-21T18:02:00.000Z",
        user: {
          id: "user-2",
          name: "Dev Patel",
          username: "devwanders",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop",
        },
      },
    ],
    _count: {
      likes: 198,
      comments: 12,
    },
  },
  {
    id: "post-2",
    caption: "Paris breakfasts are basically a design language.",
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop",
    ],
    location: "Paris, France",
    createdAt: "2026-07-11T09:05:00.000Z",
    user: {
      id: "user-3",
      name: "Leah Martin",
      username: "leahglides",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop",
      city: "London",
      country: "UK",
    },
    trip: {
      id: "paris-rome-classic",
      title: "Paris and Rome Classic",
      coverImage: DESTINATIONS.find((item) => item.id === "paris")?.image ?? "",
    },
    comments: [],
    _count: {
      likes: 256,
      comments: 21,
    },
  },
]

export const MOCK_CALENDAR_EVENTS = [
  {
    date: "2026-08-18",
    title: "Fly to Tokyo",
    time: "09:20",
    location: "Narita Airport",
    color: "text-primary",
  },
  {
    date: "2026-08-19",
    title: "Shibuya Crossing walk",
    time: "17:00",
    location: "Shibuya",
    color: "text-[#8BE7FF]",
  },
  {
    date: "2026-08-23",
    title: "Balinese temple circuit",
    time: "08:15",
    location: "Uluwatu",
    color: "text-[#6EE7B7]",
  },
]

export const MOCK_ADMIN_STATS = {
  totalUsers: 12480,
  totalTrips: 8610,
  activeTrips: 1412,
  publicShares: 2318,
  revenue: 9420000,
  retention: 68,
  traffic: [
    { name: "Mon", value: 4200 },
    { name: "Tue", value: 4800 },
    { name: "Wed", value: 6100 },
    { name: "Thu", value: 5600 },
    { name: "Fri", value: 6900 },
    { name: "Sat", value: 7400 },
    { name: "Sun", value: 6800 },
  ],
}

export function getMockTripById(id: string) {
  return MOCK_TRIPS.find((trip) => trip.id === id) ?? MOCK_TRIPS[0]
}

export function getMockTripBySlug(slug: string) {
  return MOCK_TRIPS.find((trip) => trip.shareSlug === slug) ?? MOCK_TRIPS[0]
}
