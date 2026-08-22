import type { Request, Response } from "express"
import { z } from "zod"
import { login, register } from "../services/auth.service.js"

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  additionalInformation: z.string().optional(),
  avatar: z.string().url().optional(),
  preferences: z.array(z.string()).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function registerController(req: Request, res: Response) {
  const input = registerSchema.parse(req.body)

  const result = await register({
    name: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email,
    username: input.username,
    password: input.password,
    phone: input.phone,
    city: input.city,
    country: input.country,
    bio: input.additionalInformation,
    avatar: input.avatar,
    preferences: input.preferences,
  })

  res.status(201).json(result)
}

export async function loginController(req: Request, res: Response) {
  const input = loginSchema.parse(req.body)
  const result = await login(input)
  res.json(result)
}
