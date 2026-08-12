'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Flag,
  Info,
  Lock,
  Map,
  MapPin,
  Route,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  Utensils,
} from 'lucide-react'
import { MobileBottomNav } from '@/components/app-navigation'
import { useTrip } from '@/components/trip-provider'
import { Button } from '@/components/ui/button'
import {
  generateItinerary,
  minutesToTimeLabel,
  type GeneratedItinerary,
  type ItineraryConflict,
  type ItineraryDay,
  type ItineraryStop,
} from '@/lib/itinerary-planner'
import { durationLabel, formatDate, getTravelDayCount } from '@/lib/trip-preferences'
import { cn } from '@/lib/utils'

export function ItineraryScreen() {
  const { selectedIds, mustVisitIds, preferences, hydrated } = useTrip()
  const itinerary = useMemo(
    () => generateItinerary({ selectedIds, mustVisitIds, preferences }),
    [mustVisitIds, preferences, selectedIds],
  )
  const travelDays = getTravelDayCount(preferences.travelStartDate, preferences.travelEndDate)
  const preferencesComplete = Boolean(
    travelDays > 0
    && preferences.startingPoint.trim()
    && preferences.transportationMode
    && preferences.travelPace
    && preferences.budgetLevel,
  )

  if (!hydrated) {
    return <><main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-8 md:px-8"><div className="h-96 animate-pulse rounded-3xl bg-muted" /></main><MobileBottomNav /></>
  }

  if (selectedIds.length === 0 || !preferencesComplete) {
    return <PlanningRequired hasPlaces={selectedIds.length > 0} />
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-7 min-[390px]:px-5 md:px-8 md:pb-16 md:pt-10">
        <header className="flex flex-col gap-5 border-b pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-secondary">Smart itinerary generator</p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">My Albay Adventure</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">A deterministic plan built from your selected places and current trip preferences.</p>
          </div>
          <div className="flex flex-col gap-2 min-[390px]:flex-row">
            <Button nativeButton={false} render={<Link href="/preferences" />} size="lg" variant="outline" className="min-h-11 rounded-xl"><SlidersHorizontal data-icon="inline-start" />Adjust Preferences</Button>
            <Button nativeButton={false} render={<Link href="/trip" />} size="lg" className="min-h-11 rounded-xl"><Map data-icon="inline-start" />Review My Trip</Button>
          </div>
        </header>

        <TripFacts itinerary={itinerary} dates={`${formatDate(preferences.travelStartDate)} - ${formatDate(preferences.travelEndDate)}`} />

        <div className="mt-5 flex gap-3 rounded-2xl border border-accent bg-card px-4 py-3 text-sm leading-relaxed"><Info className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" /><p><strong>Demo estimates only.</strong> Confirm operating details, accessibility, and actual travel conditions before visiting.</p></div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-6">
            <section aria-labelledby="daily-plan-title">
              <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary"><CalendarDays className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-[.12em] text-secondary">Daily plan</p><h2 id="daily-plan-title" className="font-heading text-2xl font-bold">Your itinerary</h2></div></div>
              <div className="mt-5 space-y-5">{itinerary.days.map((day) => <DayTimeline key={day.dayNumber} day={day} startingPoint={itinerary.startingPoint.routeLabel} />)}</div>
            </section>

            {itinerary.unscheduled.length > 0 && <UnscheduledSection itinerary={itinerary} />}

            <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="organization-title">
              <div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary"><Compass className="size-5" aria-hidden="true" /></span><div><h2 id="organization-title" className="font-heading text-xl font-bold">How this itinerary was organized</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Lakbay Albay grouped nearby places, considered your available days, travel pace, suggested visit durations, operating hours, accessibility preferences, and Must Visit choices.</p></div></div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <RouteOverview itinerary={itinerary} />
            <PlanningSummary itinerary={itinerary} />
            <ConflictPanel conflicts={itinerary.conflicts} />
          </aside>
        </div>
      </main>
      <MobileBottomNav />
    </>
  )
}

