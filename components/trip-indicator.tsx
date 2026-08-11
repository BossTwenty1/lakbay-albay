'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Map } from 'lucide-react'
import { useTrip } from '@/components/trip-provider'
import { destinations } from '@/lib/destinations'

export function TripIndicator() {
  const { selectedIds, hydrated } = useTrip()
  if (!hydrated || selectedIds.length === 0) return null
  const selected = destinations.filter((destination) => selectedIds.includes(destination.id))

  return (
    <aside className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border bg-primary-container p-3 shadow-xl md:bottom-6 md:px-4" aria-label="Trip summary">
      <div className="hidden items-center -space-x-2 sm:flex">
        {selected.slice(0, 3).map((destination) => <Image key={destination.id} src={destination.image} alt="" width={40} height={40} className="size-10 rounded-full border-2 border-primary-container object-cover" />)}
      </div>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:hidden"><Map className="size-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><p className="truncate font-sans font-bold text-primary">{selectedIds.length} {selectedIds.length === 1 ? 'place' : 'places'} in My Trip</p><p className="text-xs text-muted-foreground">Ready to explore</p></div>
      <Link href="/trip" className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">View Trip<ArrowRight className="size-4" aria-hidden="true" /></Link>
    </aside>
  )
}
