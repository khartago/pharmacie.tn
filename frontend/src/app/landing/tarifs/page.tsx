import React from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { 
  CheckCircle, 
  X,
  Star,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
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
      notIncluded: [
        'Email professionnel',
        'Site vitrine',
        'Support prioritaire'
      ],
      popular: false,
      recommended: false,
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
      notIncluded: [
        'Site vitrine',
        'Support prioritaire'
      ],
      popular: false,
      recommended: false,
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
      notIncluded: [
        'Email professionnel',
        'Support prioritaire'
      ],
      popular: false,
      recommended: false,
      color: 'purple',
      warning: 'Cette option est disponible uniquement en complément du Pack Standard'
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
      notIncluded: [],
      popular: true,
      recommended: true,
      color: 'green'
    }
  ];

  const benefits = [
    {
      title: 'Essai gratuit 14 jours',
      description: 'Testez toutes les fonctionnalités sans engagement',
      icon: CheckCircle
    },
    {
      title: 'Paiement annuel -10%',
      description: 'Économisez 10% en payant 12 mois d\'avance',
      icon: CheckCircle
    },
    {
      title: 'Support dédié',
      description: 'Assistance personnalisée pour votre pharmacie',
      icon: CheckCircle
    },
    {
      title: 'Conformité garantie',
      description: 'Respect total de la législation pharmaceutique',
      icon: CheckCircle
    }
  ];

  const faqs = [
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez modifier votre abonnement à tout moment depuis votre espace personnel.'
    },
    {
      question: 'Y a-t-il des frais de configuration ?',
      answer: 'Non, aucun frais de configuration. L\'installation et la formation sont incluses.'
    },
    {
      question: 'Que se passe-t-il après l\'essai gratuit ?',
      answer: 'Vous pouvez continuer avec l\'abonnement de votre choix ou arrêter sans frais.'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Tarifs transparents
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choisissez l'offre qui correspond à vos besoins. Tous nos tarifs sont transparents, sans frais cachés.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  plan.recommended 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 text-primary mr-2" />
                      Inclus
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Not Included */}
                  {plan.notIncluded.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center">
                        <X className="w-4 h-4 text-muted-foreground mr-2" />
                        Non inclus
                      </h4>
                      <ul className="space-y-2">
                        {plan.notIncluded.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start text-sm">
                            <X className="w-4 h-4 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warning */}
                  {plan.warning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <Info className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800">{plan.warning}</p>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    className="w-full" 
                    variant={plan.recommended ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/landing/contact">
                      {plan.name === 'Pack Complet' ? 'Commencer' : 'En savoir plus'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Pourquoi choisir Pharmacie.tn ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des avantages concrets pour votre pharmacie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Questions fréquentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Tout ce que vous devez savoir sur nos tarifs
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez les pharmacies qui ont déjà choisi Pharmacie.tn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/landing/contact">Commencer l'essai gratuit</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/landing/a-propos">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}