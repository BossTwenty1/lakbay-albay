import { Header } from '@/components/app-navigation'
import { ExploreScreen } from '@/components/explore-screen'

export default function Page() {
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <ExploreScreen />
    </div>
  )
}
