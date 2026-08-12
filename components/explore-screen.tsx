'use client'

import { useMemo, useState } from 'react'
import { Check, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { DestinationCard } from '@/components/destination-card'
import { MobileBottomNav } from '@/components/app-navigation'
import { TripIndicator } from '@/components/trip-indicator'
import { Button } from '@/components/ui/button'
import { categories, destinations, type Category } from '@/lib/destinations'
import { cn } from '@/lib/utils'

const municipalities = ['All', 'Legazpi', 'Daraga', 'Camalig'] as const
type Municipality = (typeof municipalities)[number]

function normalizeMunicipality(value: string) {
  return value.trim().toLowerCase()
}

export function ExploreScreen() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [municipality, setMunicipality] = useState<Municipality>('All')

  const scopedDestinations = useMemo(() => destinations.filter((destination) => municipalities.slice(1).some((area) => normalizeMunicipality(area) === normalizeMunicipality(destination.municipality))), [])

  const municipalityCounts = useMemo(() => Object.fromEntries(municipalities.map((area) => [area, area === 'All' ? scopedDestinations.length : scopedDestinations.filter((destination) => normalizeMunicipality(destination.municipality) === normalizeMunicipality(area)).length])) as Record<Municipality, number>, [scopedDestinations])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return scopedDestinations.filter((destination) => {
      const matchesMunicipality = municipality === 'All' || normalizeMunicipality(destination.municipality) === normalizeMunicipality(municipality)
      const matchesCategory = category === 'All' || destination.category === category || destination.categories?.includes(category as Exclude<Category, 'All'>)
      const matchesQuery = !normalized || [destination.name, destination.municipality, destination.category, destination.description, ...(destination.categories ?? [])].some((value) => value.toLowerCase().includes(normalized))
      return matchesMunicipality && matchesCategory && matchesQuery
    })
  }, [category, municipality, query, scopedDestinations])

  const clearFilters = () => { setQuery(''); setCategory('All'); setMunicipality('All') }
  const resultLabel = `${filtered.length} ${category === 'All' ? (filtered.length === 1 ? 'place' : 'places') : `${category} ${filtered.length === 1 ? 'place' : 'places'}`} ${municipality === 'All' ? 'across Legazpi, Daraga, and Camalig' : `in ${municipality}`}`

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
          <div className="space-y-5">
            <div role="group" aria-labelledby="area-filter-label">
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><div><h2 id="area-filter-label" className="font-heading text-base font-bold">Explore by Area</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Choose an area or browse destinations across all three municipalities.</p></div></div>
              <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:px-0">
                {municipalities.map((item) => <button key={item} type="button" onClick={() => setMunicipality(item)} aria-pressed={municipality === item} aria-label={`${item}, ${municipalityCounts[item]} ${municipalityCounts[item] === 1 ? 'destination' : 'destinations'}`} className={cn('flex min-h-11 shrink-0 items-center gap-2 rounded-full border bg-card px-4 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary', municipality === item && 'border-primary bg-primary-container text-primary')}><span className={cn('flex size-4 items-center justify-center rounded-full border border-muted-foreground', municipality === item && 'border-primary bg-primary text-primary-foreground')} aria-hidden="true">{municipality === item && <Check className="size-3" />}</span><span>{item}</span><span className={cn('rounded-full bg-muted px-2 py-0.5 text-xs', municipality === item && 'bg-card/70 text-primary')}>{municipalityCounts[item]}</span></button>)}
              </div>
            </div>
            <div role="group" aria-labelledby="category-filter-label">
              <h2 id="category-filter-label" className="font-heading text-base font-bold">Category</h2>
              <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:px-0">
                {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={cn('min-h-11 shrink-0 rounded-full border bg-card px-5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary', category === item && 'border-primary bg-primary text-primary-foreground hover:text-primary-foreground')}>{item}</button>)}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8" aria-label="Destinations">
          <div className="mb-5 flex items-center justify-between gap-4"><p className="font-sans text-lg font-bold" aria-live="polite">{resultLabel}</p><span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><SlidersHorizontal className="size-4" aria-hidden="true" />Demo destination collection</span></div>
          {filtered.length > 0 ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((destination) => <DestinationCard key={destination.id} destination={destination} />)}</div> : <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-card px-6 text-center"><div className="flex size-14 items-center justify-center rounded-full bg-primary-container text-primary"><Search className="size-6" aria-hidden="true" /></div><div><h2 className="font-sans text-xl font-bold">No places found</h2><p className="mt-2 text-muted-foreground">Try another area, category, or search term.</p></div><Button type="button" variant="outline" onClick={clearFilters}>Clear Filters</Button></div>}
        </section>
      </main>
      <TripIndicator />
      <MobileBottomNav />
    </>
  )
}
