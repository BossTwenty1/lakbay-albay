import type { Destination } from '@/lib/destinations'

export const startingPointOptions = ['Legazpi City', 'Daraga', 'Camalig'] as const
export const transportationModes = ['Private Vehicle', 'Public Transportation', 'Mixed Transportation', 'Walking for Nearby Stops'] as const
export const travelPaces = ['Relaxed', 'Balanced', 'Packed'] as const
export const interestOptions = ['Nature', 'Food', 'Culture', 'Heritage', 'Adventure', 'Photography', 'Shopping Local', 'Community Experiences', 'Relaxation', 'Family Activities'] as const
export const budgetLevels = ['Budget-Friendly', 'Moderate', 'Flexible'] as const
export const accessibilityOptions = ['No Special Requirement', 'Wheelchair Accessibility', 'Avoid Long Walks', 'Traveling with Children', 'Traveling with Older Adults', 'Frequent Rest Stops'] as const

export type TransportationMode = (typeof transportationModes)[number]
export type TravelPace = (typeof travelPaces)[number]
export type TripInterest = (typeof interestOptions)[number]
export type BudgetLevel = (typeof budgetLevels)[number]
export type AccessibilityNeed = (typeof accessibilityOptions)[number]

export type TripPreferences = {
  travelStartDate: string
  travelEndDate: string
  startingPoint: string
  transportationMode: TransportationMode | ''
  travelPace: TravelPace | ''
  selectedInterests: TripInterest[]
  budgetLevel: BudgetLevel | ''
  accessibilityNeeds: AccessibilityNeed[]
}

export const defaultTripPreferences: TripPreferences = {
  travelStartDate: '',
  travelEndDate: '',
  startingPoint: 'Legazpi City',
  transportationMode: '',
  travelPace: 'Balanced',
  selectedInterests: [],
  budgetLevel: '',
  accessibilityNeeds: ['No Special Requirement'],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOption<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && options.includes(value as T)
}

function sanitizeDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  return isValidDateValue(value) ? value : ''
}

function sanitizeStartingPoint(value: unknown) {
  if (typeof value !== 'string') return defaultTripPreferences.startingPoint
  const sanitized = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120)
  return sanitized
}

function sanitizeOptions<T extends string>(value: unknown, options: readonly T[]) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is T => isOption(item, options)))]
}

export function sanitizeTripPreferences(value: unknown): TripPreferences {
  if (!isRecord(value)) return defaultTripPreferences

  const accessibilityNeeds = sanitizeOptions(value.accessibilityNeeds, accessibilityOptions)
  const specificNeeds = accessibilityNeeds.filter((need) => need !== 'No Special Requirement')

  return {
    travelStartDate: sanitizeDate(value.travelStartDate),
    travelEndDate: sanitizeDate(value.travelEndDate),
    startingPoint: sanitizeStartingPoint(value.startingPoint),
    transportationMode: isOption(value.transportationMode, transportationModes) ? value.transportationMode : '',
    travelPace: isOption(value.travelPace, travelPaces) ? value.travelPace : defaultTripPreferences.travelPace,
    selectedInterests: sanitizeOptions(value.selectedInterests, interestOptions),
    budgetLevel: isOption(value.budgetLevel, budgetLevels) ? value.budgetLevel : '',
    accessibilityNeeds: specificNeeds.length > 0 ? specificNeeds : ['No Special Requirement'],
  }
}

export function isValidDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function dateValueToUtc(value: string) {
  if (!isValidDateValue(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function getTravelDayCount(startDate: string, endDate: string) {
  const start = dateValueToUtc(startDate)
  const end = dateValueToUtc(endDate)
  if (start === null || end === null || end < start) return 0
  return Math.floor((end - start) / 86_400_000) + 1
}

export function formatDate(value: string) {
  if (!isValidDateValue(value)) return 'Not set'
  const [year, month, day] = value.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[month - 1]} ${day}, ${year}`
}

export function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr${hours > 1 ? 's' : ''}`
}

export function getAccessibilityWarning(destination: Destination, needs: AccessibilityNeed[]) {
  const activeNeeds = needs.filter((need) => need !== 'No Special Requirement')
  if (activeNeeds.length === 0) return null

  const access = destination.accessibility.toLowerCase()
  if (activeNeeds.includes('Wheelchair Accessibility')) {
    const explicitlyInaccessible = access.includes('not wheelchair accessible')
    const accessConfirmed = !explicitlyInaccessible && (access.includes('wheelchair accessible') || access.includes('mostly level') || access.includes('wide, mostly level'))
    if (!accessConfirmed) return 'Wheelchair accessibility may be limited or requires confirmation.'
  }
  if (activeNeeds.includes('Avoid Long Walks') && /(uneven|steps|assistance|route depends)/.test(access)) {
    return 'Walking distance or terrain may require confirmation.'
  }
  if (activeNeeds.includes('Traveling with Older Adults') && /(uneven|steps|assistance|route depends)/.test(access)) {
    return 'Terrain and access may need extra planning for older adults.'
  }
  if (activeNeeds.includes('Traveling with Children') && /(uneven|steps|route depends)/.test(access)) {
    return 'Terrain suitability for children may require confirmation.'
  }
  if (activeNeeds.includes('Frequent Rest Stops') && !/(rest|seating|bench)/.test(access)) {
    return 'Frequent rest-stop availability is not confirmed.'
  }
  return null
}
