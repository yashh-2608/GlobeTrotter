"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Map, Users, Calendar, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

const mobileNavLinks = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/community", label: "Community", icon: Users },
  { href: "/calendar", label: "Calendar", icon: Calendar },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-4 left-4 right-4 md:hidden z-50">
      <div className="glass-stronger rounded-2xl px-2 py-2">
        <div className="flex items-center justify-around">
          {mobileNavLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform", active && "scale-110")} />
                <span className="text-[10px] font-medium">{label}</span>
                {active && (
                  <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#7C8CFF]" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
