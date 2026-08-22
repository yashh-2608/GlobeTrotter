import { prisma } from "../config/prisma.js"
import { ApiError } from "../utils/api-error.js"

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      city: true,
      country: true,
      phone: true,
      bio: true,
      preferences: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          trips: true,
          posts: true,
          savedTrips: true,
        },
      },
    },
  })

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  return user
}

interface UpdateProfileInput {
  name?: string
  avatar?: string
  city?: string
  country?: string
  phone?: string
  bio?: string
  preferences?: string[]
}

export async function updateCurrentUser(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      avatar: input.avatar,
      city: input.city,
      country: input.country,
      phone: input.phone,
      bio: input.bio,
      preferences: input.preferences,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      city: true,
      country: true,
      phone: true,
      bio: true,
      preferences: true,
      role: true,
    },
  })
}
