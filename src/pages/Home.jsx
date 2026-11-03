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

      {/* ms-64 = marge côté début : gauche en FR/EN, droite en arabe (RTL),
          pour suivre la position de la sidebar. */}
      <div className="lg:ms-64 transition-all duration-300">
        <div className="h-14 lg:h-0" />
        <main>
          <HeroSection />
          <ProductsCatalog />
          <ServicesAndTraining />
          <MediaGallery />
        </main>
        <Footer />
      </div>

      <WhatsAppFloat />
      <QuoteCart />
    </>
  )
}
