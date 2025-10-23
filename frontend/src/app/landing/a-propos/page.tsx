import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import { 
  Lightbulb, 
  Eye, 
  ShieldCheck,
  Users,
  BarChart3,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Sécurité',
      description: 'Protection des données et conformité à la législation pharmaceutique tunisienne'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Entraide entre pharmacies et relations avec les fournisseurs'
    },
    {
      icon: BarChart3,
      title: 'Innovation',
      description: 'Outils modernes, simples et efficaces pour les échanges pharmaceutiques'
    },
    {
      icon: Heart,
      title: 'Service',
      description: 'Support humain et accompagnement continu des pharmacies'
    }
  ];

  const team = [
    {
      name: 'Dr. Ahmed Ben Ali',
      role: 'Fondateur & CEO',
      description: 'Pharmacien avec 15 ans d\'expérience dans le secteur pharmaceutique tunisien'
    },
    {
      name: 'Dr. Fatma Khelil',
      role: 'Directrice Technique',
      description: 'Spécialiste en systèmes d\'information pharmaceutique et conformité réglementaire'
    },
    {
      name: 'M. Youssef Trabelsi',
      role: 'Responsable Développement',
      description: 'Expert en solutions digitales pour le secteur de la santé'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Création de Pharmacie.tn',
      description: 'Lancement de la plateforme avec les premières pharmacies pilotes'
    },
    {
      year: '2024',
      title: 'Expansion nationale',
      description: 'Déploiement dans toutes les régions de Tunisie'
    },
    {
      year: '2025',
      title: 'Innovation continue',
      description: 'Nouvelles fonctionnalités et intégrations avancées'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              À propos de Pharmacie.tn
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Votre partenaire pour la digitalisation des échanges pharmaceutiques en Tunisie
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Notre Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Pharmacie.tn a pour mission de digitaliser le secteur pharmaceutique tunisien en respectant 
                la législation, en facilitant les échanges de médicaments à date proche et les retours fournisseurs.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Nous créons un réseau national de pharmacies pour réduire les pertes de médicaments 
                et optimiser les échanges entre professionnels du secteur.
              </p>
              <p className="text-lg text-muted-foreground">
                Notre objectif est de devenir la référence nationale en matière d'échanges pharmaceutiques, 
                en respectant les plus hauts standards de conformité légale et de sécurité.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Nos engagements</CardTitle>
                <CardDescription>
                  Des valeurs qui guident notre action quotidienne
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Conformité totale</strong> - Respect strict de la législation pharmaceutique tunisienne
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Sécurité des données</strong> - Protection maximale des informations sensibles
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Support continu</strong> - Accompagnement personnalisé de chaque pharmacie
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Innovation constante</strong> - Amélioration continue de la plateforme
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Nos valeurs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident notre action au service des pharmacies tunisiennes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Notre équipe
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des professionnels passionnés par l'innovation pharmaceutique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Notre parcours
            </h2>
            <p className="text-xl text-muted-foreground">
              L'évolution de Pharmacie.tn depuis sa création
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{milestone.year}</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
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
            Rejoignez l'avenir des pharmacies tunisiennes
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Découvrez comment Pharmacie.tn peut transformer votre pharmacie
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/landing/contact">Commencer maintenant</a>
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