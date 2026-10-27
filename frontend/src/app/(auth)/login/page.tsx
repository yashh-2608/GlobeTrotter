"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Eye, EyeOff, Globe, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof LoginSchema>

const heroImages = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&auto=format&fit=crop",
]

const HERO_IMAGE = heroImages[0]

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedUrl = searchParams.get("callbackUrl")
  const callbackUrl = requestedUrl?.startsWith("/") && !requestedUrl.startsWith("//") ? requestedUrl : "/dashboard"
  const sessionExpired = searchParams.get("sessionExpired") === "1"
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (sessionExpired) toast.error("Your session expired. Sign in again to continue your trip.")
  }, [sessionExpired])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema as never) })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password. Please try again.")
      } else {
        toast.success("Welcome back! Preparing your journey...")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error("Unable to sign in right now. Please try again shortly.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Cinematic image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Travel destination"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050609]/60 to-[#050609]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050609]/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C8CFF] to-[#8BE7FF] flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">GlobeTrotter</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "var(--font-manrope)" }}>
              Your next story
              <br />
              <span className="gradient-text">starts here.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
              Design multi-city journeys, discover experiences, and keep every detail of your adventure in one place.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex items-center gap-8"
          >
            {[
              { value: "50K+", label: "Journeys" },
              { value: "120+", label: "Countries" },
              { value: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C8CFF] to-[#8BE7FF] flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">GlobeTrotter</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-manrope)" }}>
              Welcome back
            </h2>
            <p className="text-muted-foreground mt-2">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-foreground">Email address</label>
              <input
                {...register("email")}
                id="login-email"
                aria-invalid={Boolean(errors.email)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={cn(
                  "w-full h-11 px-4 rounded-xl glass border text-foreground placeholder-[#A7ACB8]/50 text-sm transition-all outline-none",
                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                  errors.email ? "border-destructive/50" : "border-border"
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</label>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  id="login-password"
                  aria-invalid={Boolean(errors.password)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    "w-full h-11 px-4 pr-12 rounded-xl glass border text-foreground placeholder-[#A7ACB8]/50 text-sm transition-all outline-none",
                    "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                    errors.password ? "border-destructive/50" : "border-border"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              New to GlobeTrotter?{" "}
              <Link href="/register" className="text-primary hover:text-[#8BE7FF] font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo hint */}
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><LoginFormContent /></Suspense>
}
