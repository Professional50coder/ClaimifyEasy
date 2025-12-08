"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface LazySectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function LazySection({ children, className = "", delay = 0 }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`${isVisible ? "animate-fade-in" : "opacity-0"} transition-opacity ${className}`}>
      {children}
    </div>
  )
}
