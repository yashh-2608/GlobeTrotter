"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

const fallback = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop"

export function SafeImage({ src, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState<string | null>(null)
  const value = typeof src === "string" ? src : ""
  let valid = false
  try { const url = new URL(value); valid = url.protocol === "https:" || url.protocol === "http:" } catch { valid = value.startsWith("/") && !value.startsWith("//") }
  const resolved = valid && failed !== value ? src : fallback
  return <Image {...props} src={resolved} alt={alt} unoptimized onError={() => setFailed(value)} />
}
