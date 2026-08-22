import { MobileNav } from "@/components/navigation/mobile-nav"
import { Navbar } from "@/components/navigation/navbar"
import { auth } from "@/auth"

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background">
      <Navbar serverSession={session} />
      <main className="pb-24 md:pb-12">{children}</main>
      <MobileNav />
    </div>
  )
}
