import Link from 'next/link'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { Header, MobileBottomNav } from '@/components/app-navigation'

export default function PreferencesPage() {
  return <div className="min-h-dvh bg-background"><Header /><main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-4 pb-28 text-center"><span className="flex size-16 items-center justify-center rounded-2xl bg-primary-container text-primary"><SlidersHorizontal className="size-7" aria-hidden="true" /></span><div><p className="text-sm font-bold uppercase tracking-[.16em] text-secondary">Phase 3</p><h1 className="mt-2 font-heading text-3xl font-bold text-balance">Trip preferences are coming next</h1><p className="mt-3 leading-relaxed text-muted-foreground">Your selected places and preferred order are saved. The next phase will collect dates, pace, transport, interests, and accessibility needs.</p></div><Link href="/trip" className="flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Back to My Trip</Link></main><MobileBottomNav /></div>
}
