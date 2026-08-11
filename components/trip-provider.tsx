'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type TripContextValue = {
  selectedIds: string[]
  favoriteIds: string[]
  hydrated: boolean
  toggleTrip: (id: string) => void
  toggleFavorite: (id: string) => void
}

const TripContext = createContext<TripContextValue | null>(null)
const TRIP_KEY = 'lakbay-albay-trip'
const FAVORITES_KEY = 'lakbay-albay-favorites'

function readIds(key: string) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSelectedIds(readIds(TRIP_KEY))
    setFavoriteIds(readIds(FAVORITES_KEY))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TRIP_KEY, JSON.stringify(selectedIds))
  }, [hydrated, selectedIds])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds, hydrated])

  const toggleTrip = useCallback((id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }, [])

  const value = useMemo(() => ({ selectedIds, favoriteIds, hydrated, toggleTrip, toggleFavorite }), [selectedIds, favoriteIds, hydrated, toggleTrip, toggleFavorite])

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrip() {
  const context = useContext(TripContext)
  if (!context) throw new Error('useTrip must be used within TripProvider')
  return context
}