function TripFacts({ itinerary, dates }: { itinerary: GeneratedItinerary; dates: string }) {
  const facts = [
    ['Dates', dates],
    ['Starting Point', itinerary.startingPoint.requestedLabel],
    ['Transportation', itinerary.assumptions.transportationMode],
    ['Travel Pace', itinerary.assumptions.travelPace],
    ['Selected Places', String(itinerary.selectedDestinationCount)],
    ['Must Visit', String(itinerary.mustVisitCount)],
  ]
  return <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3 xl:grid-cols-6">{facts.map(([label, value]) => <div key={label} className="min-w-0 bg-card p-3 sm:p-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-bold">{value}</dd></div>)}</dl>
}

function DayTimeline({ day, startingPoint }: { day: ItineraryDay; startingPoint: string }) {
  return (
    <article className="overflow-hidden rounded-3xl border bg-card shadow-sm" aria-labelledby={`day-${day.dayNumber}-title`}>
      <div className="border-b bg-primary-container/60 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.12em] text-secondary">{formatDate(day.date)}</p><h3 id={`day-${day.dayNumber}-title`} className="mt-1 font-heading text-2xl font-bold">Day {day.dayNumber} · {day.areaLabel}</h3></div>
          <span className="w-fit rounded-full bg-card px-3 py-1.5 text-xs font-bold text-primary">{day.selectedStopCount} selected · {day.suggestedStopCount} suggested</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><DayMetric label="Activity" value={durationLabel(day.activityMinutes)} /><DayMetric label="Travel" value={durationLabel(day.travelMinutes)} /><DayMetric label="Starts" value={minutesToTimeLabel(day.startMinutes)} /><DayMetric label="Wrap-up" value={minutesToTimeLabel(day.endMinutes)} /></div>
      </div>

      <div className="p-5 sm:p-6">
        <TimelineStart time={minutesToTimeLabel(day.startMinutes)} label={`Start from ${startingPoint}`} />
        {day.stops.map((stop) => <TimelineStop key={`${day.dayNumber}-${stop.id}`} stop={stop} />)}
        <div className="grid grid-cols-[72px_28px_minmax(0,1fr)] gap-3 pt-1 sm:grid-cols-[88px_32px_minmax(0,1fr)]">
          <time className="pt-1 text-right text-xs font-bold text-muted-foreground sm:text-sm">{minutesToTimeLabel(day.endMinutes)}</time>
          <span className="flex size-7 items-center justify-center rounded-full border-2 border-primary bg-card text-primary sm:size-8"><Flag className="size-3.5" aria-hidden="true" /></span>
          <div className="pb-1"><p className="font-bold">Flexible time / return journey</p><p className="mt-1 text-sm text-muted-foreground">Adjust this wrap-up around real conditions and your accommodation.</p></div>
        </div>
      </div>
    </article>
  )
}

function DayMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-card px-3 py-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-bold">{value}</p></div>
}

function TimelineStart({ time, label }: { time: string; label: string }) {
  return <div className="grid grid-cols-[72px_28px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_32px_minmax(0,1fr)]"><time className="pt-1 text-right text-xs font-bold text-muted-foreground sm:text-sm">{time}</time><div className="relative flex justify-center after:absolute after:top-7 after:h-[calc(100%+1.25rem)] after:border-l-2 after:border-dotted after:border-border"><span className="z-10 flex size-7 items-center justify-center rounded-full bg-foreground text-background sm:size-8"><MapPin className="size-3.5" aria-hidden="true" /></span></div><div className="pb-5"><p className="font-bold">{label}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Day route begins</p></div></div>
}

