'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, Clock3, Heart, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTrip } from '@/components/trip-provider'
import type { Destination } from '@/lib/destinations'
import { cn } from '@/lib/utils'

export function DemoBadge() {
  return <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Demo information</span>
}

export function DestinationCard({ destination }: { destination: Destination }) {
  const { selectedIds, favoriteIds, hydrated, toggleTrip, toggleFavorite } = useTrip()
  const selected = hydrated && selectedIds.includes(destination.id)
  const favorite = hydrated && favoriteIds.includes(destination.id)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_8px_30px_rgba(31,41,51,0.06)] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Link href={`/place/${destination.id}`} aria-label={`View details for ${destination.name}`} className="absolute inset-0">
          <Image src={destination.image} alt={`${destination.name} in ${destination.municipality}`} fill loading={destination.id === 'cagsawa-ruins' ? 'eager' : 'lazy'} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <button type="button" onClick={() => toggleFavorite(destination.id)} className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-card/95 text-primary shadow-sm transition-transform hover:scale-105" aria-label={favorite ? `Remove ${destination.name} from favorites` : `Save ${destination.name} to favorites`} aria-pressed={favorite}>
          <Heart className={cn('size-5', favorite && 'fill-secondary text-secondary')} aria-hidden="true" />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">{destination.category}</span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><MapPin className="size-4 text-primary" aria-hidden="true" />{destination.municipality}</div>
          <h2 className="font-sans text-xl font-bold leading-tight text-card-foreground">{destination.name}</h2>
          <p className="line-clamp-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{destination.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock3 className="size-4" aria-hidden="true" />{destination.suggestedDurationMinutes < 60 ? `${destination.suggestedDurationMinutes} min` : `${destination.suggestedDurationMinutes / 60} hr${destination.suggestedDurationMinutes > 60 ? 's' : ''}`}</div>
          <DemoBadge />
        </div>
        <Button type="button" size="lg" variant={selected ? 'outline' : 'default'} onClick={() => toggleTrip(destination.id)} disabled={!hydrated} className="w-full rounded-xl">
          {selected ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}{selected ? 'Added' : 'Add to Trip'}
        </Button>
      </div>
    </article>
  )
}
