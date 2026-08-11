'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { DestinationCard } from '@/components/destination-card'
import { MobileBottomNav } from '@/components/app-navigation'
import { TripIndicator } from '@/components/trip-indicator'
import { Button } from '@/components/ui/button'
import { categories, destinations, type Category } from '@/lib/destinations'
import { cn } from '@/lib/utils'

export function ExploreScreen() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('All')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return destinations.filter((destination) => {
      const matchesCategory = category === 'All' || destination.category === category || destination.categories?.includes(category as Exclude<Category, 'All'>)
      const matchesQuery = !normalized || [destination.name, destination.municipality, destination.category, destination.description, ...(destination.categories ?? [])].some((value) => value.toLowerCase().includes(normalized))
      return matchesCategory && matchesQuery
    })
  }, [category, query])

  const clearFilters = () => { setQuery(''); setCategory('All') }

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-5 pb-48 pt-8 md:px-8 md:pb-32 md:pt-12">
        <section className="flex flex-col gap-7" aria-labelledby="explore-title">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-secondary">Find your next Albay story</p>
            <h1 id="explore-title" className="font-sans text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">Explore Albay</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Discover attractions, food, culture, local businesses, and community experiences.</p>
          </div>
          <div className="relative max-w-3xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="destination-search" className="sr-only">Search places, food, or experiences</label>
            <input id="destination-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places, food, or experiences" className="h-14 w-full rounded-2xl border bg-card pl-12 pr-4 text-base shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0" aria-label="Destination categories">
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={cn('min-h-11 shrink-0 rounded-full border bg-card px-5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary', category === item && 'border-primary bg-primary text-primary-foreground hover:text-primary-foreground')}>{item}</button>)}
          </div>
        </section>

        <section className="mt-8" aria-label="Destinations">
          <div className="mb-5 flex items-center justify-between gap-4"><p className="font-sans text-lg font-bold">{filtered.length} {filtered.length === 1 ? 'place' : 'places'} to discover</p><span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><SlidersHorizontal className="size-4" aria-hidden="true" />Demo destination collection</span></div>
          {filtered.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((destination) => <DestinationCard key={destination.id} destination={destination} />)}</div> : <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-card px-6 text-center"><div className="flex size-14 items-center justify-center rounded-full bg-primary-container text-primary"><Search className="size-6" aria-hidden="true" /></div><div><h2 className="font-sans text-xl font-bold">No places found</h2><p className="mt-2 text-muted-foreground">Try another search or category.</p></div><Button type="button" variant="outline" onClick={clearFilters}>Clear Filters</Button></div>}
        </section>
      </main>
      <TripIndicator />
      <MobileBottomNav />
    </>
  )
}
