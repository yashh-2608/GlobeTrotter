"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Globe, Eye, EyeOff, ArrowRight, Loader2, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3).regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(RegisterSchema as never) })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const [firstName, ...rest] = data.name.trim().split(/\s+/)
      const lastName = rest.join(" ").trim()

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: lastName || firstName,
          username: data.username,
          email: data.email,
          password: data.password,
          city: data.city,
          country: data.country,
          phone: data.phone,
          additionalInformation: undefined,
        }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        if (res.status >= 500 || !json) {
          toast.error("GlobeTrotter could not reach the account service. Start the backend and try again.")
          return
        }

        toast.error(json?.error ?? "Registration failed. Please try again.")
        return
      }

      document.cookie = "globetrotter_demo_session=; Path=/; Max-Age=0; SameSite=Lax"
      toast.success("Account created! Signing you in...")
      router.push("/login")
    } catch {
      toast.error("Unable to reach the account service. Start the backend and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full h-11 px-4 rounded-xl glass border text-foreground placeholder-[#A7ACB8]/50 text-sm transition-all outline-none",
      "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
      hasError ? "border-destructive/50" : "border-border"
    )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#7C8CFF]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#8BE7FF]/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C8CFF] to-[#8BE7FF] flex items-center justify-center shadow-lg shadow-[#7C8CFF]/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">GlobeTrotter</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "var(--font-manrope)" }}>
            Build your travel identity.
          </h1>
          <p className="text-muted-foreground mt-2">Create your account and start planning unforgettable journeys</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          {/* Avatar placeholder */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C8CFF]/20 to-[#8BE7FF]/20 border-2 border-[#7C8CFF]/30 flex items-center justify-center shadow-lg shadow-[#7C8CFF]/10">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Row 1: Name + Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input {...register("name")} placeholder="Yash Raj" className={inputClass(!!errors.name)} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Username</label>
                <input {...register("username")} placeholder="yashraj_explorer" className={inputClass(!!errors.username)} />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={inputClass(!!errors.email)} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Row 2: Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={cn(inputClass(!!errors.password), "pr-12")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <input {...register("confirmPassword")} type="password" placeholder="••••••••" className={inputClass(!!errors.confirmPassword)} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Row 3: City + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Home City <span className="text-muted-foreground">(optional)</span></label>
                <input {...register("city")} placeholder="Mumbai" className={inputClass(false)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Country <span className="text-muted-foreground">(optional)</span></label>
                <input {...register("country")} placeholder="India" className={inputClass(false)} />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Phone Number <span className="text-muted-foreground">(optional)</span></label>
              <input {...register("phone")} type="tel" placeholder="+91 98765 43210" className={inputClass(false)} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating your account...</>
              ) : (
                <>Begin Your Journey <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-[#8BE7FF] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
