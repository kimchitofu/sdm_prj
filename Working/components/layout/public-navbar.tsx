'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Info,
  AlertTriangle,
  Wrench,
  Siren,
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { categories } from '@/lib/mock-data'
import { useAuth } from '@/components/providers/session-provider'

const navItems = [
  { href: '/browse', label: 'Browse Campaigns' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#about', label: 'About' },
]

function getDashboardHref(role: string) {
  switch (role) {
    case 'admin': return '/dashboard/admin'
    case 'campaign_admin': return '/dashboard/admin/campaign-dashboard'
    case 'fund_raiser': return '/dashboard/fund-raiser'
    case 'platform_manager': return '/dashboard/platform'
    default: return '/dashboard/donee'
  }
}

interface ActiveAnnouncement {
  id: string
  title: string
  message: string
  type: string
}

const bannerStyle: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  info:        { bg: 'bg-blue-600',   text: 'text-white', icon: <Info className="h-4 w-4 shrink-0" /> },
  warning:     { bg: 'bg-yellow-500', text: 'text-white', icon: <AlertTriangle className="h-4 w-4 shrink-0" /> },
  maintenance: { bg: 'bg-orange-500', text: 'text-white', icon: <Wrench className="h-4 w-4 shrink-0" /> },
  urgent:      { bg: 'bg-red-600',    text: 'text-white', icon: <Siren className="h-4 w-4 shrink-0" /> },
}

export function PublicNavbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user: sessionUser } = useAuth()
  const [announcements, setAnnouncements] = useState<ActiveAnnouncement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.json())
      .then(d => setAnnouncements(d.announcements ?? []))
      .catch(() => {})
  }, [])

  const visible = announcements.filter(a => !dismissed.has(a.id))

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('currentUser')
    window.location.href = '/auth/sign-in'
  }

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Announcement Banners */}
      {visible.map(a => {
        const style = bannerStyle[a.type] ?? bannerStyle.info
        return (
          <div key={a.id} className={`flex items-center justify-between gap-3 px-4 py-2 text-sm ${style.bg} ${style.text}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {style.icon}
              <span className="font-semibold shrink-0">{a.title}:</span>
              <span className="truncate">{a.message}</span>
            </div>
            <button
              onClick={() => setDismissed(prev => new Set([...prev, a.id]))}
              className="shrink-0 rounded p-0.5 hover:bg-white/20"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex" viewport={false}>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
                        pathname === item.href && 'bg-accent/50'
                      )}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem className="relative">
                <NavigationMenuTrigger className="bg-transparent">Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {categories.slice(0, 8).map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/browse?category=${encodeURIComponent(category.name)}`}
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-semibold text-foreground">{category.name}</div>
                          <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {category.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {sessionUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sessionUser.avatar} />
                    <AvatarFallback>
                      {sessionUser.firstName?.[0]}{sessionUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {sessionUser.firstName} {sessionUser.lastName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={getDashboardHref(sessionUser.role)}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-4 py-4">
              <Logo />
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                      pathname === item.href && 'bg-accent'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="py-2">
                  <p className="px-3 py-2 text-sm font-medium text-muted-foreground">Categories</p>
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={`/browse?category=${encodeURIComponent(category.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mt-auto flex flex-col gap-2 border-t pt-4">
                {sessionUser ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link href={getDashboardHref(sessionUser.role)} onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
    </div>
  )
}
