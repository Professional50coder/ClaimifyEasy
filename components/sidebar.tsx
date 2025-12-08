"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  BarChart3,
  Lock,
  Upload,
  Calculator,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface SidebarProps {
  userName?: string
  userRole?: string
  onSignOut?: () => void
}

export function Sidebar({ userName, userRole, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const getNavItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: FileText, label: "Claims", href: "/claims" },
      { icon: Upload, label: "Documents", href: "/documents" },
      { icon: Calculator, label: "Coverage Calculator", href: "/coverage-calculator" },
      { icon: MessageSquare, label: "Messages", href: "/messages" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ]

    // Admin and staff roles get access to analytics, reports, and contracts
    if (userRole === "admin" || userRole === "insurer" || userRole === "hospital") {
      return [
        ...baseItems,
        { icon: BarChart3, label: "Analytics", href: "/analytics" },
        { icon: BarChart3, label: "Reports", href: "/reports" },
        { icon: Zap, label: "Smart Contracts", href: "/contracts" },
      ]
    }

    // Patients only see basic items
    return baseItems
  }

  const navItems = getNavItems()
  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-muted rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 md:translate-x-0 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              C
            </div>
            <span>ClaimifyEasy</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border pt-4 space-y-3">
            {userName && (
              <div className="px-4">
                <p className="text-xs text-muted-foreground">Logged in as</p>
                <p className="text-sm font-semibold truncate">{userName}</p>
                {userRole && (
                  <div className="flex items-center gap-1 mt-1">
                    {userRole === "patient" && <Lock size={12} className="text-amber-500" />}
                    <p className="text-xs text-accent capitalize">{userRole}</p>
                  </div>
                )}
              </div>
            )}
            {onSignOut && (
              <form action={onSignOut} className="w-full">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setIsOpen(false)}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </Button>
              </form>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
