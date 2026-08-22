import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const destinationSeeds = [
  ["Paris", "France", "Europe", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop", "Romantic boulevards, museums, and timeless cafe culture.", 8600, 98, "Apr-Jun, Sep-Oct", 5, ["Culture", "Food", "Art"]],
  ["Tokyo", "Japan", "Asia", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop", "Electric energy, precise design, and world-class dining.", 7900, 97, "Mar-May, Oct-Nov", 6, ["Food", "Technology", "Nightlife"]],
  ["Bali", "Indonesia", "Asia", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop", "Surf, temples, jungle villas, and serene mornings.", 4200, 92, "May-Sep", 7, ["Nature", "Relaxation", "Adventure"]],
  ["Rome", "Italy", "Europe", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop", "Ancient ruins, piazzas, and unforgettable pasta nights.", 7600, 95, "Apr-Jun, Sep-Oct", 5, ["History", "Food", "Culture"]],
  ["Barcelona", "Spain", "Europe", "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&auto=format&fit=crop", "Bold architecture, Mediterranean rhythm, and beach energy.", 7400, 93, "May-Jun, Sep-Oct", 4, ["Art", "Nightlife", "Food"]],
  ["Amsterdam", "Netherlands", "Europe", "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop", "Canals, cycling, design shops, and cozy evenings.", 7800, 90, "Apr-May, Sep-Oct", 4, ["Culture", "Design", "Cycling"]],
  ["New York", "United States", "North America", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop", "Iconic skyline, world-class shows, and nonstop ambition.", 13200, 96, "Apr-Jun, Sep-Nov", 5, ["City", "Shopping", "Shows"]],
  ["Dubai", "United Arab Emirates", "Middle East", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop", "Sky-high luxury, desert escapes, and immaculate hospitality.", 15100, 94, "Nov-Mar", 5, ["Luxury", "Shopping", "Adventure"]],
  ["Santorini", "Greece", "Europe", "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&auto=format&fit=crop", "Cliffside suites, sea views, and cinematic sunsets.", 9800, 91, "May-Oct", 4, ["Luxury", "Relaxation", "Romance"]],
  ["Kyoto", "Japan", "Asia", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop", "Shrines, tea houses, and quiet seasonal beauty.", 6900, 88, "Mar-May, Oct-Nov", 5, ["Culture", "History", "Nature"]],
  ["Cape Town", "South Africa", "Africa", "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=1200&auto=format&fit=crop", "Ocean drives, vineyards, and mountain drama.", 6100, 89, "Nov-Mar", 5, ["Adventure", "Nature", "Food"]],
  ["Istanbul", "Turkey", "Europe", "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&auto=format&fit=crop", "Markets, mosques, and a city straddling continents.", 5400, 87, "Apr-May, Sep-Nov", 5, ["History", "Food", "Shopping"]],
  ["Queenstown", "New Zealand", "Oceania", "https://images.unsplash.com/photo-1502780402662-acc01917e7f8?w=1200&auto=format&fit=crop", "Thrill sports, alpine lakes, and dramatic landscapes.", 9400, 85, "Dec-Feb, Jun-Aug", 4, ["Adventure", "Nature", "Scenic"]],
  ["Lisbon", "Portugal", "Europe", "https://images.unsplash.com/photo-1513735492246-483525079686?w=1200&auto=format&fit=crop", "Golden light, trams, tiled facades, and coastal day trips.", 6200, 86, "Mar-May, Sep-Oct", 4, ["Design", "Food", "Culture"]],
  ["Seoul", "South Korea", "Asia", "https://images.unsplash.com/photo-1538485399081-7c89751f62d4?w=1200&auto=format&fit=crop", "Style districts, palaces, and all-night food runs.", 7200, 90, "Apr-Jun, Sep-Nov", 5, ["Food", "Style", "Nightlife"]],
  ["Marrakech", "Morocco", "Africa", "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&auto=format&fit=crop", "Riads, souks, and vibrant courtyards.", 4900, 84, "Mar-May, Sep-Nov", 4, ["Markets", "Culture", "Color"]],
  ["Reykjavik", "Iceland", "Europe", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop", "Northern lights, geothermal lagoons, and wild terrain.", 12100, 83, "Jun-Aug, Sep-Mar", 5, ["Nature", "Adventure", "Wellness"]],
  ["Singapore", "Singapore", "Asia", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop", "Garden architecture, food halls, and seamless city flow.", 8900, 92, "Feb-Apr", 4, ["Food", "City", "Design"]],
  ["Banff", "Canada", "North America", "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&auto=format&fit=crop", "Turquoise lakes, mountain air, and postcard scenery.", 9700, 82, "Jun-Sep", 4, ["Nature", "Adventure", "Scenic"]],
  ["Sydney", "Australia", "Oceania", "https://images.unsplash.com/photo-1506973035872-a4f23ef4c2b7?w=1200&auto=format&fit=crop", "Harbour icons, coastal walks, and polished urban energy.", 11100, 91, "Sep-Nov, Mar-May", 5, ["Coastal", "City", "Lifestyle"]]
] as const

function makeActivities(destinationId: string, city: string) {
  return [
    {
      destinationId,
      name: `${city} Signature Walking Tour`,
      category: "Culture",
      image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&auto=format&fit=crop",
      description: `A guided introduction to ${city}'s most iconic neighborhoods and stories.`,
      duration: "3 hours",
      estimatedCost: 1800,
      rating: 4.7,
    },
    {
      destinationId,
      name: `${city} Sunset Experience`,
      category: "Experience",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop",
      description: `A premium golden-hour experience designed to showcase ${city} at its best.`,
      duration: "2 hours",
      estimatedCost: 2400,
      rating: 4.8,
    },
    {
      destinationId,
      name: `${city} Food Trail`,
      category: "Food",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop",
      description: `Sample standout local flavors through a curated ${city} tasting route.`,
      duration: "4 hours",
      estimatedCost: 3200,
      rating: 4.9,
    },
  ]
}

async function main() {
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.communityPost.deleteMany()
  await prisma.tripActivity.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.tripStop.deleteMany()
  await prisma.savedTrip.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash("GlobeTrotter123", 12)
  const userPassword = await bcrypt.hash("TravelReady123", 12)

  const [admin, yash, maya] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin Team",
        email: "admin@globetrotter.dev",
        username: "admin",
        passwordHash: adminPassword,
        city: "Bengaluru",
        country: "India",
        preferences: ["Culture", "Analytics"],
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Yash Raj",
        email: "yash@example.com",
        username: "yashraj",
        passwordHash: userPassword,
        city: "Mumbai",
        country: "India",
        preferences: ["Food", "Culture", "Adventure"],
      },
    }),
    prisma.user.create({
      data: {
        name: "Maya Singh",
        email: "maya@example.com",
        username: "mayaexplores",
        passwordHash: userPassword,
        city: "Delhi",
        country: "India",
        preferences: ["Luxury", "Design", "Wellness"],
      },
    }),
  ])

  const destinations = []
  for (const seed of destinationSeeds) {
    const [name, country, region, image, description, avgDailyCost, popularity, bestTimeToVisit, recommendedDays, tags] = seed
    const destination = await prisma.destination.create({
      data: {
        name,
        country,
        region,
        image,
        description,
        avgDailyCost,
        popularity,
        bestTimeToVisit,
        recommendedDays,
        tags: [...tags],
      },
    })

    destinations.push(destination)
  }

  for (const destination of destinations) {
    await prisma.activity.createMany({
      data: makeActivities(destination.id, destination.name),
    })
  }

  const paris = destinations.find((item) => item.name === "Paris")!
  const rome = destinations.find((item) => item.name === "Rome")!
  const tokyo = destinations.find((item) => item.name === "Tokyo")!

  const trip = await prisma.trip.create({
    data: {
      userId: yash.id,
      title: "Paris, Rome, and a little magic",
      status: "UPCOMING",
      coverImage: paris.image,
      startDate: new Date("2026-10-10T00:00:00.000Z"),
      endDate: new Date("2026-10-18T00:00:00.000Z"),
      totalBudget: 120000,
      currency: "INR",
      shareSlug: "paris-rome-magic-demo",
      isPublic: true,
      notes: "A food-forward anniversary itinerary with room for museums and slow evenings.",
    },
  })

  const [stop1, stop2] = await Promise.all([
    prisma.tripStop.create({
      data: {
        tripId: trip.id,
        destinationId: paris.id,
        order: 0,
        startDate: new Date("2026-10-10T00:00:00.000Z"),
        endDate: new Date("2026-10-13T00:00:00.000Z"),
        daysCount: 3,
        estimatedCost: 32000,
      },
    }),
    prisma.tripStop.create({
      data: {
        tripId: trip.id,
        destinationId: rome.id,
        order: 1,
        startDate: new Date("2026-10-14T00:00:00.000Z"),
        endDate: new Date("2026-10-18T00:00:00.000Z"),
        daysCount: 4,
        estimatedCost: 36000,
      },
    }),
  ])

  const parisActivities = await prisma.activity.findMany({
    where: { destinationId: paris.id },
    take: 2,
  })
  const romeActivities = await prisma.activity.findMany({
    where: { destinationId: rome.id },
    take: 2,
  })

  await prisma.tripActivity.createMany({
    data: [
      {
        tripStopId: stop1.id,
        activityId: parisActivities[0]?.id,
        title: parisActivities[0]?.name ?? "Paris walking tour",
        scheduledDate: new Date("2026-10-10T00:00:00.000Z"),
        scheduledTime: "10:00",
        duration: "3 hours",
        estimatedCost: 1800,
        category: parisActivities[0]?.category ?? "Culture",
      },
      {
        tripStopId: stop1.id,
        activityId: parisActivities[1]?.id,
        title: parisActivities[1]?.name ?? "Paris food trail",
        scheduledDate: new Date("2026-10-11T00:00:00.000Z"),
        scheduledTime: "18:30",
        duration: "4 hours",
        estimatedCost: 3200,
        category: parisActivities[1]?.category ?? "Food",
      },
      {
        tripStopId: stop2.id,
        activityId: romeActivities[0]?.id,
        title: romeActivities[0]?.name ?? "Rome culture tour",
        scheduledDate: new Date("2026-10-15T00:00:00.000Z"),
        scheduledTime: "11:30",
        duration: "3 hours",
        estimatedCost: 1900,
        category: romeActivities[0]?.category ?? "Culture",
      },
      {
        tripStopId: stop2.id,
        activityId: romeActivities[1]?.id,
        title: romeActivities[1]?.name ?? "Rome sunset experience",
        scheduledDate: new Date("2026-10-16T00:00:00.000Z"),
        scheduledTime: "19:00",
        duration: "2 hours",
        estimatedCost: 2400,
        category: romeActivities[1]?.category ?? "Experience",
      },
    ],
  })

  await prisma.expense.createMany({
    data: [
      {
        tripId: trip.id,
        tripStopId: stop1.id,
        category: "ACCOMMODATION",
        amount: 18000,
        description: "Boutique hotel in Paris",
      },
      {
        tripId: trip.id,
        tripStopId: stop2.id,
        category: "TRANSPORT",
        amount: 14500,
        description: "Flights and trains",
      },
      {
        tripId: trip.id,
        tripStopId: stop2.id,
        category: "FOOD",
        amount: 9000,
        description: "Dining reservations",
      },
    ],
  })

  const sharedTrip = await prisma.trip.create({
    data: {
      userId: maya.id,
      title: "Tokyo after dark",
      status: "COMPLETED",
      coverImage: tokyo.image,
      startDate: new Date("2026-06-15T00:00:00.000Z"),
      endDate: new Date("2026-06-20T00:00:00.000Z"),
      totalBudget: 95000,
      currency: "INR",
      shareSlug: "tokyo-after-dark-demo",
      isPublic: true,
      notes: "A sleek city itinerary built around food, design, and evening scenes.",
    },
  })

  await prisma.communityPost.createMany({
    data: [
      {
        userId: yash.id,
        tripId: trip.id,
        caption: "Drafted the perfect anniversary route. The route view is finally starting to feel real.",
        images: [paris.image, rome.image],
        location: "Paris -> Rome",
      },
      {
        userId: maya.id,
        tripId: sharedTrip.id,
        caption: "Tokyo nights, perfect ramen, and a city that never slows down.",
        images: [tokyo.image],
        location: "Tokyo",
      },
    ],
  })

  console.log("Seed complete. Sample users:")
  console.log("admin@globetrotter.dev / GlobeTrotter123")
  console.log("yash@example.com / TravelReady123")
  console.log("maya@example.com / TravelReady123")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
