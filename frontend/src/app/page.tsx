import React from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Shield, 
  Clock, 
  Users,
  ArrowRight,
  Megaphone,
  Star,
  Eye
} from 'lucide-react';

export default function HomePage() {
     const features = [
     {
       icon: Shield,
       title: 'Échange de médicaments',
       description: 'Échangez vos médicaments à date proche avec d\'autres pharmacies du réseau'
     },
     {
       icon: Clock,
       title: 'Retours fournisseurs',
       description: 'Facilitez et optimisez vos retours de médicaments auprès des fournisseurs'
     },
     {
       icon: Users,
       title: 'Système de demandes',
       description: 'Trouvez les médicaments manquants grâce au système de demandes entre pharmacies'
     },
     {
       icon: CheckCircle,
       title: 'Conformité légale',
       description: 'Respect strict de la législation pharmaceutique tunisienne et de l\'Ordre des Pharmaciens'
     }
   ];

  const pricingPlans = [
    {
      name: 'Pack Standard',
      price: '20',
      period: 'DT/mois',
      description: 'Accès complet à la plateforme Pharmacie.tn',
      features: [
        'Consultation et publication des demandes (recherche de médicaments)',
        'Consultation et publication des annonces (médicaments à date proche)',
        'Gestion des retours fournisseurs',
        'Notifications et suivi des interactions',
        'Assistance de base via support en ligne'
      ],
      popular: false,
      color: 'green'
    },
    {
      name: 'Option Email Pro',
      price: '+10',
      period: 'DT/mois',
      description: 'Adresse email professionnelle nom@pharmacie.tn',
      features: [
        'Image plus crédible et communication facilitée',
        'Gestion sécurisée des emails pour la pharmacie'
      ],
      popular: false,
      color: 'blue',
      warning: 'Cette option est disponible uniquement en complément du Pack Standard'
    },
    {
      name: 'Option Site Vitrine',
      price: '+10',
      period: 'DT/mois',
      description: 'Mini-site vitrine personnalisé pour la pharmacie',
      features: [
        'Présentation des coordonnées, horaires et services',
        'Amélioration de la visibilité locale et en ligne'
      ],
      popular: false,
      color: 'purple',
      warning: 'Cette option est disponible uniquement en complément du Pack Standard',
      showExample: true
    },
    {
      name: 'Pack Complet',
      price: '35',
      period: 'DT/mois',
      description: 'Inclut Pack Standard + Email Pro + Site Vitrine',
      features: [
        'Toutes les fonctionnalités réunies dans une offre unique',
        'Support prioritaire'
      ],
      popular: true,
      color: 'green'
    }
  ];

  return (
    <PublicLayout>
      {/* 2025 Modern Hero Section */}
              <section className="gradient-hero section-padding-2025 relative overflow-hidden modern-bg-pattern">
        <div className="container-2025">
          <div className="text-center animate-fade-in">
            <h1 className="text-display-2025 text-foreground mb-8">
              La plateforme d'échanges
              <span className="gradient-text-primary"> pharmaceutiques</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Rejoignez le réseau national des pharmacies tunisiennes. Échangez des médicaments 
              à date proche, facilitez les retours fournisseurs et trouvez les médicaments 
              manquants en toute conformité légale.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 animate-hover-lift">
                <Link href="/landing/contact">
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all duration-200 animate-hover-lift">
                <Link href="/landing/tarifs">
                  Voir nos tarifs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2025 Modern Features Section */}
              <section className="section-padding-2025 bg-muted relative modern-bg-pattern">
        <div className="container-2025">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-heading-2025 text-foreground mb-6">
              Pourquoi rejoindre Pharmacie.tn ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Une plateforme dédiée aux échanges pharmaceutiques et à la réduction des pertes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-modern-2025 text-center animate-slide-in-bottom animate-hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-8">
                  <div className="w-20 h-20 feature-icon rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 2025 Modern Pricing Section */}
              <section className="section-padding-2025 bg-background relative modern-bg-pattern">
        <div className="container-2025">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-heading-2025 text-foreground mb-6">
              Nos Tarifs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Des solutions adaptées aux besoins des pharmacies tunisiennes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`card-modern-2025 relative h-full flex flex-col overflow-visible !overflow-visible animate-slide-in-bottom animate-hover-lift ${
                  plan.popular ? 'ring-2 ring-primary shadow-primary' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 inset-x-0 z-20 flex justify-center pointer-events-none">
                    <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-md border border-primary/30 flex items-center gap-1.5">
                      <Star className="w-3 h-3" />
                      Recommandé
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </div>
                  <CardDescription>/{plan.period}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground mb-6 text-center text-sm">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.warning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-yellow-800 text-xs">
                        ⚠️ {plan.warning}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-auto">
                    {plan.showExample && (
                      <Button asChild variant="outline" className="w-full border-purple-500 text-purple-600 hover:bg-purple-50">
                        <Link href="/landing/site-vitrine-exemple">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir un exemple
                        </Link>
                      </Button>
                    )}
                    <Button asChild className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <Link href="/landing/contact">
                        Nous contacter
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              💡 Note : Paiement annuel = 10% de réduction sur le prix total.
            </p>
            <Button asChild variant="link">
              <Link href="/landing/tarifs">
                Voir tous les détails →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2025 Modern CTA Section */}
              <section className="section-padding-2025 gradient-primary relative overflow-hidden modern-bg-pattern">
        <div className="container-2025 text-center">
          <div className="animate-fade-in">
            <h2 className="text-heading-2025 text-white mb-6">
              Prêt à rejoindre le réseau ?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Rejoignez le réseau national des pharmacies tunisiennes et réduisez vos pertes
            </p>
            <Button asChild size="lg" className="text-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 shadow-xl hover:shadow-2xl transition-all duration-200 animate-hover-lift">
              <Link href="/landing/contact">
                Nous contacter
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
} 

