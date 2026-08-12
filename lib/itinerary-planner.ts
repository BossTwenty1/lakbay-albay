import { destinations, type Destination } from '@/lib/destinations'
import {
  getAccessibilityWarning,
  getTravelDayCount,
  type TransportationMode,
  type TravelPace,
  type TripPreferences,
} from '@/lib/trip-preferences'

export type Coordinate = {
  latitude: number
  longitude: number
}

export type TravelSegment = {
  fromLabel: string
  toLabel: string
  distanceKm: number
  estimatedMinutes: number
  transportationMode: TransportationMode
  isDemoEstimate: true
}

export type ItineraryStop = {
  id: string
  kind: 'selected' | 'suggested' | 'meal'
  destination: Destination
  selectedNumber?: number
  isMustVisit: boolean
  arrivalMinutes: number
  visitStartMinutes: number
  visitEndMinutes: number
  durationMinutes: number
  operatingHoursLabel: string
  suggestionReason?: string
  travelFromPrevious: TravelSegment
}

export type SuggestedStop = ItineraryStop & {
  kind: 'suggested' | 'meal'
  isMustVisit: false
  suggestionReason: string
}

export type ItineraryConflict = {
  id: string
  type: 'accessibility' | 'operating-hours' | 'capacity' | 'unscheduled' | 'starting-point'
  title: string
  message: string
  destinationId?: string
  destinationName?: string
  isMustVisit: boolean
}

export type UnscheduledDestination = {
  destination: Destination
  reason: string
  isMustVisit: boolean
}

export type ItineraryDay = {
  dayNumber: number
  date: string
  areaLabel: string
  startMinutes: number
  endMinutes: number
  selectedStopCount: number
  suggestedStopCount: number
  activityMinutes: number
  travelMinutes: number
  stops: ItineraryStop[]
  travelSegments: TravelSegment[]
}

export type GeneratedItinerary = {
  days: ItineraryDay[]
  conflicts: ItineraryConflict[]
  unscheduled: UnscheduledDestination[]
  selectedDestinationCount: number
  mustVisitCount: number
  startingPoint: {
    requestedLabel: string
    routeLabel: string
    coordinate: Coordinate
    usedFallback: boolean
  }
  assumptions: {
    transportationMode: TransportationMode
    travelPace: TravelPace
    speedKph: number
    dailyStartMinutes: number
    dailyEndMinutes: number
    bufferMinutes: number
  }
}

type PlannerInput = {
  selectedIds: string[]
  mustVisitIds: string[]
  preferences: TripPreferences
  destinationData?: Destination[]
}

type PaceRule = {
  startMinutes: number
  endMinutes: number
  bufferMinutes: number
  maxSelectedStops: number
  maxSuggestions: number
  targetBias: number
}

type TransportRule = {
  speedKph: number
  fixedMinutes: number
}

const STARTING_POINTS: Record<string, Coordinate> = {
  'Legazpi City': { latitude: 13.1391, longitude: 123.7438 },
  Daraga: { latitude: 13.1483, longitude: 123.7126 },
  Camalig: { latitude: 13.1826, longitude: 123.6542 },
}

// Prototype assumptions are centralized so the behavior is easy to inspect and tune.
const PACE_RULES: Record<TravelPace, PaceRule> = {
  Relaxed: { startMinutes: 8 * 60 + 30, endMinutes: 16 * 60 + 30, bufferMinutes: 30, maxSelectedStops: 2, maxSuggestions: 1, targetBias: 0 },
  Balanced: { startMinutes: 8 * 60, endMinutes: 17 * 60 + 30, bufferMinutes: 20, maxSelectedStops: 3, maxSuggestions: 1, targetBias: 0 },
  Packed: { startMinutes: 7 * 60 + 30, endMinutes: 19 * 60, bufferMinutes: 10, maxSelectedStops: 5, maxSuggestions: 2, targetBias: 1 },
}

const TRANSPORT_RULES: Record<TransportationMode, TransportRule> = {
  'Private Vehicle': { speedKph: 32, fixedMinutes: 3 },
  'Public Transportation': { speedKph: 20, fixedMinutes: 12 },
  'Mixed Transportation': { speedKph: 25, fixedMinutes: 8 },
  'Walking for Nearby Stops': { speedKph: 4.5, fixedMinutes: 2 },
}

