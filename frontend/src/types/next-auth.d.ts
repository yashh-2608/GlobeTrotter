import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: DefaultSession["user"] & {
      id: string
      username?: string
      role?: string
    }
  }

  interface User {
    id: string
    username?: string
    role?: string
    image?: string | null
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
    role?: string
    accessToken?: string
  }
}
