import Navbar              from '../components/Navbar'
import HeroSection         from '../components/HeroSection'
import ProductsCatalog     from '../components/ProductsCatalog'
import ServicesAndTraining from '../components/ServicesAndTraining'
import MediaGallery        from '../components/MediaGallery'
import Footer              from '../components/Footer'
import WhatsAppFloat       from '../components/WhatsAppFloat'
import QuoteCart           from '../components/QuoteCart'

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="lg:ml-64 transition-all duration-300">
        <div className="h-14 lg:h-0" />
        <main>
          <HeroSection />
          <ProductsCatalog />
          <ServicesAndTraining />
          <MediaGallery />
        </main>
        <Footer />
      </div>
      {/* Boutons flottants */}
      <WhatsAppFloat />
      <QuoteCart />
    </>
  )
}
