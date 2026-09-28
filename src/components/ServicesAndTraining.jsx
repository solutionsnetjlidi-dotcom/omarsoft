import { useEffect, useState } from 'react'
import { Wrench, Wifi, GraduationCap, Megaphone, ArrowRight, Check } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { openWhatsApp } from '../utils/config'

const TABS = [
  { id: 'repair', labelKey: 'services.tabs.repair', icon: Wrench, color: 'text-ocean' },
  { id: 'network', labelKey: 'services.tabs.network', icon: Wifi, color: 'text-emerald-500' },
  { id: 'training', labelKey: 'services.tabs.training', icon: GraduationCap, color: 'text-amber-500' },
  { id: 'media', labelKey: 'services.tabs.media', icon: Megaphone, color: 'text-purple-500' },
]

export default function ServicesAndTraining() {
  const { t } = useLang()
  // Par défaut, on affiche le premier onglet (repair) ou celui passé dans l'URL
  const [activeTab, setActiveTab] = useState('repair')

  useEffect(() => {
    // Écouteur d'événement venant de OrbitSystem.jsx
    const handleTabActivation = (event) => {
      setActiveTab(event.detail)
    }
    
    window.addEventListener('activateServiceTab', handleTabActivation)
    
    // Nettoyage de l'écouteur lors du démontage du composant
    return () => {
      window.removeEventListener('activateServiceTab', handleTabActivation)
    }
  }, [])

  // Données des services (adaptez les clés de traduction selon votre fichier de langue)
  const servicesData = {
    repair: {
      title: t('services.repair.title', 'Diagnostic & Réparation PC'),
      desc: t('services.repair.desc', 'Diagnostic complet et réparation matérielle/logicielle pour PC fixes et portables.'),
      features: [
        t('services.repair.f1', 'Diagnostic matériel complet'),
        t('services.repair.f2', 'Réparation pannes matérielles'),
        t('services.repair.f3', 'Réinstallation Windows / OS'),
        t('services.repair.f4', 'Nettoyage et optimisation'),
      ],
      price: '80 TND',
      duration: '1–4 heures',
    },
    network: {
      title: t('services.network.title', 'Installation Réseau Wi-Fi & Fibre'),
      desc: t('services.network.desc', 'Installation, câblage et configuration de réseaux Wi-Fi, LAN et vidéosurveillance IP.'),
      features: [
        t('services.network.f1', 'Audit réseau & recommandations'),
        t('services.network.f2', 'Câblage RJ45 / fibre optique'),
        t('services.network.f3', 'Configuration routeurs & switches'),
        t('services.network.f4', 'Installation caméras IP PoE'),
      ],
      price: '150 TND',
      duration: 'Demi-journée',
    },
    training: {
      title: t('services.training.title', 'Formations Bureautiques'),
      desc: t('services.training.desc', 'Sessions de formation personnalisées pour maîtriser les outils numériques essentiels.'),
      features: [
        t('services.training.f1', 'Pack Office (Word, Excel, PowerPoint)'),
        t('services.training.f2', 'Initiation à la maintenance PC'),
        t('services.training.f3', 'Sécurité informatique de base'),
        t('services.training.f4', 'Support pédagogique inclus'),
      ],
      price: 'Sur devis',
      duration: 'Selon programme',
    },
    media: {
      title: t('services.media.title', 'Agence Média & Meta Ads'),
      desc: t('services.media.desc', 'Création de contenu numérique, gestion de réseaux sociaux et campagnes publicitaires ciblées.'),
      features: [
        t('services.media.f1', 'Shooting photo & vidéo professionnel'),
        t('services.media.f2', 'Gestion de pages Facebook/Instagram'),
        t('services.media.f3', 'Campagnes Meta Ads optimisées'),
        t('services.media.f4', 'Reporting et analyse de performance'),
      ],
      price: 'Sur devis',
      duration: 'Mensuel',
    }
  }

  const currentService = servicesData[activeTab]

  return (
    <section id="services" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-ocean font-semibold text-sm mb-3 uppercase tracking-wider">
            <Wrench size={15} />
            {t('services.subtitle', 'Nos Prestations')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-midnight mb-4">
            {t('services.title', 'Des services informatiques professionnels, réactifs et abordables')}
          </h2>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-midnight text-white border-midnight shadow-lg shadow-midnight/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-ocean/40 hover:text-ocean'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-ocean' : tab.color} />
                {t(tab.labelKey)}
              </button>
            )
          })}
        </div>

        {/* Active Tab Content */}
        <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Info */}
            <div className="flex-1">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 mb-4`}>
                {(() => {
                  const Icon = TABS.find(t => t.id === activeTab)?.icon
                  return <Icon size={24} className={TABS.find(t => t.id === activeTab)?.color} />
                })()}
              </div>
              <h3 className="text-2xl font-bold text-midnight mb-3">{currentService.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-6">{currentService.desc}</p>
              
              <ul className="space-y-3 mb-8">
                {currentService.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check size={16} className="text-ocean mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => openWhatsApp(`Bonjour, je suis intéressé par le service : ${currentService.title}`)}
                className="flex items-center gap-2 bg-ocean hover:bg-ocean-dark text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-ocean/20 hover:shadow-ocean/40 hover:-translate-y-0.5"
              >
                {t('common.requestService', 'Demander ce service')}
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Right: Pricing Card */}
            <div className="md:w-72 flex-shrink-0">
              <div className="bg-midnight text-white rounded-2xl p-6 text-center shadow-xl">
                <p className="text-white/60 text-sm font-medium mb-2">{t('common.startingAt', 'À partir de')}</p>
                <div className="text-3xl font-extrabold text-ocean mb-1">{currentService.price}</div>
                <div className="text-white/40 text-xs mb-6">{currentService.duration}</div>
                
                <div className="border-t border-white/10 pt-4 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Check size={14} className="text-emerald-400" />
                    {t('common.support', 'Support réactif')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Check size={14} className="text-emerald-400" />
                    {t('common.guarantee', 'Garantie intervention')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}