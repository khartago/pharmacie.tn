import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Pill,
  Heart,
  Shield,
  Users,
  CheckCircle,
  Calendar,
  Award,
  Facebook,
  Instagram,
  ArrowRight,
  Navigation
} from 'lucide-react';

export default function SiteVitrineExemplePage() {
  // Example pharmacy data - this would be customized for each pharmacy
  const pharmacyData = {
    name: 'Pharmacie Centrale',
    tagline: 'Votre santé, notre priorité depuis 1995',
    description: 'Pharmacie Centrale est une pharmacie de référence située au cœur de Tunis, offrant un service pharmaceutique de qualité et des conseils personnalisés à nos clients. Notre équipe de pharmaciens diplômés vous accompagne dans tous vos besoins de santé.',
    phone: '+216 71 123 456',
    phoneDisplay: '71 123 456',
    email: 'contact@pharmacie-centrale.tn',
    address: 'Avenue Habib Bourguiba',
    city: '1000 Tunis, Tunisie',
    region: 'Tunis',
    googleMapsUrl: 'https://maps.app.goo.gl/4LCjZXxSWwrM8JM7A',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3190.1234567890123!2d10.1815!3d36.8065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzYuODA2NSAxMC4xODE1!5e0!3m2!1sfr!2stn!4v1234567890123!5m2!1sfr!2stn',
    openingHours: [
      { day: 'Lundi - Vendredi', hours: '08:00 - 20:00', open: true },
      { day: 'Samedi', hours: '08:00 - 19:00', open: true },
      { day: 'Dimanche', hours: '09:00 - 14:00', open: true },
      { day: 'Jours fériés', hours: 'Sur rendez-vous', open: false }
    ],
    services: [
      {
        icon: Pill,
        title: 'Conseil pharmaceutique',
        description: 'Conseils personnalisés et accompagnement dans vos traitements par nos pharmaciens expérimentés'
      },
      {
        icon: Heart,
        title: 'Soins à domicile',
        description: 'Service de livraison de médicaments pour les personnes à mobilité réduite'
      },
      {
        icon: Calendar,
        title: 'Rappel de traitement',
        description: 'Système de rappel pour vos prises de médicaments régulières'
      },
      {
        icon: Shield,
        title: 'Vaccination',
        description: 'Service de vaccination certifié et conforme aux normes sanitaires tunisiennes'
      },
      {
        icon: Users,
        title: 'Pharmacovigilance',
        description: 'Suivi et signalement des effets indésirables des médicaments'
      },
      {
        icon: Award,
        title: 'Substitutions thérapeutiques',
        description: 'Propositions d\'alternatives médicamenteuses adaptées à vos besoins'
      }
    ],
    specialFeatures: [
      'Garde de nuit disponible',
      'Prise en charge CNAM',
      'Médecine naturelle et phytothérapie',
      'Produits d\'hygiène et cosmétiques',
      'Parapharmacie complète',
      'Pharmacie agréée Ordre des Pharmaciens'
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Header - No Pharmacie.tn branding */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{pharmacyData.name}</h1>
                <p className="text-xs text-gray-500">Pharmacie officinale</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#accueil" className="text-gray-700 hover:text-green-600 transition-colors">Accueil</a>
              <a href="#services" className="text-gray-700 hover:text-green-600 transition-colors">Services</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href={`tel:${pharmacyData.phone}`} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="font-medium">{pharmacyData.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="accueil" className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Pharmacie officinale agréée
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {pharmacyData.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light">
              {pharmacyData.tagline}
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              {pharmacyData.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${pharmacyData.phone}`}>
                <Button size="lg" className="text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
                  <Phone className="w-5 h-5 mr-2" />
                  Appeler maintenant
                </Button>
              </a>
              <a href={pharmacyData.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg border-2 border-green-600 text-green-600 hover:bg-green-50">
                  <MapPin className="w-5 h-5 mr-2" />
                  Nous localiser
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-green-600 text-white py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-90">Ouvert aujourd'hui</div>
                <div className="font-semibold">08:00 - 20:00</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-90">Adresse</div>
                <div className="font-semibold">{pharmacyData.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-90">Téléphone</div>
                <div className="font-semibold">{pharmacyData.phoneDisplay}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Bienvenue chez {pharmacyData.name}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {pharmacyData.description}
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              Notre équipe de pharmaciens diplômés et expérimentés met son expertise à votre service pour vous conseiller 
              et vous accompagner dans tous vos besoins de santé. Nous nous engageons à vous fournir des produits de qualité 
              et des conseils professionnels dans une atmosphère chaleureuse et accueillante.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une gamme complète de services pharmaceutiques pour répondre à tous vos besoins de santé
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pharmacyData.services.map((service, index) => (
              <Card key={index} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi nous choisir ?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pharmacyData.specialFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-900 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Hours Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Contactez-nous
              </h2>
              <p className="text-lg text-gray-600">
                Notre équipe est à votre disposition pour répondre à toutes vos questions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MapPin className="w-6 h-6 text-green-600" />
                    Coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                      <p className="text-gray-600">{pharmacyData.address}</p>
                      <p className="text-gray-600">{pharmacyData.city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                      <a href={`tel:${pharmacyData.phone}`} className="text-green-600 hover:text-green-700 font-medium">
                        {pharmacyData.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a href={`mailto:${pharmacyData.email}`} className="text-green-600 hover:text-green-700 font-medium">
                        {pharmacyData.email}
                      </a>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-4">
                      <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-green-100 flex items-center justify-center transition-colors">
                        <Facebook className="w-5 h-5 text-gray-600" />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-green-100 flex items-center justify-center transition-colors">
                        <Instagram className="w-5 h-5 text-gray-600" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Opening Hours */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Clock className="w-6 h-6 text-green-600" />
                    Horaires d'ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pharmacyData.openingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                        <span className={`font-medium ${schedule.open ? 'text-gray-900' : 'text-gray-500'}`}>
                          {schedule.day}
                        </span>
                        <span className={`font-semibold ${schedule.open ? 'text-green-600' : 'text-gray-400'}`}>
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <Clock className="w-4 h-4" />
                      <p className="text-sm font-medium">
                        Service de garde disponible en dehors des horaires
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Google Maps */}
            <div className="mt-8">
              <Card className="bg-white border border-gray-200 overflow-hidden">
                <div className="relative">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(pharmacyData.address + ', ' + pharmacyData.city)}&output=embed`}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                    title={`Localisation de ${pharmacyData.name}`}
                  />
                  <div className="absolute top-4 right-4">
                    <a
                      href={pharmacyData.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-600"
                    >
                      <Navigation className="w-4 h-4" />
                      Ouvrir dans Google Maps
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal, Pharmacy Branded */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">{pharmacyData.name}</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Votre pharmacie de confiance au cœur de {pharmacyData.region}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#accueil" className="hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact rapide</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${pharmacyData.phone}`} className="hover:text-white transition-colors">
                    {pharmacyData.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${pharmacyData.email}`} className="hover:text-white transition-colors">
                    {pharmacyData.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {pharmacyData.name}. Tous droits réservés.</p>
            <p className="mt-2">Pharmacie officinale agréée - Ordre des Pharmaciens de Tunisie</p>
          </div>
        </div>
      </footer>

      {/* Back Link - Small, Unobtrusive */}
      <div className="fixed bottom-4 left-4 z-50">
        <Link href="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900"
          >
            ← Retour à Pharmacie.tn
          </Button>
        </Link>
      </div>
    </div>
  );
}
