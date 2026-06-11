import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { ServicesSection } from '@/components/services-section'
import { TrustSection } from '@/components/trust-section'
import { CTASection } from '@/components/cta-section'

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <TrustSection />
      <CTASection />
      <Footer />
    </main>
  )
}
