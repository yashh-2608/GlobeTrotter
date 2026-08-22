import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { jakartaSans, manrope } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "GlobeTrotter — Design Your Next Escape",
    template: "%s | GlobeTrotter",
  },
  description: "Design multi-city journeys, discover experiences, and keep every detail of your adventure in one place.",
  keywords: ["travel", "itinerary", "trip planning", "destinations", "travel planner"],
  authors: [{ name: "GlobeTrotter" }],
  openGraph: {
    title: "GlobeTrotter — Design Your Next Escape",
    description: "A premium travel planning platform for the modern explorer.",
    type: "website",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${manrope.variable} dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased font-sans">
        <SessionProvider session={session}>
          <TooltipProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  backdropFilter: "blur(20px)",
                },
                className: "glass-stronger",
              }}
            />
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