function TimelineStop({ stop }: { stop: ItineraryStop }) {
  const selected = stop.kind === 'selected'
  const meal = stop.kind === 'meal'
  return <>
    <div className="grid grid-cols-[72px_28px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_32px_minmax(0,1fr)]">
      <span className="text-right text-[11px] font-semibold text-muted-foreground">{durationLabel(stop.travelFromPrevious.estimatedMinutes)}</span>
      <div className="relative flex justify-center after:absolute after:inset-y-0 after:border-l-2 after:border-dotted after:border-border"><ChevronDown className="z-10 size-4 bg-card text-primary" aria-hidden="true" /></div>
      <div className="pb-4 text-xs leading-relaxed text-muted-foreground"><p><strong>{stop.travelFromPrevious.distanceKm.toFixed(1)} km</strong> straight-line distance · {durationLabel(stop.travelFromPrevious.estimatedMinutes)} estimated travel</p><p>Demo estimate · No real-time traffic</p></div>
    </div>
    <div className="grid grid-cols-[72px_28px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_32px_minmax(0,1fr)]">
      <time className="pt-1 text-right text-xs font-bold text-foreground sm:text-sm">{minutesToTimeLabel(stop.visitStartMinutes)}</time>
      <div className="relative flex justify-center after:absolute after:top-7 after:h-[calc(100%+1.5rem)] after:border-l-2 after:border-dotted after:border-border">
        <span className={cn('z-10 flex size-7 items-center justify-center rounded-full text-xs font-bold sm:size-8', selected ? 'bg-primary text-primary-foreground' : meal ? 'border-2 border-secondary bg-card text-secondary' : 'border-2 border-accent bg-card text-foreground')}>{selected ? stop.selectedNumber : meal ? <Utensils className="size-3.5" /> : <Sparkles className="size-3.5" />}</span>
      </div>
      <div className="min-w-0 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/place/${stop.destination.id}`} className="font-heading text-lg font-bold leading-tight hover:text-primary">{stop.destination.name}</Link>
          {selected ? <Badge className="bg-primary-container text-primary">Selected</Badge> : meal ? <Badge className="bg-secondary/10 text-secondary">Suggested Meal Stop</Badge> : <Badge className="bg-accent/25 text-foreground">Suggested by Lakbay Albay</Badge>}
          {stop.isMustVisit && <Badge className="bg-accent text-accent-foreground"><Lock className="size-3" />Must Visit</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{stop.destination.municipality} · {stop.destination.category}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground"><span>Arrive {minutesToTimeLabel(stop.arrivalMinutes)}</span><span>Visit {minutesToTimeLabel(stop.visitStartMinutes)} - {minutesToTimeLabel(stop.visitEndMinutes)}</span><span>{durationLabel(stop.durationMinutes)} suggested</span><span>{stop.operatingHoursLabel}</span></div>
        {stop.visitStartMinutes > stop.arrivalMinutes && <p className="mt-2 text-xs font-semibold text-secondary">Wait for the demo operating window before starting the visit.</p>}
        {stop.suggestionReason && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stop.suggestionReason}</p>}
        <p className="mt-2 text-xs italic text-muted-foreground">Confirm before visiting.</p>
      </div>
    </div>
  </>
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={cn('inline-flex min-h-6 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase', className)}>{children}</span>
}

