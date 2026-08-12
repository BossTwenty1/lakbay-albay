'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  ArrowLeft,
  Bus,
  CalendarDays,
  Camera,
  Car,
  Check,
  Coins,
  Compass,
  Footprints,
  Gauge,
  HeartHandshake,
  Landmark,
  Leaf,
  Map,
  MapPin,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  TriangleAlert,
  Users,
  Utensils,
  X,
} from 'lucide-react'
import { MobileBottomNav } from '@/components/app-navigation'
import { useTrip } from '@/components/trip-provider'
import { Button } from '@/components/ui/button'
import { destinations, type Destination } from '@/lib/destinations'
import {
  accessibilityOptions,
  budgetLevels,
  durationLabel,
  formatDate,
  getAccessibilityWarning,
  getTravelDayCount,
  interestOptions,
  isValidDateValue,
  startingPointOptions,
  transportationModes,
  travelPaces,
  type AccessibilityNeed,
  type BudgetLevel,
  type TransportationMode,
  type TravelPace,
  type TripInterest,
  type TripPreferences,
} from '@/lib/trip-preferences'
import { cn } from '@/lib/utils'

type ValidationField = 'dates' | 'startingPoint' | 'transportationMode' | 'travelPace' | 'budgetLevel'
type ValidationErrors = Partial<Record<ValidationField, string>>

const transportationDetails: Record<TransportationMode, string> = {
  'Private Vehicle': 'Best for flexible routes and multiple stops.',
  'Public Transportation': 'Travel time may vary depending on available routes.',
  'Mixed Transportation': 'Combine public transport, walking, and local rides.',
  'Walking for Nearby Stops': 'Best for compact areas and short distances.',
}

const transportationIcons = {
  'Private Vehicle': Car,
  'Public Transportation': Bus,
  'Mixed Transportation': Compass,
  'Walking for Nearby Stops': Footprints,
}

const paceDetails: Record<TravelPace, string> = {
  Relaxed: 'Fewer stops, more time at each place, and longer breaks.',
  Balanced: 'A comfortable mix of destinations, travel, and free time.',
  Packed: 'More destinations with less free time between stops.',
}

const budgetDetails: Record<BudgetLevel, string> = {
  'Budget-Friendly': 'Prioritize free and lower-cost experiences.',
  Moderate: 'Balance affordability and variety.',
  Flexible: 'Focus more on experience than cost.',
}

const interestIcons = {
  Nature: Leaf,
  Food: Utensils,
  Culture: Landmark,
  Heritage: Landmark,
  Adventure: Compass,
  Photography: Camera,
  'Shopping Local': ShoppingBag,
  'Community Experiences': HeartHandshake,
  Relaxation: Sparkles,
  'Family Activities': Users,
}

function selectedPlaces(ids: string[]) {
  return ids.map((id) => destinations.find((destination) => destination.id === id)).filter((destination): destination is Destination => Boolean(destination))
}