const SUGGESTION_CATEGORIES = new Set<Destination['category']>(['Food', 'Local Business', 'Community', 'Culture'])

export function haversineDistanceKm(from: Coordinate, to: Coordinate) {
  const earthRadiusKm = 6371
  const toRadians = (degrees: number) => degrees * Math.PI / 180
  const latitudeDelta = toRadians(to.latitude - from.latitude)
  const longitudeDelta = toRadians(to.longitude - from.longitude)
  const fromLatitude = toRadians(from.latitude)
  const toLatitude = toRadians(to.latitude)
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function estimateTravelMinutes(distanceKm: number, transportationMode: TransportationMode) {
  if (distanceKm <= 0.05) return 0
  const rule = TRANSPORT_RULES[transportationMode]
  const rawMinutes = distanceKm / rule.speedKph * 60 + rule.fixedMinutes
  return Math.max(5, Math.ceil(rawMinutes / 5) * 5)
}

export function minutesToTimeLabel(totalMinutes: number) {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`
}

function parseOperatingTime(value: string, boundary: 'open' | 'close') {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'open all day') return boundary === 'open' ? 0 : 24 * 60
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(value.trim())
  if (!match) return null
  let hours = Number(match[1]) % 12
  if (match[3].toLowerCase() === 'pm') hours += 12
  return hours * 60 + Number(match[2])
}

function addDays(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function resolveStartingPoint(startingPoint: string) {
  const known = STARTING_POINTS[startingPoint]
  if (known) return { requestedLabel: startingPoint, routeLabel: startingPoint, coordinate: known, usedFallback: false }
  return {
    requestedLabel: startingPoint || 'Custom / Other',
    routeLabel: 'Legazpi City demo origin',
    coordinate: STARTING_POINTS['Legazpi City'],
    usedFallback: true,
  }
}

function destinationCoordinate(destination: Destination): Coordinate {
  return { latitude: destination.latitude, longitude: destination.longitude }
}

function interestMatch(destination: Destination, preferences: TripPreferences) {
  const desired = preferences.selectedInterests.map((item) => item.toLowerCase())
  const destinationTerms = [destination.category, ...(destination.categories ?? []), ...destination.interests].map((item) => item.toLowerCase())
  return desired.some((interest) => {
    if (interest === 'shopping local') return destinationTerms.some((term) => term.includes('shopping') || term.includes('local business') || term.includes('craft'))
    if (interest === 'community experiences') return destinationTerms.some((term) => term.includes('community'))
    if (interest === 'family activities') return destinationTerms.some((term) => term.includes('family'))
    return destinationTerms.some((term) => term.includes(interest) || interest.includes(term))
  })
}

function operatingWindow(destination: Destination) {
  return {
    open: parseOperatingTime(destination.openingTime, 'open'),
    close: parseOperatingTime(destination.closingTime, 'close'),
    label: destination.openingTime === destination.closingTime
      ? destination.openingTime
      : `${destination.openingTime} - ${destination.closingTime}`,
  }
}

type CandidateTiming = {
  travel: TravelSegment
  arrival: number
  start: number
  end: number
  fitsDay: boolean
  fitsHours: boolean
  hoursKnown: boolean
}

function candidateTiming(
  destination: Destination,
  fromCoordinate: Coordinate,
  fromLabel: string,
  currentMinutes: number,
  mode: TransportationMode,
  dayEndMinutes: number,
  bufferMinutes: number,
): CandidateTiming {
  const distanceKm = haversineDistanceKm(fromCoordinate, destinationCoordinate(destination))
  const estimatedMinutes = estimateTravelMinutes(distanceKm, mode)
  const arrival = currentMinutes + estimatedMinutes
  const hours = operatingWindow(destination)
  const start = hours.open === null ? arrival : Math.max(arrival, hours.open)
  const end = start + destination.suggestedDurationMinutes
  return {
    travel: {
      fromLabel,
      toLabel: destination.name,
      distanceKm,
      estimatedMinutes,
      transportationMode: mode,
      isDemoEstimate: true,
    },
    arrival,
    start,
    end,
    fitsDay: end + bufferMinutes <= dayEndMinutes,
    fitsHours: hours.close === null || end <= hours.close,
    hoursKnown: hours.open !== null && hours.close !== null,
  }
}

function candidateScore(destination: Destination, from: Coordinate, preferredIndex: Map<string, number>, mustVisitIds: Set<string>) {
  const mustVisitScore = mustVisitIds.has(destination.id) ? -10_000 : 0
  const distanceScore = haversineDistanceKm(from, destinationCoordinate(destination)) * 100
  const orderScore = (preferredIndex.get(destination.id) ?? 999) * 8
  const closing = operatingWindow(destination).close ?? 24 * 60
  return mustVisitScore + distanceScore + orderScore + closing / 1000
}

function makeStop(
  destination: Destination,
  kind: ItineraryStop['kind'],
  timing: CandidateTiming,
  isMustVisit: boolean,
  selectedNumber?: number,
  suggestionReason?: string,
): ItineraryStop {
  return {
    id: `${kind}-${destination.id}`,
    kind,
    destination,
    selectedNumber,
    isMustVisit,
    arrivalMinutes: timing.arrival,
    visitStartMinutes: timing.start,
    visitEndMinutes: timing.end,
    durationMinutes: destination.suggestedDurationMinutes,
    operatingHoursLabel: operatingWindow(destination).label,
    suggestionReason,
    travelFromPrevious: timing.travel,
  }
}

function buildAreaLabel(stops: ItineraryStop[]) {
  const municipalities = [...new Set(stops.filter((stop) => stop.kind === 'selected').map((stop) => stop.destination.municipality))]
  if (municipalities.length === 0) return 'Flexible Albay day'
  if (municipalities.length === 1) return `${municipalities[0]} area`
  return municipalities.join(' & ')
}

function describeUnscheduled(
  destination: Destination,
  startingPoint: Coordinate,
  startingLabel: string,
  mode: TransportationMode,
  pace: TravelPace,
  rule: PaceRule,
) {
  const hours = operatingWindow(destination)
  if (hours.open === null || hours.close === null) {
    return {
      reason: 'Its operating hours need confirmation and it could not fit within the available daily time.',
      conflictType: 'operating-hours' as const,
    }
  }

  const bestCaseStart = Math.max(rule.startMinutes, hours.open)
  if (bestCaseStart + destination.suggestedDurationMinutes > hours.close) {
    return {
      reason: `It may close before a full suggested visit can finish within its demo operating window (${hours.label}).`,
      conflictType: 'operating-hours' as const,
    }
  }

  const timing = candidateTiming(destination, startingPoint, startingLabel, rule.startMinutes, mode, rule.endMinutes, rule.bufferMinutes)
  if (!timing.fitsHours) {
    return {
      reason: `It may close before the suggested arrival and visit can finish (${hours.label}).`,
      conflictType: 'operating-hours' as const,
    }
  }

  return {
    reason: `It could not fit within the ${pace.toLowerCase()} daily window after travel, visit time, and buffers were considered.`,
    conflictType: 'unscheduled' as const,
  }
}

function findSuggestion(
  candidates: Destination[],
  from: Coordinate,
  currentMinutes: number,
  fromLabel: string,
  preferences: TripPreferences,
  rule: PaceRule,
  mealOnly: boolean,
) {
  const ranked = candidates
    .filter((destination) => SUGGESTION_CATEGORIES.has(destination.category))
    .filter((destination) => !mealOnly || destination.category === 'Food')
    .map((destination) => {
      const timing = candidateTiming(destination, from, fromLabel, currentMinutes, preferences.transportationMode as TransportationMode, rule.endMinutes, rule.bufferMinutes)
      const matchBonus = interestMatch(destination, preferences) ? -5 : 0
      const mealBonus = destination.category === 'Food' ? -2 : 0
      return { destination, timing, score: haversineDistanceKm(from, destinationCoordinate(destination)) + matchBonus + mealBonus }
    })
    .filter(({ timing }) => timing.fitsDay && timing.fitsHours)
    .sort((a, b) => a.score - b.score || a.destination.id.localeCompare(b.destination.id))
  return ranked[0] ?? null
}

export function generateItinerary({ selectedIds, mustVisitIds, preferences, destinationData = destinations }: PlannerInput): GeneratedItinerary {
  const selected = selectedIds
    .map((id) => destinationData.find((destination) => destination.id === id))
    .filter((destination): destination is Destination => Boolean(destination))
  const validMustVisitIds = new Set(mustVisitIds.filter((id) => selectedIds.includes(id)))
  const preferredIndex = new Map(selectedIds.map((id, index) => [id, index]))
  const dayCount = getTravelDayCount(preferences.travelStartDate, preferences.travelEndDate)
  const mode = (preferences.transportationMode || 'Private Vehicle') as TransportationMode
  const pace = (preferences.travelPace || 'Balanced') as TravelPace
  const rule = PACE_RULES[pace]
  const transportRule = TRANSPORT_RULES[mode]
  const startingPoint = resolveStartingPoint(preferences.startingPoint)
  const conflicts: ItineraryConflict[] = []
  const remaining = [...selected]
  const usedSuggestionIds = new Set<string>()
  const selectedSet = new Set(selectedIds)
  const days: ItineraryDay[] = []

  if (startingPoint.usedFallback) {
    conflicts.push({
      id: 'custom-starting-point',
      type: 'starting-point',
      title: 'Custom starting point uses a demo origin',
      message: `${startingPoint.requestedLabel} does not have prototype coordinates yet. Travel estimates begin from Legazpi City and should be adjusted manually.`,
      isMustVisit: false,
    })
  }

  for (const destination of selected) {
    const warning = getAccessibilityWarning(destination, preferences.accessibilityNeeds)
    if (!warning) continue
    const isMustVisit = validMustVisitIds.has(destination.id)
    conflicts.push({
      id: `accessibility-${destination.id}`,
      type: 'accessibility',
      title: `Accessibility conflict: ${destination.name}`,
      message: `${warning}${isMustVisit ? ' It remains in the plan because you marked it Must Visit.' : ' The destination remains selected for your review.'}`,
      destinationId: destination.id,
      destinationName: destination.name,
      isMustVisit,
    })
  }

  for (const destination of selected) {
    const hours = operatingWindow(destination)
    if (hours.open !== null && hours.close !== null) continue
    conflicts.push({
      id: `operating-hours-${destination.id}`,
      type: 'operating-hours',
      title: `Confirm operating hours: ${destination.name}`,
      message: 'The available operating-hour data is uncertain. Confirm before visiting.',
      destinationId: destination.id,
      destinationName: destination.name,
      isMustVisit: validMustVisitIds.has(destination.id),
    })
  }

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
    const daysRemaining = dayCount - dayIndex
    const baseTarget = Math.ceil(remaining.length / daysRemaining)
    const target = Math.min(rule.maxSelectedStops, Math.max(0, baseTarget + (daysRemaining > 1 ? rule.targetBias : 0)))
    const stops: ItineraryStop[] = []
    const travelSegments: TravelSegment[] = []
    let currentMinutes = rule.startMinutes
    let currentCoordinate = startingPoint.coordinate
    let currentLabel = startingPoint.routeLabel
    let selectedScheduled = 0

    while (remaining.length > 0 && selectedScheduled < target) {
      const candidates = [...remaining].sort((a, b) => candidateScore(a, currentCoordinate, preferredIndex, validMustVisitIds) - candidateScore(b, currentCoordinate, preferredIndex, validMustVisitIds))
      const evaluated = candidates.map((destination) => ({
        destination,
        timing: candidateTiming(destination, currentCoordinate, currentLabel, currentMinutes, mode, rule.endMinutes, rule.bufferMinutes),
      }))
      const next = evaluated.find(({ timing }) => timing.fitsDay && timing.fitsHours)
      if (!next) break

      const stop = makeStop(
        next.destination,
        'selected',
        next.timing,
        validMustVisitIds.has(next.destination.id),
        (preferredIndex.get(next.destination.id) ?? 0) + 1,
      )
      stops.push(stop)
      travelSegments.push(next.timing.travel)
      currentMinutes = next.timing.end + rule.bufferMinutes
      currentCoordinate = destinationCoordinate(next.destination)
      currentLabel = next.destination.name
      remaining.splice(remaining.findIndex((destination) => destination.id === next.destination.id), 1)
      selectedScheduled += 1
    }

    const suggestionPool = destinationData.filter((destination) => !selectedSet.has(destination.id) && !usedSuggestionIds.has(destination.id))
    for (let suggestionIndex = 0; suggestionIndex < rule.maxSuggestions && stops.length > 0; suggestionIndex += 1) {
      const lunchWindow = currentMinutes >= 10 * 60 + 45 && currentMinutes <= 13 * 60 + 15
      const suggested = findSuggestion(suggestionPool.filter((destination) => !usedSuggestionIds.has(destination.id)), currentCoordinate, currentMinutes, currentLabel, preferences, rule, lunchWindow)
        ?? (lunchWindow ? findSuggestion(suggestionPool.filter((destination) => !usedSuggestionIds.has(destination.id)), currentCoordinate, currentMinutes, currentLabel, preferences, rule, false) : null)
      if (!suggested) break
      const kind: ItineraryStop['kind'] = lunchWindow && suggested.destination.category === 'Food' ? 'meal' : 'suggested'
      const reason = kind === 'meal'
        ? 'A nearby food stop that fits the demo lunch window.'
        : interestMatch(suggested.destination, preferences)
          ? 'Nearby and aligned with your selected interests.'
          : 'A nearby local experience along the demo route.'
      const stop = makeStop(suggested.destination, kind, suggested.timing, false, undefined, reason)
      stops.push(stop)
      travelSegments.push(suggested.timing.travel)
      usedSuggestionIds.add(suggested.destination.id)
      currentMinutes = suggested.timing.end + rule.bufferMinutes
      currentCoordinate = destinationCoordinate(suggested.destination)
      currentLabel = suggested.destination.name
    }

    days.push({
      dayNumber: dayIndex + 1,
      date: addDays(preferences.travelStartDate, dayIndex),
      areaLabel: buildAreaLabel(stops),
      startMinutes: rule.startMinutes,
      endMinutes: stops.length > 0 ? Math.min(rule.endMinutes, Math.max(...stops.map((stop) => stop.visitEndMinutes))) : rule.startMinutes,
      selectedStopCount: stops.filter((stop) => stop.kind === 'selected').length,
      suggestedStopCount: stops.filter((stop) => stop.kind !== 'selected').length,
      activityMinutes: stops.reduce((total, stop) => total + stop.durationMinutes, 0),
      travelMinutes: travelSegments.reduce((total, segment) => total + segment.estimatedMinutes, 0),
      stops,
      travelSegments,
    })
  }

  const unscheduledDetails = new Map<string, ReturnType<typeof describeUnscheduled>>()
  const unscheduled = remaining.map((destination) => {
    const details = describeUnscheduled(destination, startingPoint.coordinate, startingPoint.routeLabel, mode, pace, rule)
    unscheduledDetails.set(destination.id, details)
    return { destination, reason: details.reason, isMustVisit: validMustVisitIds.has(destination.id) }
  })

  for (const item of unscheduled) {
    conflicts.push({
      id: `unscheduled-${item.destination.id}`,
      type: unscheduledDetails.get(item.destination.id)?.conflictType ?? 'unscheduled',
      title: `${item.destination.name} could not be scheduled`,
      message: `${item.reason}${item.isMustVisit ? ' It remains protected as Must Visit.' : ''}`,
      destinationId: item.destination.id,
      destinationName: item.destination.name,
      isMustVisit: item.isMustVisit,
    })
  }

  if (unscheduled.length > 0) {
    conflicts.push({
      id: 'daily-capacity',
      type: 'capacity',
      title: 'Selected places exceed the available schedule',
      message: `${unscheduled.length} selected ${unscheduled.length === 1 ? 'place needs' : 'places need'} more time, different dates, or a faster travel pace.`,
      isMustVisit: unscheduled.some((item) => item.isMustVisit),
    })
  }

  return {
    days,
    conflicts,
    unscheduled,
    selectedDestinationCount: selected.length,
    mustVisitCount: validMustVisitIds.size,
    startingPoint,
    assumptions: {
      transportationMode: mode,
      travelPace: pace,
      speedKph: transportRule.speedKph,
      dailyStartMinutes: rule.startMinutes,
      dailyEndMinutes: rule.endMinutes,
      bufferMinutes: rule.bufferMinutes,
    },
  }
}