function RouteOverview({ itinerary }: { itinerary: GeneratedItinerary }) {
  const allStops = itinerary.days.flatMap((day) => day.stops)
  const coordinates = [itinerary.startingPoint.coordinate, ...allStops.map((stop) => ({ latitude: stop.destination.latitude, longitude: stop.destination.longitude }))]
  const minLat = Math.min(...coordinates.map((point) => point.latitude))
  const maxLat = Math.max(...coordinates.map((point) => point.latitude))
  const minLng = Math.min(...coordinates.map((point) => point.longitude))
  const maxLng = Math.max(...coordinates.map((point) => point.longitude))
  const pointFor = (coordinate: { latitude: number; longitude: number }) => ({
    x: 12 + (coordinate.longitude - minLng) / (maxLng - minLng || 1) * 76,
    y: 84 - (coordinate.latitude - minLat) / (maxLat - minLat || 1) * 68,
  })
  const startPoint = pointFor(itinerary.startingPoint.coordinate)
  const occupiedPoints = [startPoint]
  const markerOffsets = [[0, 0], [-9, -7], [9, -7], [-9, 7], [9, 7], [0, -11], [0, 11], [-13, 0], [13, 0]]
  const stopMarkerPoints = allStops.map((stop) => {
    const base = pointFor({ latitude: stop.destination.latitude, longitude: stop.destination.longitude })
    const offset = markerOffsets.find(([xOffset, yOffset]) => {
      const candidate = { x: Math.min(94, Math.max(6, base.x + xOffset)), y: Math.min(94, Math.max(6, base.y + yOffset)) }
      return occupiedPoints.every((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) >= 9)
    }) ?? markerOffsets.at(-1)!
    const point = { x: Math.min(94, Math.max(6, base.x + offset[0])), y: Math.min(94, Math.max(6, base.y + offset[1])) }
    occupiedPoints.push(point)
    return point
  })

  return <section className="rounded-3xl border bg-card p-5 shadow-sm" aria-labelledby="route-overview-title"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary"><Route className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-[.12em] text-secondary">Not to scale</p><h2 id="route-overview-title" className="font-heading text-xl font-bold">Demo route overview</h2></div></div><div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-primary-container" aria-label="Abstract demo route map"><div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,var(--primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--primary)_1px,transparent_1px)] [background-size:28px_28px]" /><svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">{itinerary.days.map((day) => { const points = [startPoint, ...day.stops.map((stop) => pointFor({ latitude: stop.destination.latitude, longitude: stop.destination.longitude }))]; return <polyline key={day.dayNumber} points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="4 3" opacity={Math.max(.45, 1 - (day.dayNumber - 1) * .2)} /> })}</svg><span className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background shadow" style={{ left: `${startPoint.x}%`, top: `${startPoint.y}%` }}>S</span>{allStops.map((stop, index) => { const point = stopMarkerPoints[index]; const selected = stop.kind === 'selected'; return <span key={`${stop.id}-${index}`} title={stop.destination.name} className={cn('absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold shadow', selected ? 'bg-primary text-primary-foreground' : 'border-2 border-secondary bg-card text-secondary')} style={{ left: `${point.x}%`, top: `${point.y}%` }}>{selected ? stop.selectedNumber : <Sparkles className="size-3.5" />}</span> })}<span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-1 text-[11px] font-bold text-primary">Demo route overview · Not to scale</span></div><div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-3 rounded-full bg-foreground" />Start</span><span className="flex items-center gap-1.5"><i className="size-3 rounded-full bg-primary" />Selected</span><span className="flex items-center gap-1.5"><i className="size-3 rounded-full border-2 border-secondary bg-card" />Suggested</span></div></section>
}

function PlanningSummary({ itinerary }: { itinerary: GeneratedItinerary }) {
  const totalActivity = itinerary.days.reduce((total, day) => total + day.activityMinutes, 0)
  const totalTravel = itinerary.days.reduce((total, day) => total + day.travelMinutes, 0)
  const suggested = itinerary.days.reduce((total, day) => total + day.suggestedStopCount, 0)
  return <section className="rounded-3xl border bg-card p-5 shadow-sm" aria-labelledby="planning-summary-title"><p className="text-xs font-bold uppercase tracking-[.12em] text-secondary">At a glance</p><h2 id="planning-summary-title" className="mt-1 font-heading text-xl font-bold">Trip Summary</h2><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><SummaryItem label="Travel days" value={String(itinerary.days.length)} /><SummaryItem label="Selected" value={String(itinerary.selectedDestinationCount)} /><SummaryItem label="Suggested" value={String(suggested)} /><SummaryItem label="Must Visit" value={String(itinerary.mustVisitCount)} /><SummaryItem label="Activity" value={durationLabel(totalActivity)} /><SummaryItem label="Travel" value={durationLabel(totalTravel)} /></dl><div className="mt-4 rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">Travel uses straight-line distance at a demo effective speed of {itinerary.assumptions.speedKph} km/h plus a mode-specific allowance. It is not road distance or live traffic.</div></section>
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div className="border-t pt-2"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-0.5 font-bold">{value}</dd></div>
}

