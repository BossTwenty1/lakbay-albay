'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { destinations } from '@/lib/destinations'

type TripContextValue = {
  selectedIds: string[]
  favoriteIds: string[]
  mustVisitIds: string[]
  hydrated: boolean
  toggleTrip: (id: string) => void
  removeFromTrip: (id: string) => void
  movePlace: (id: string, direction: 'up' | 'down') => void
  toggleFavorite: (id: string) => void
  toggleMustVisit: (id: string) => void
}

const TripContext = createContext<TripContextValue | null>(null)
const TRIP_KEY = 'lakbay-albay-trip'
const FAVORITES_KEY = 'lakbay-albay-favorites'
const MUST_VISIT_KEY = 'lakbay-albay-must-visit'
const validIds = new Set(destinations.map((destination) => destination.id))

function readIds(key: string) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string' && validIds.has(item)))] : []
  } catch {
    return []
  }
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [mustVisitIds, setMustVisitIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const selected = readIds(TRIP_KEY)
    setSelectedIds(selected)
    setFavoriteIds(readIds(FAVORITES_KEY))
    setMustVisitIds(readIds(MUST_VISIT_KEY).filter((id) => selected.includes(id)))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TRIP_KEY, JSON.stringify(selectedIds))
  }, [hydrated, selectedIds])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds, hydrated])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(MUST_VISIT_KEY, JSON.stringify(mustVisitIds))
  }, [hydrated, mustVisitIds])

  const removeFromTrip = useCallback((id: string) => {
    setSelectedIds((current) => current.filter((item) => item !== id))
    setMustVisitIds((current) => current.filter((item) => item !== id))
  }, [])

  const toggleTrip = useCallback((id: string) => {
    setSelectedIds((current) => {
      if (!current.includes(id)) return [...current, id]
      setMustVisitIds((mustVisit) => mustVisit.filter((item) => item !== id))
      return current.filter((item) => item !== id)
    })
  }, [])

  const movePlace = useCallback((id: string, direction: 'up' | 'down') => {
    setSelectedIds((current) => {
      const index = current.indexOf(id)
      const target = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }, [])

  const toggleMustVisit = useCallback((id: string) => {
    setMustVisitIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }, [])

  const value = useMemo(() => ({ selectedIds, favoriteIds, mustVisitIds, hydrated, toggleTrip, removeFromTrip, movePlace, toggleFavorite, toggleMustVisit }), [selectedIds, favoriteIds, mustVisitIds, hydrated, toggleTrip, removeFromTrip, movePlace, toggleFavorite, toggleMustVisit])

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrip() {
  const context = useContext(TripContext)
  if (!context) throw new Error('useTrip must be used within TripProvider')
  return context
}
