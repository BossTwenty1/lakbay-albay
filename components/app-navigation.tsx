'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Compass, Home, Map, MapPin, UserRound } from 'lucide-react'
import { useTrip } from '@/components/trip-provider'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '#', icon: Home },
  { label: 'Explore', href: '/', icon: Compass },
  { label: 'My Trip', href: '/trip', icon: Map },
  { label: 'Saved', href: '#saved', icon: Bookmark },
  { label: 'Profile', href: '#profile', icon: UserRound },
]

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Lakbay Albay home">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><MapPin className="size-5" aria-hidden="true" /></span>
      <span className="font-sans text-xl font-bold tracking-tight text-primary">Lakbay Albay</span>
    </Link>
  )
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/place/')
  if (href === '/trip') return pathname === '/trip' || pathname === '/preferences'
  return false
}

export function Header() {
  const pathname = usePathname()
  const { selectedIds, hydrated } = useTrip()
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={cn('relative rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', isActive(pathname, item.href) && 'bg-primary-container text-primary')}>
              {item.label}{item.label === 'My Trip' && hydrated && selectedIds.length > 0 && <span className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{selectedIds.length}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { selectedIds, hydrated } = useTrip()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden" aria-label="Mobile navigation">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return <Link key={item.label} href={item.href} className={cn('relative flex min-w-12 flex-col items-center gap-1 rounded-lg py-1 text-[11px] text-muted-foreground min-[360px]:min-w-14 min-[360px]:text-xs', isActive(pathname, item.href) && 'text-primary')}><Icon className="size-5" strokeWidth={isActive(pathname, item.href) ? 2.5 : 2} aria-hidden="true" /><span>{item.label}</span>{item.label === 'My Trip' && hydrated && selectedIds.length > 0 && <span className="absolute right-1 top-0 flex size-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">{selectedIds.length}</span>}</Link>
        })}
      </div>
    </nav>
  )
}
