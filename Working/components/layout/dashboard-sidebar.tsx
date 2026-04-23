"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Heart,
  History,
  Settings,
  Search,
  PlusCircle,
  BarChart3,
  FileText,
  Users,
  Mail,
  Folders,
  Menu,
  ChevronRight,
  LogOut,
  ClipboardCheck,
  Flag,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/brand/logo"
import { UserRole } from "@/lib/types"
import { useCurrentUser } from "@/hooks/use-current-user"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string
}

interface DashboardSidebarProps {
  role: UserRole
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
}

const doneeNavItems: NavItem[] = [
  { href: "/dashboard/donee", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/browse", label: "Browse Campaigns", icon: <Search className="h-5 w-5" /> },
  { href: "/dashboard/donee/favourites", label: "Favourites", icon: <Heart className="h-5 w-5" /> },
  { href: "/dashboard/donee/donations", label: "Donation History", icon: <History className="h-5 w-5" /> },
]

const fundRaiserNavItems: NavItem[] = [
  { href: "/dashboard/fund-raiser", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/fund-raiser/campaigns/new", label: "Create Campaign", icon: <PlusCircle className="h-5 w-5" /> },
  { href: "/dashboard/fund-raiser/campaigns", label: "My Campaigns", icon: <FileText className="h-5 w-5" /> },
  { href: "/dashboard/fund-raiser/donors", label: "Donors", icon: <Users className="h-5 w-5" /> },
  { href: "/dashboard/fund-raiser/emails", label: "Emails", icon: <Mail className="h-5 w-5" /> },
  { href: "/dashboard/fund-raiser/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { href: "/dashboard/fund-raiser/history", label: "Completed History", icon: <History className="h-5 w-5" /> },
]

const adminNavItems: NavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/admin/users", label: "User Management", icon: <Users className="h-5 w-5" /> },
  { href: "/dashboard/admin/campaigns", label: "Campaign Review", icon: <ClipboardCheck className="h-5 w-5" /> },
  { href: "/dashboard/admin/reports-queue", label: "Reports Queue", icon: <Flag className="h-5 w-5" /> },
  { href: "/dashboard/admin/reports", label: "Export Reports", icon: <Download className="h-5 w-5" /> },
]

const platformNavItems: NavItem[] = [
  { href: "/dashboard/platform", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/platform/categories", label: "Categories", icon: <Folders className="h-5 w-5" /> },
  { href: "/dashboard/platform/reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
]

const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case "donee":
      return doneeNavItems
    case "fund_raiser":
      return fundRaiserNavItems
    case "user_admin":
      return adminNavItems
    case "platform_management":
      return platformNavItems
    default:
      return []
  }
}

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "donee":
      return "Donee"
    case "fund_raiser":
      return "Fund Raiser"
    case "user_admin":
      return "Admin"
    case "platform_management":
      return "Platform Manager"
    default:
      return "User"
  }
}

function isNavItemActive(pathname: string, href: string) {
  const exactOnlyRoutes = new Set([
    "/dashboard/donee",
    "/dashboard/fund-raiser",
    "/dashboard/platform",
    "/dashboard/admin",
  ])

  if (exactOnlyRoutes.has(href)) {
    return pathname === href
  }

  if (href === "/dashboard/fund-raiser/campaigns/new") {
    return pathname === href
  }

  if (href === "/dashboard/fund-raiser/campaigns") {
    return pathname === href || (
      pathname.startsWith(`${href}/`) &&
      !pathname.startsWith("/dashboard/fund-raiser/campaigns/new")
    )
  }

  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}

function SidebarContent({ role, user, pathname, onNavigate }: {
  role: UserRole
  user?: DashboardSidebarProps["user"]
  pathname: string
  onNavigate?: () => void
}) {
  const navItems = getNavItems(role)
  const roleLabel = getRoleLabel(role)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-6">
        <div className="contents" onClick={onNavigate}>
          <Logo />
        </div>
      </div>

      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{user?.name || "Demo User"}</p>
            <Badge variant="secondary" className="mt-0.5 text-xs">
              {roleLabel}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="space-y-1 p-4">
        <Link
          href="/settings/profile"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <Link
          href="/auth/sign-in"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </div>
  )
}

export function DashboardSidebar({ role, user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const storedUser = useCurrentUser({ displayName: user?.name ?? '', email: user?.email ?? '', avatar: user?.avatar })
  const resolvedUser = { name: storedUser.displayName, email: storedUser.email, avatar: storedUser.avatar, role: user?.role ?? '' }

  return (
    <>
      <aside className="hidden border-r border-border bg-card lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent role={role} user={resolvedUser} pathname={pathname} />
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card lg:hidden">
        <div className="flex h-16 items-center justify-end px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent
                role={role}
                user={resolvedUser}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="h-16 lg:hidden" />
    </>
  )
}

export function DashboardLayout({
  children,
  role,
  user,
}: {
  children: React.ReactNode
  role: UserRole
  user?: DashboardSidebarProps["user"]
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role={role} user={user} />
      <main className="lg:pl-64">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}