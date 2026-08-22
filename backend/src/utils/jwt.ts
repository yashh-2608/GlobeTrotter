import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

interface TokenPayload {
  sub: string
  email: string
  role: string
}

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload
}