export function PreferencesScreen() {
  const router = useRouter()
  const { selectedIds, mustVisitIds, preferences, hydrated, updatePreferences, resetPreferences } = useTrip()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState<Set<string>>(new Set())
  const resetDialogRef = useRef<HTMLDialogElement>(null)
  const places = selectedPlaces(selectedIds)
  const totalMinutes = places.reduce((total, place) => total + place.suggestedDurationMinutes, 0)
  const estimatedDays = Math.max(1, Math.ceil(totalMinutes / 360))
  const travelDays = getTravelDayCount(preferences.travelStartDate, preferences.travelEndDate)
  const conflicts = places.flatMap((destination) => {
    const warning = getAccessibilityWarning(destination, preferences.accessibilityNeeds)
    return warning ? [{ destination, warning }] : []
  })

  if (!hydrated) {
    return <><main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-8 md:px-8"><div className="h-96 animate-pulse rounded-3xl bg-muted" /></main><MobileBottomNav /></>
  }

  if (places.length === 0) return <EmptyPreferences />

  function update<K extends keyof TripPreferences>(key: K, value: TripPreferences[K], errorField?: ValidationField) {
    updatePreferences({ [key]: value })
    if (errorField) setErrors((current) => ({ ...current, [errorField]: undefined }))
  }

  function updateAccessibility(need: AccessibilityNeed) {
    const current = preferences.accessibilityNeeds
    const next = need === 'No Special Requirement'
      ? ['No Special Requirement'] as AccessibilityNeed[]
      : current.includes(need)
        ? current.filter((item) => item !== need && item !== 'No Special Requirement')
        : [...current.filter((item) => item !== 'No Special Requirement'), need]
    updatePreferences({ accessibilityNeeds: next.length > 0 ? next : ['No Special Requirement'] })
    setAcknowledgedWarnings(new Set())
  }

  function validate() {
    const next: ValidationErrors = {}
    const { travelStartDate, travelEndDate, startingPoint, transportationMode, travelPace, budgetLevel } = preferences

    if (!travelStartDate) next.dates = 'Choose a start date.'
    else if (!isValidDateValue(travelStartDate)) next.dates = 'Choose a valid start date.'
    else if (!travelEndDate) next.dates = 'Choose an end date.'
    else if (!isValidDateValue(travelEndDate)) next.dates = 'Choose a valid end date.'
    else if (travelStartDate > travelEndDate) next.dates = 'The end date must be on or after the start date.'
    if (!startingPoint.trim()) next.startingPoint = 'Choose or enter a starting point.'
    if (!transportationMode) next.transportationMode = 'Choose how you will travel.'
    if (!travelPace) next.travelPace = 'Choose a travel pace.'
    if (!budgetLevel) next.budgetLevel = 'Choose a budget style.'

    setErrors(next)
    const firstInvalid = (['dates', 'startingPoint', 'transportationMode', 'travelPace', 'budgetLevel'] as ValidationField[]).find((field) => next[field])
    if (firstInvalid) {
      requestAnimationFrame(() => {
        const section = document.getElementById(`preferences-${firstInvalid}`)
        section?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        section?.querySelector<HTMLElement>('input, button')?.focus({ preventScroll: true })
      })
      return false
    }
    return true
  }

  const standardStartingPoint = startingPointOptions.includes(preferences.startingPoint as (typeof startingPointOptions)[number])

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-7 min-[390px]:px-5 md:px-8 md:pb-16 md:pt-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-secondary">Trip preferences</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">Plan Your Albay Trip</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">Tell us how you want to travel, and we’ll use these preferences to organize your selected places.</p>
        </div>

        <Progress />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <form onSubmit={(event) => { event.preventDefault(); if (validate()) router.push('/itinerary') }} noValidate className="min-w-0 space-y-9">
            <section id="preferences-dates" aria-labelledby="dates-title">
              <SectionHeading id="dates-title" icon={CalendarDays} title="When are you traveling?" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DateField id="travel-start-date" label="Start Date" value={preferences.travelStartDate} onChange={(value) => update('travelStartDate', value, 'dates')} error={Boolean(errors.dates)} />
                <DateField id="travel-end-date" label="End Date" value={preferences.travelEndDate} onChange={(value) => update('travelEndDate', value, 'dates')} error={Boolean(errors.dates)} />
              </div>
              <div className="mt-3 flex min-h-12 items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3 text-sm">
                <span className="font-medium text-muted-foreground">Number of Travel Days</span>
                <span className="font-bold text-primary">{travelDays > 0 ? `${travelDays} ${travelDays === 1 ? 'day' : 'days'}` : 'Add valid dates'}</span>
              </div>
              <FieldError message={errors.dates} />
            </section>

            <section id="preferences-startingPoint" aria-labelledby="starting-point-title">
              <SectionHeading id="starting-point-title" icon={MapPin} title="Where will your journey start?" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[...startingPointOptions, 'Custom / Other' as const].map((option) => {
                  const checked = option === 'Custom / Other' ? !standardStartingPoint : preferences.startingPoint === option
                  return <CompactChoice key={option} name="starting-point" value={option} checked={checked} onChange={() => update('startingPoint', option === 'Custom / Other' ? '' : option, 'startingPoint')} />
                })}
              </div>
              {!standardStartingPoint && <div className="mt-3"><label htmlFor="custom-starting-point" className="mb-2 block text-sm font-bold">Custom starting point</label><input id="custom-starting-point" value={preferences.startingPoint} onChange={(event) => update('startingPoint', event.target.value, 'startingPoint')} maxLength={120} placeholder="Enter a city, town, or landmark" aria-invalid={Boolean(errors.startingPoint)} className="h-12 w-full rounded-xl border bg-card px-4 outline-none focus:ring-2 focus:ring-ring" /></div>}
              <FieldError message={errors.startingPoint} />
            </section>

            <section id="preferences-transportationMode" aria-labelledby="transport-title">
              <SectionHeading id="transport-title" icon={Car} title="How will you travel?" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {transportationModes.map((mode) => <DetailedChoice key={mode} name="transportation" value={mode} description={transportationDetails[mode]} icon={transportationIcons[mode]} checked={preferences.transportationMode === mode} onChange={() => update('transportationMode', mode, 'transportationMode')} />)}
              </div>
              <FieldError message={errors.transportationMode} />
            </section>

            <section id="preferences-travelPace" aria-labelledby="pace-title">
              <SectionHeading id="pace-title" icon={Gauge} title="What pace fits your trip?" />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {travelPaces.map((pace) => <DetailedChoice key={pace} name="travel-pace" value={pace} description={paceDetails[pace]} checked={preferences.travelPace === pace} onChange={() => update('travelPace', pace, 'travelPace')} badge={pace === 'Balanced' ? 'Recommended' : undefined} />)}
              </div>
              <FieldError message={errors.travelPace} />
            </section>

            <section aria-labelledby="interests-title">
              <SectionHeading id="interests-title" icon={Sparkles} title="What would you like to experience?" />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">These interests will help Lakbay Albay suggest nearby local experiences when your itinerary is generated.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {interestOptions.map((interest) => {
                  const selected = preferences.selectedInterests.includes(interest)
                  const Icon = interestIcons[interest]
                  return <label key={interest} className={cn('flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-ring', selected && 'border-primary bg-primary-container text-primary')}><input type="checkbox" className="sr-only" checked={selected} onChange={() => update('selectedInterests', selected ? preferences.selectedInterests.filter((item) => item !== interest) : [...preferences.selectedInterests, interest] as TripInterest[])} /><Icon className="size-4 shrink-0" aria-hidden="true" /><span>{interest}</span>{selected && <Check className="ml-auto size-4 shrink-0" aria-hidden="true" />}</label>
                })}
              </div>
            </section>

            <section id="preferences-budgetLevel" aria-labelledby="budget-title">
              <SectionHeading id="budget-title" icon={Coins} title="What budget style fits your trip?" />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {budgetLevels.map((budget) => <DetailedChoice key={budget} name="budget" value={budget} description={budgetDetails[budget]} checked={preferences.budgetLevel === budget} onChange={() => update('budgetLevel', budget, 'budgetLevel')} />)}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Prototype prices are demo estimates and should be confirmed before visiting.</p>
              <FieldError message={errors.budgetLevel} />
            </section>

            <section aria-labelledby="accessibility-title">
              <SectionHeading id="accessibility-title" icon={Users} title="Anything we should consider?" />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {accessibilityOptions.map((need) => <CompactChoice key={need} name={`accessibility-${need}`} value={need} type="checkbox" checked={preferences.accessibilityNeeds.includes(need)} onChange={() => updateAccessibility(need)} />)}
              </div>
              {conflicts.length > 0 && <AccessibilityPreview conflicts={conflicts} acknowledged={acknowledgedWarnings} onKeep={(id) => setAcknowledgedWarnings((current) => new Set(current).add(id))} />}
            </section>

            <div className="lg:hidden"><PreferenceSummary preferences={preferences} travelDays={travelDays} /></div>

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" className="min-h-12 flex-1 rounded-xl text-base"><Sparkles data-icon="inline-start" />Generate My Itinerary</Button>
              <Button type="button" variant="ghost" size="lg" className="min-h-12 text-muted-foreground" onClick={() => resetDialogRef.current?.showModal()}><RotateCcw data-icon="inline-start" />Reset Preferences</Button>
            </div>
          </form>

          <aside className="order-first space-y-5 lg:order-none lg:sticky lg:top-28">
            <TripSummary places={places} mustVisitCount={mustVisitIds.length} totalMinutes={totalMinutes} estimatedDays={estimatedDays} />
            <div className="hidden lg:block"><PreferenceSummary preferences={preferences} travelDays={travelDays} /></div>
          </aside>
        </div>
      </main>

      <ResetDialog dialogRef={resetDialogRef} onReset={() => { resetPreferences(); setErrors({}); setAcknowledgedWarnings(new Set()); resetDialogRef.current?.close() }} />
      <MobileBottomNav />
    </>
  )
}