function ConflictPanel({ conflicts }: { conflicts: ItineraryConflict[] }) {
  if (conflicts.length === 0) return <section className="rounded-3xl border bg-card p-5 shadow-sm" aria-labelledby="conflicts-title"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-primary-container text-primary"><Check className="size-4" /></span><div><h2 id="conflicts-title" className="font-heading text-lg font-bold">No planning conflicts</h2><p className="mt-1 text-sm text-muted-foreground">Based on the available demo data.</p></div></div></section>
  return <section className="rounded-3xl border border-accent bg-card p-5 shadow-sm" aria-labelledby="conflicts-title"><div className="flex items-center gap-3"><TriangleAlert className="size-5 text-secondary" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[.12em] text-secondary">Review needed</p><h2 id="conflicts-title" className="font-heading text-xl font-bold">Planning Conflicts</h2></div></div><div className="mt-4 divide-y">{conflicts.map((conflict) => <div key={conflict.id} className="py-3 first:pt-0 last:pb-0"><div className="flex items-start gap-2"><p className="flex-1 text-sm font-bold">{conflict.title}</p>{conflict.isMustVisit && <Lock className="mt-0.5 size-4 shrink-0 text-secondary" aria-label="Must Visit" />}</div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{conflict.message}</p>{conflict.destinationId && <Link href={`/place/${conflict.destinationId}`} className="mt-2 inline-flex min-h-8 items-center text-xs font-bold text-primary">Review Destination</Link>}</div>)}</div></section>
}

function UnscheduledSection({ itinerary }: { itinerary: GeneratedItinerary }) {
  return <section className="rounded-3xl border border-accent bg-card p-5 shadow-sm sm:p-6" aria-labelledby="unscheduled-title"><div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 size-6 shrink-0 text-secondary" /><div><h2 id="unscheduled-title" className="font-heading text-xl font-bold">Couldn’t Fit Into This Trip</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">These places remain selected. Adjust the trip instead of losing them.</p></div></div><div className="mt-5 divide-y">{itinerary.unscheduled.map((item) => <div key={item.destination.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/place/${item.destination.id}`} className="font-bold hover:text-primary">{item.destination.name}</Link>{item.isMustVisit && <Badge className="bg-accent text-accent-foreground"><Lock className="size-3" />Must Visit</Badge>}</div><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.reason}</p></div>)}</div><div className="mt-5 flex flex-col gap-2 min-[390px]:flex-row"><Button nativeButton={false} render={<Link href="/trip" />} variant="outline" size="lg" className="min-h-11 rounded-xl">Review My Trip</Button><Button nativeButton={false} render={<Link href="/preferences" />} size="lg" className="min-h-11 rounded-xl">Adjust Preferences</Button></div></section>
}

function PlanningRequired({ hasPlaces }: { hasPlaces: boolean }) {
  return <><main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 pb-32 pt-10 text-center md:pb-16"><span className="flex size-16 items-center justify-center rounded-2xl bg-primary-container text-primary">{hasPlaces ? <SlidersHorizontal className="size-7" /> : <Map className="size-7" />}</span><h1 className="mt-5 font-heading text-3xl font-bold text-balance">{hasPlaces ? 'Finish your trip preferences first.' : 'Choose places before generating an itinerary.'}</h1><p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{hasPlaces ? 'Add valid travel dates, transportation, pace, and budget details so Lakbay Albay can build the demo schedule.' : 'Your itinerary is generated from the places saved in My Trip.'}</p><div className="mt-6 flex w-full flex-col gap-3 min-[390px]:w-auto min-[390px]:flex-row"><Button nativeButton={false} render={<Link href={hasPlaces ? '/preferences' : '/'} />} size="lg" className="min-h-12 rounded-xl">{hasPlaces ? <SlidersHorizontal data-icon="inline-start" /> : <Compass data-icon="inline-start" />}{hasPlaces ? 'Set Preferences' : 'Explore Albay'}</Button><Button nativeButton={false} render={<Link href="/trip" />} size="lg" variant="outline" className="min-h-12 rounded-xl"><ArrowLeft data-icon="inline-start" />Review My Trip</Button></div></main><MobileBottomNav /></>
}
