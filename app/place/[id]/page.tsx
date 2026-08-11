import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PlaceDetailScreen } from '@/components/place-detail-screen'
import { destinations } from '@/lib/destinations'

export function generateStaticParams() {
  return destinations.map((destination) => ({ id: destination.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const destination = destinations.find((item) => item.id === id)
  if (!destination) return { title: 'Place not found | Lakbay Albay' }
  return { title: `${destination.name} | Lakbay Albay`, description: destination.description }
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const destination = destinations.find((item) => item.id === id)
  if (!destination) notFound()
  return <PlaceDetailScreen destination={destination} />
}
