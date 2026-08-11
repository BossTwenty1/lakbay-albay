import Link from 'next/link'
import { ArrowLeft, Map } from 'lucide-react'

export default function TripPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <section className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-container text-primary"><Map className="size-7" aria-hidden="true" /></span>
        <div><h1 className="font-sans text-3xl font-bold text-balance">My Trip will be built in Phase 2.</h1><p className="mt-3 leading-relaxed text-muted-foreground">Your selected places are safely saved for the next phase.</p></div>
        <Link href="/" className="flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Back to Explore</Link>
      </section>
    </main>
  )
}
