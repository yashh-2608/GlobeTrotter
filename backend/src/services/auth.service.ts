import bcrypt from "bcryptjs"
import type { UserRole } from "../../generated/prisma/client"
import { prisma } from "../config/prisma.js"
import { ApiError } from "../utils/api-error.js"
import { signAccessToken } from "../utils/jwt.js"

interface RegisterInput {
  name: string
  email: string
  password: string
  username: string
  phone?: string
  city?: string
  country?: string
  bio?: string
  avatar?: string
  preferences?: string[]
}

interface LoginInput {
  email: string
  password: string
}

function serializeUser(user: {
  id: string
  email: string
  name: string
  username: string
  avatar: string | null
  role: UserRole
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    image: user.avatar,
    role: user.role,
  }
}

export async function register(input: RegisterInput) {
  const email = input.email.trim().toLowerCase()
  const username = input.username.trim().toLowerCase()

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: {
      email: true,
      username: true,
    },
  })

  if (existing?.email === email) {
    throw new ApiError(409, "An account with this email already exists")
  }

  if (existing?.username === username) {
    throw new ApiError(409, "That username is already taken")
  }

  const passwordHash = await bcrypt.hash(input.password, 12)

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      username,
      passwordHash,
      phone: input.phone,
      city: input.city,
      country: input.country,
      bio: input.bio,
      avatar: input.avatar,
      preferences: input.preferences ?? [],
    },
  })

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    token,
    user: serializeUser(user),
  }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email.trim().toLowerCase(),
    },
  })

  if (!user) {
    throw new ApiError(401, "Invalid email or password")
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password")
  }

  const token = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  })

  return {
    token,
    user: serializeUser(user),
  }
}
