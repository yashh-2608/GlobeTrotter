"use client"

import { useRef, useCallback } from "react"

interface TiltOptions {
  maxRotate?: number
  scale?: number
  perspective?: number
  speed?: number
}

export function use3DTilt({
  maxRotate = 6,
  scale = 1.03,
  perspective = 1000,
  speed = 300,
}: TiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -maxRotate
      const rotateY = ((x - centerX) / centerX) * maxRotate

      ref.current.style.transition = `transform ${speed * 0.2}ms ease-out`
      ref.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    },
    [maxRotate, scale, perspective, speed]
  )

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transition = `transform ${speed}ms ease-out`
    ref.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`
  }, [perspective, speed])

  return { ref, handleMouseMove, handleMouseLeave }
}
