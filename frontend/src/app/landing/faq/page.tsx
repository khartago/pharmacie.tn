'use client';

import React, { useState } from 'react';
import PublicLayout from '@/components/PublicLayout';
import { 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  DollarSign,
  ShieldCheck,
  Settings,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FAQPage() {
  const [openCategories, setOpenCategories] = useState<string[]>(['general']);

  const faqData = {
    general: {
      title: 'Général',
      icon: HelpCircle,
      questions: [
        {
          question: 'Qu\'est-ce que Pharmacie.tn ?',
          answer: 'Pharmacie.tn est une plateforme B2B qui facilite les échanges de médicaments à date proche entre pharmacies et les retours fournisseurs. Elle respecte strictement la législation pharmaceutique tunisienne.'
        },
        {
          question: 'Qui peut utiliser Pharmacie.tn ?',
          answer: 'La plateforme est destinée exclusivement aux pharmacies d\'officine et aux fournisseurs pharmaceutiques en Tunisie. Les patients n\'ont pas accès à la plateforme.'
        },
        {
          question: 'Comment fonctionne la plateforme ?',
          answer: 'Les pharmacies peuvent publier des annonces pour échanger des médicaments à date proche ou faire des demandes de médicaments manquants. La plateforme facilite les échanges et les retours fournisseurs.'
        },
        {
          question: 'La plateforme est-elle conforme à la législation ?',
          answer: 'Oui, Pharmacie.tn respecte strictement la législation pharmaceutique tunisienne et l\'Ordre des Pharmaciens. Aucune gestion de stock ou de prix public n\'est proposée.'
        }
      ]
    },
    pricing: {
      title: 'Tarifs et Paiements',
      icon: DollarSign,
      questions: [
        {
          question: 'Quels sont les tarifs de Pharmacie.tn ?',
          answer: 'Nous proposons : Pack Standard (20 DT/mois), Option Email Pro (+10 DT/mois), Option Site Vitrine (+10 DT/mois), et Pack Complet (35 DT/mois). Le paiement annuel offre 10% de réduction.'
        },
        {
          question: 'Y a-t-il des frais cachés ?',
          answer: 'Non, tous nos tarifs sont transparents. Le prix affiché inclut toutes les fonctionnalités mentionnées. Aucun frais supplémentaire n\'est appliqué.'
        },
        {
          question: 'Puis-je essayer gratuitement ?',
          answer: 'Oui, nous proposons un essai gratuit de 14 jours sans engagement et sans carte bancaire. Vous avez accès à toutes les fonctionnalités pendant cette période.'
        },
        {
          question: 'Comment fonctionne le paiement annuel ?',
          answer: 'Le paiement annuel vous fait économiser 10% sur votre abonnement. Vous payez 12 mois d\'avance et bénéficiez d\'un engagement d\'un an.'
        }
      ]
    },
    security: {
      title: 'Sécurité et Conformité',
      icon: ShieldCheck,
      questions: [
        {
          question: 'Mes données sont-elles protégées ?',
          answer: 'Absolument. Nous utilisons un chiffrement de bout en bout, des sauvegardes automatiques et respectons scrupuleusement le RGPD et la loi tunisienne sur la protection des données personnelles.'
        },
        {
          question: 'La plateforme est-elle conforme aux réglementations pharmaceutiques ?',
          answer: 'Oui, Pharmacie.tn respecte toutes les réglementations pharmaceutiques tunisiennes et l\'Ordre des Pharmaciens. Aucune gestion de stock ou de prix public n\'est proposée.'
        },
        {
          question: 'Comment garantissez-vous la traçabilité des échanges ?',
          answer: 'Chaque échange est enregistré avec un numéro de lot, une date d\'expiration et un suivi complet, conformément aux exigences légales et à l\'Ordre des Pharmaciens.'
        },
        {
          question: 'Que se passe-t-il en cas de problème de sécurité ?',
          answer: 'Nous avons mis en place des procédures d\'urgence et une équipe de sécurité disponible 24h/24. Tous les incidents sont traités avec la plus haute priorité.'
        }
      ]
    },
    technical: {
      title: 'Aspect Technique',
      icon: Settings,
      questions: [
        {
          question: 'Quels sont les prérequis techniques ?',
          answer: 'Aucun ! Pharmacie.tn fonctionne sur tous les navigateurs modernes. Une connexion internet suffit. Aucune installation de logiciel n\'est nécessaire.'
        },
        {
          question: 'La plateforme est-elle accessible sur mobile ?',
          answer: 'Oui, Pharmacie.tn est entièrement responsive et optimisée pour les smartphones et tablettes. Vous pouvez gérer votre pharmacie depuis n\'importe où.'
        },
        {
          question: 'Comment se déroule la formation ?',
          answer: 'Nous proposons une formation personnalisée de 2 heures, des tutoriels vidéo et un support continu. Notre équipe vous accompagne jusqu\'à la maîtrise complète.'
        },
        {
          question: 'Puis-je intégrer Pharmacie.tn avec mon système existant ?',
          answer: 'Oui, nous proposons des API et des intégrations personnalisées selon vos besoins spécifiques. Contactez-nous pour discuter de votre projet.'
        }
      ]
    },
    support: {
      title: 'Support et Formation',
      icon: Users,
      questions: [
        {
          question: 'Quel type de support proposez-vous ?',
          answer: 'Support par email, téléphone et chat en direct. Formation personnalisée, documentation complète et webinaires réguliers. Support prioritaire pour les abonnements Premium.'
        },
        {
          question: 'Combien de temps faut-il pour être opérationnel ?',
          answer: 'La plupart des pharmacies sont opérationnelles en 24-48h après l\'inscription. Nous vous accompagnons personnellement pour une mise en route rapide.'
        },
        {
          question: 'Proposez-vous des formations avancées ?',
          answer: 'Oui, nous organisons des sessions de formation avancée, des ateliers thématiques et des webinaires spécialisés pour optimiser l\'utilisation de la plateforme.'
        },
        {
          question: 'Comment puis-je contacter le support ?',
          answer: 'Email : support@pharmacie.tn, Téléphone : +216 12 345 678, Chat en direct sur la plateforme. Réponse garantie sous 24h.'
        }
      ]
    }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleQuestion = () => {
    // This would need to be implemented if you want individual question toggles
    // For now, we'll keep the category-based approach
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Questions fréquentes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trouvez les réponses à vos questions sur Pharmacie.tn
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {Object.entries(faqData).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <Button
                    variant="ghost"
                    onClick={() => toggleCategory(key)}
                    className="w-full justify-between p-0 h-auto"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                        <CardDescription>
                          {category.questions.length} questions
                        </CardDescription>
                      </div>
                    </div>
                    {openCategories.includes(key) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </CardHeader>
                
                {openCategories.includes(key) && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {category.questions.map((faq, index) => (
                        <div key={index} className="border-l-2 border-primary/20 pl-4">
                          <h3 className="font-semibold text-foreground mb-2">
                            {faq.question}
                          </h3>
                          <p className="text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Notre équipe est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/landing/contact">Nous contacter</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/landing/tarifs">Voir nos tarifs</a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}