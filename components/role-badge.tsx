"use client"

import { Badge } from "@/components/ui/badge"
import type { Role } from "@/lib/types"

export function RoleBadge({ role }: { role: Role }) {
  const color =
    role === "admin"
      ? "bg-primary text-primary-foreground"
      : role === "insurer"
        ? "bg-green-600 text-white"
        : role === "hospital"
          ? "bg-blue-600 text-white"
          : "bg-amber-600 text-white"
  return <Badge className={color}>{role}</Badge>
}