function Progress() {
  const steps = ['Choose Places', 'Set Preferences', 'Generate Itinerary']
  return <ol className="mt-7 grid max-w-3xl grid-cols-3 gap-2" aria-label="Trip planning progress">{steps.map((step, index) => <li key={step} className={cn('flex min-w-0 flex-col gap-2 border-t-2 pt-3 text-xs font-bold text-muted-foreground sm:flex-row sm:items-center sm:text-sm', index === 1 ? 'border-primary text-primary' : index === 0 ? 'border-secondary text-foreground' : 'border-border')}><span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs', index === 1 && 'bg-primary text-primary-foreground', index === 0 && 'bg-secondary text-secondary-foreground')}>{index === 0 ? <Check className="size-4" /> : index + 1}</span><span className="leading-tight">{step}</span></li>)}</ol>
}

function SectionHeading({ id, icon: Icon, title }: { id: string; icon: typeof CalendarDays; title: string }) {
  return <div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary"><Icon className="size-5" aria-hidden="true" /></span><h2 id={id} className="font-heading text-xl font-bold">{title}</h2></div>
}

function DateField({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (value: string) => void; error: boolean }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-bold">{label}</label><input id={id} type="text" inputMode="numeric" autoComplete="off" placeholder="YYYY-MM-DD" maxLength={10} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={error} className="h-12 w-full rounded-xl border bg-card px-4 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" /></div>
}

function CompactChoice({ name, value, checked, onChange, type = 'radio' }: { name: string; value: string; checked: boolean; onChange: () => void; type?: 'radio' | 'checkbox' }) {
  return <label className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm font-bold transition-colors focus-within:ring-2 focus-within:ring-ring', checked && 'border-primary bg-primary-container text-primary')}><input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" /><span className={cn('flex size-5 shrink-0 items-center justify-center border-2 border-muted-foreground', type === 'radio' ? 'rounded-full' : 'rounded-md', checked && 'border-primary bg-primary text-primary-foreground')}>{checked && <Check className="size-3.5" aria-hidden="true" />}</span><span>{value}</span></label>
}

function DetailedChoice({ name, value, description, checked, onChange, icon: Icon, badge }: { name: string; value: string; description: string; checked: boolean; onChange: () => void; icon?: typeof Car; badge?: string }) {
  return <label className={cn('relative flex min-h-32 cursor-pointer flex-col rounded-2xl border bg-card p-4 transition-colors focus-within:ring-2 focus-within:ring-ring', checked && 'border-primary bg-primary-container')}><input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" /><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2">{Icon && <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />}<span className="font-bold leading-tight">{value}</span></div><span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground', checked && 'border-primary bg-primary text-primary-foreground')}>{checked && <Check className="size-3.5" aria-hidden="true" />}</span></div>{badge && <span className="mt-2 w-fit rounded-full bg-accent px-2 py-1 text-[11px] font-bold text-accent-foreground">{badge}</span>}<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></label>
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-destructive" role="alert"><TriangleAlert className="size-4 shrink-0" aria-hidden="true" />{message}</p> : null
}

function TripSummary({ places, mustVisitCount, totalMinutes, estimatedDays }: { places: Destination[]; mustVisitCount: number; totalMinutes: number; estimatedDays: number }) {
  return <section className="rounded-3xl border bg-card p-5 shadow-sm" aria-labelledby="trip-summary-title"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-secondary">Selected trip</p><h2 id="trip-summary-title" className="mt-1 font-heading text-xl font-bold">Your Albay places</h2></div><div className="flex -space-x-2">{places.slice(0, 4).map((place) => <Image key={place.id} src={place.image} alt="" width={36} height={36} className="size-9 rounded-full border-2 border-card object-cover" />)}</div></div><div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><SummaryStat label="Destinations" value={String(places.length)} /><SummaryStat label="Must Visit" value={String(mustVisitCount)} /><SummaryStat label="Activity time" value={durationLabel(totalMinutes)} /><SummaryStat label="Initial estimate" value={`${estimatedDays} ${estimatedDays === 1 ? 'day' : 'days'}`} /></div><p className="mt-4 text-xs leading-relaxed text-muted-foreground">The estimate uses six activity hours per day and is not an itinerary result.</p><Button nativeButton={false} render={<Link href="/trip" />} variant="outline" size="lg" className="mt-4 w-full rounded-xl"><ArrowLeft data-icon="inline-start" />Review My Trip</Button></section>
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div className="border-t pt-2"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-0.5 font-bold">{value}</p></div>
}

function PreferenceSummary({ preferences, travelDays }: { preferences: TripPreferences; travelDays: number }) {
  const rows = [
    ['Dates', preferences.travelStartDate && preferences.travelEndDate ? `${formatDate(preferences.travelStartDate)} – ${formatDate(preferences.travelEndDate)}` : 'Not set'],
    ['Number of Days', travelDays > 0 ? `${travelDays} ${travelDays === 1 ? 'day' : 'days'}` : 'Not set'],
    ['Starting Point', preferences.startingPoint || 'Not set'],
    ['Transportation', preferences.transportationMode || 'Not set'],
    ['Travel Pace', preferences.travelPace || 'Not set'],
    ['Interests', preferences.selectedInterests.length > 0 ? preferences.selectedInterests.join(', ') : 'No preference'],
    ['Budget', preferences.budgetLevel || 'Not set'],
    ['Travel Needs', preferences.accessibilityNeeds.join(', ')],
  ]
  return <section className="rounded-3xl border bg-card p-5 shadow-sm" aria-labelledby="preference-summary-title"><p className="text-xs font-bold uppercase tracking-[.12em] text-secondary">Review</p><h2 id="preference-summary-title" className="mt-1 font-heading text-xl font-bold">Preference Summary</h2><dl className="mt-4 divide-y">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[112px_1fr] gap-3 py-3 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="break-words text-right font-semibold">{value}</dd></div>)}</dl></section>
}

