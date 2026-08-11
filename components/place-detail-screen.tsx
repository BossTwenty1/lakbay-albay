'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { ArrowLeft, Check, Clock3, Coins, Heart, MapPin, Navigation, Plus, Share2, Sparkles, Users, X } from 'lucide-react'
import { Header, MobileBottomNav } from '@/components/app-navigation'
import { DemoBadge } from '@/components/destination-card'
import { useTrip } from '@/components/trip-provider'
import { Button } from '@/components/ui/button'
import { destinations, type Destination } from '@/lib/destinations'
import { cn } from '@/lib/utils'

function MapDialog({ destination }: { destination: Destination }) {
  const ref = useRef<HTMLDialogElement>(null)
  return <>
    <Button type="button" variant="outline" onClick={() => ref.current?.showModal()}><Navigation data-icon="inline-start" />View on Map</Button>
    <dialog ref={ref} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-foreground/40">
      <div className="flex items-center justify-between border-b p-4"><div><h2 className="font-heading text-xl font-bold">Demo map location</h2><p className="text-sm text-muted-foreground">Prototype coordinates only</p></div><button type="button" onClick={() => ref.current?.close()} className="flex size-11 items-center justify-center rounded-full hover:bg-muted" aria-label="Close map"><X aria-hidden="true" /></button></div>
      <div className="p-4"><div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-primary-container"><div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,var(--primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--primary)_1px,transparent_1px)] [background-size:32px_32px]" /><span className="relative flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"><MapPin className="size-8" aria-hidden="true" /></span></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{destination.name}: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}. Verify directions before travel.</p></div>
    </dialog>
  </>
}

export function PlaceDetailScreen({ destination }: { destination: Destination }) {
  const { selectedIds, favoriteIds, hydrated, toggleTrip, toggleFavorite } = useTrip()
  const selected = hydrated && selectedIds.includes(destination.id)
  const favorite = hydrated && favoriteIds.includes(destination.id)
  const nearby = destinations.filter((item) => item.id !== destination.id).sort((a, b) => Number(b.municipality === destination.municipality) - Number(a.municipality === destination.municipality)).slice(0, 3)
  const duration = destination.suggestedDurationMinutes < 60 ? `${destination.suggestedDurationMinutes} min` : `${destination.suggestedDurationMinutes / 60} hr${destination.suggestedDurationMinutes > 60 ? 's' : ''}`

  return <div className="min-h-dvh bg-background"><Header /><main className="mx-auto max-w-7xl px-4 pb-40 pt-5 min-[360px]:px-5 md:px-8 md:pb-16 md:pt-8">
    <Link href="/" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary"><ArrowLeft className="size-4" aria-hidden="true" />Back to Explore</Link>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,.6fr)]">
      <div className="min-w-0"><div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted sm:aspect-[16/9]"><Image src={destination.image} alt={`${destination.name} in ${destination.municipality}`} fill loading="eager" sizes="(min-width:1024px) 65vw,100vw" className="object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-5 pt-20 text-primary-foreground"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary px-3 py-1 text-xs font-bold">{destination.category}</span>{destination.categories?.filter((item) => item !== destination.category).map((item) => <span key={item} className="rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-primary">{item}</span>)}</div></div></div>
        <section className="mt-6"><div className="flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between"><div><p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"><MapPin className="size-4 text-primary" />{destination.municipality}, Albay</p><h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{destination.name}</h1></div><div className="flex gap-2"><button type="button" onClick={() => toggleFavorite(destination.id)} aria-label={favorite ? 'Remove from favorites' : 'Save to favorites'} aria-pressed={favorite} className="flex size-11 items-center justify-center rounded-full border bg-card"><Heart className={cn('size-5 text-primary', favorite && 'fill-secondary text-secondary')} /></button><button type="button" onClick={() => navigator.share?.({ title: destination.name, text: destination.description, url: window.location.href })} aria-label="Share place" className="flex size-11 items-center justify-center rounded-full border bg-card"><Share2 className="size-5" /></button></div></div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"><Fact icon={Clock3} label="Duration" value={duration} /><Fact icon={Coins} label="Budget" value={destination.estimatedCost} /><Fact icon={Sparkles} label="Interests" value={destination.interests[0]} /><Fact icon={Users} label="Access" value="Demo details" /></div>
          <div className="mt-7 flex flex-col gap-7"><Info title="About this place"><p>{destination.description} Discover a meaningful Albay experience shaped by landscape, local knowledge, and the character of its community.</p></Info><Info title="Why visit"><p>Come for {destination.interests.join(' and ').toLowerCase()}, then take time to connect with nearby makers, guides, and independent businesses.</p></Info><Info title="Visit information"><div className="grid gap-3 sm:grid-cols-2"><InfoRow label="Opening hours" value={`${destination.openingTime} – ${destination.closingTime}`} /><InfoRow label="Estimated cost" value={destination.estimatedCost} /><InfoRow label="Accessibility" value={destination.accessibility} /><InfoRow label="Community connection" value="Ask locally about guides and small businesses." /></div><p className="mt-3 italic text-muted-foreground">Demo information — verify before travel.</p></Info></div>
        </section>
        <section className="mt-10"><h2 className="font-heading text-2xl font-bold">Nearby experiences</h2><div className="mt-4 grid gap-4 sm:grid-cols-3">{nearby.map((item) => <Link key={item.id} href={`/place/${item.id}`} className="overflow-hidden rounded-2xl border bg-card"><div className="relative aspect-[3/2]"><Image src={item.image} alt="" fill sizes="(min-width:640px) 30vw,100vw" className="object-cover" /></div><div className="p-3"><p className="truncate font-bold">{item.name}</p><p className="text-sm text-muted-foreground">{item.municipality}</p></div></Link>)}</div></section>
      </div>
      <aside className="hidden lg:block"><div className="sticky top-28 rounded-3xl border bg-card p-6 shadow-sm"><DemoBadge /><h2 className="mt-4 font-heading text-2xl font-bold">Add this Albay story</h2><p className="mt-2 leading-relaxed text-muted-foreground">Keep your selected places together and arrange them later in My Trip.</p><div className="mt-6 flex flex-col gap-3"><Button size="lg" onClick={() => toggleTrip(destination.id)} disabled={!hydrated}>{selected ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}{selected ? 'Added to My Trip' : 'Add to My Trip'}</Button><MapDialog destination={destination} /></div></div></aside>
    </div>
  </main><div className="fixed inset-x-0 bottom-[65px] z-30 border-t bg-background/95 p-3 backdrop-blur md:bottom-0 lg:hidden"><div className="mx-auto flex max-w-xl gap-2"><Button className="min-w-0 flex-1" onClick={() => toggleTrip(destination.id)} disabled={!hydrated}>{selected ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}{selected ? 'Added' : 'Add to Trip'}</Button><MapDialog destination={destination} /></div></div><MobileBottomNav /></div>
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) { return <div className="min-w-0 rounded-2xl bg-muted p-3"><Icon className="size-5 text-primary" /><p className="mt-2 text-xs text-muted-foreground">{label}</p><p className="mt-0.5 truncate text-sm font-bold">{value}</p></div> }
function Info({ title, children }: { title: string; children: React.ReactNode }) { return <div><h2 className="font-heading text-xl font-bold">{title}</h2><div className="mt-2 leading-relaxed text-muted-foreground">{children}</div></div> }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-muted p-4"><p className="text-sm font-bold text-foreground">{label}</p><p className="mt-1 text-sm leading-relaxed">{value}</p></div> }
