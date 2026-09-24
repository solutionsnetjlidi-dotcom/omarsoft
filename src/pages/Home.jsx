import Navbar              from '../components/Navbar'
import HeroSection         from '../components/HeroSection'
import ProductsCatalog     from '../components/ProductsCatalog'
import ServicesAndTraining from '../components/ServicesAndTraining'
import MediaGallery        from '../components/MediaGallery'
import Footer              from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProductsCatalog />
        <ServicesAndTraining />
        <MediaGallery />
      </main>
      <Footer />
    </>
  )
}
