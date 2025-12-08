"use client"

import { useEffect, useRef } from "react"

interface GaugeChartProps {
  value: number
  max?: number
  label?: string
  color?: string
  size?: number
}

export function GaugeChart({ value, max = 100, label, color, size = 120 }: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    const primaryColor = computedStyle.getPropertyValue("--primary").trim() || "hsl(262, 92%, 56%)"
    const accentColor = computedStyle.getPropertyValue("--accent").trim() || "hsl(184, 100%, 43%)"
    const mutedColor = computedStyle.getPropertyValue("--muted").trim() || "hsl(240, 6%, 90%)"
    const foregroundColor = computedStyle.getPropertyValue("--foreground").trim() || "hsl(0, 0%, 15%)"
    const mutedForegroundColor = computedStyle.getPropertyValue("--muted-foreground").trim() || "hsl(0, 0%, 50%)"

    const gradientStartColor = color || primaryColor

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 8

    ctx.clearRect(0, 0, size, size)

    // Draw background arc
    ctx.strokeStyle = mutedColor
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.stroke()

    // Draw progress arc
    const percentage = Math.min(value / Math.max(max, 1), 1)
    const endAngle = Math.PI + percentage * Math.PI

    const gradient = ctx.createLinearGradient(0, 0, size, 0)
    gradient.addColorStop(0, gradientStartColor)
    gradient.addColorStop(1, accentColor)

    ctx.strokeStyle = gradient
    ctx.lineWidth = 8
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle, false)
    ctx.stroke()

    // Draw text
    ctx.fillStyle = foregroundColor
    ctx.font = `bold ${size / 3}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${Math.round(percentage * 100)}%`, centerX, centerY)

    if (label) {
      ctx.font = `12px sans-serif`
      ctx.fillStyle = mutedForegroundColor
      ctx.fillText(label, centerX, centerY + size / 6)
    }
  }, [value, max, label, color, size])

  return <canvas ref={canvasRef} width={size} height={size} className="mx-auto" />
}