function AccessibilityPreview({ conflicts, acknowledged, onKeep }: { conflicts: { destination: Destination; warning: string }[]; acknowledged: Set<string>; onKeep: (id: string) => void }) {
  return <div className="mt-5 rounded-2xl border border-accent bg-card p-4"><div className="flex gap-3"><TriangleAlert className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" /><div><h3 className="font-heading font-bold">Some selected places may not match your accessibility preferences.</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Keep them in your trip or review the available demo access details.</p></div></div><div className="mt-4 divide-y">{conflicts.map(({ destination, warning }) => <div key={destination.id} className="py-4 first:pt-0 last:pb-0"><p className="font-bold">{destination.name}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{warning}</p><div className="mt-3 flex flex-wrap gap-2">{acknowledged.has(destination.id) ? <span className="flex min-h-10 items-center gap-2 px-2 text-sm font-bold text-primary"><Check className="size-4" />Kept in My Trip</span> : <Button type="button" variant="ghost" onClick={() => onKeep(destination.id)}>Keep in My Trip</Button>}<Button nativeButton={false} render={<Link href={`/place/${destination.id}`} />} variant="outline">Review Destination</Button></div></div>)}</div></div>
}

function ResetDialog({ dialogRef, onReset }: { dialogRef: React.RefObject<HTMLDialogElement | null>; onReset: () => void }) {
  return <dialog ref={dialogRef} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-foreground/40"><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-heading text-xl font-bold">Reset trip preferences?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Dates, travel choices, interests, budget, and travel needs will return to their defaults. Your selected places, order, favorites, and Must Visit choices will stay saved.</p></div><button type="button" onClick={() => dialogRef.current?.close()} className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted" aria-label="Close"><X className="size-5" /></button></div><div className="mt-6 flex flex-col-reverse gap-2 min-[390px]:flex-row min-[390px]:justify-end"><Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>Keep Preferences</Button><Button type="button" variant="destructive" onClick={onReset}>Reset Preferences</Button></div></div></dialog>
}

function EmptyPreferences() {
  return <><main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 pb-32 pt-10 text-center md:pb-16"><span className="flex size-16 items-center justify-center rounded-2xl bg-primary-container text-primary"><Map className="size-7" aria-hidden="true" /></span><h1 className="mt-5 font-heading text-3xl font-bold text-balance">You haven’t added any places yet.</h1><p className="mt-3 max-w-md leading-relaxed text-muted-foreground">Choose the places you want to experience before planning your itinerary.</p><div className="mt-6 flex w-full flex-col gap-3 min-[390px]:w-auto min-[390px]:flex-row"><Button nativeButton={false} render={<Link href="/" />} size="lg" className="min-h-12 rounded-xl"><Compass data-icon="inline-start" />Explore Albay</Button><Button nativeButton={false} render={<Link href="/trip" />} size="lg" variant="outline" className="min-h-12 rounded-xl"><ArrowLeft data-icon="inline-start" />Back to My Trip</Button></div></main><MobileBottomNav /></>
}
