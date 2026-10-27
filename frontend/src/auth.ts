import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import { z } from "zod"
import { backendJson } from "@/lib/backend-api"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    username: string
    image?: string | null
    role: string
  }
}

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "production" ? undefined : "globetrotter-development-secret")

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const credentials = credentialsSchema.safeParse(rawCredentials)

        if (!credentials.success) {
          return null
        }

        const result = await backendJson<LoginResponse>("/auth/login", {
          method: "POST",
          body: credentials.data,
        }).catch(() => null)

        if (!result) {
          return null
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          username: result.user.username,
          role: result.user.role,
          image: result.user.image ?? null,
          accessToken: result.token,
        }
      },
    }),
  ],
  callbacks: {
    async authorized({ auth: session, request }) {
      const isProtectedRoute = [
        "/dashboard",
        "/trips",
        "/destinations",
        "/activities",
        "/community",
        "/calendar",
        "/profile",
        "/admin",
      ].some((route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`))

      if (!isProtectedRoute) {
        return true
      }

      return Boolean(session?.user)
    },
    async jwt({ token, user }) {
      const customToken = token as JWT & {
        id?: string
        username?: string
        role?: string
        accessToken?: string
      }

      if (user) {
        customToken.id = user.id
        customToken.username = user.username
        customToken.role = user.role
        customToken.accessToken = user.accessToken
      }

      return customToken
    },
    async session({ session, token }) {
      const customToken = token as JWT & {
        id?: string
        username?: string
        role?: string
        accessToken?: string
      }

      if (session.user) {
        session.user.id = customToken.id ?? ""
        session.user.username = customToken.username
        session.user.role = customToken.role
        session.accessToken = customToken.accessToken
      }

      return session
    },
  },
})
