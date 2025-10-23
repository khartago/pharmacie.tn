import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      icon: Database,
      title: 'Collecte des informations',
      content: 'Nous collectons uniquement les informations nécessaires au fonctionnement de la plateforme et à la conformité légale.'
    },
    {
      icon: Lock,
      title: 'Protection des données',
      content: 'Chiffrement de bout en bout, sauvegardes sécurisées et respect strict du RGPD et de la loi tunisienne.'
    },
    {
      icon: Users,
      title: 'Partage des informations',
      content: 'Aucun partage avec des tiers sans votre consentement explicite, sauf obligations légales.'
    },
    {
      icon: Eye,
      title: 'Vos droits',
      content: 'Accès, rectification, suppression et portabilité de vos données personnelles.'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comment nous protégeons et utilisons vos données personnelles
            </p>
          </div>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {sections.map((section, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Politique de Confidentialité
              </CardTitle>
              <CardDescription>
                Dernière mise à jour : {currentYear}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="mb-8">
                <p className="text-muted-foreground mb-4">
                  Pharmacie.tn SARL ("nous", "notre", "nos") s'engage à protéger votre vie privée. 
                  Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">1. Collecte des informations</h2>
                <p className="text-muted-foreground mb-4">
                  Nous collectons les informations suivantes :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li><strong className="text-foreground">Informations d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                  <li><strong className="text-foreground">Informations professionnelles :</strong> nom de la pharmacie, numéro d'autorisation, adresse</li>
                  <li><strong className="text-foreground">Informations de connexion :</strong> adresse IP, données de navigation, cookies</li>
                  <li><strong className="text-foreground">Données d'utilisation :</strong> interactions avec la plateforme, échanges de médicaments</li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">2. Utilisation des données</h2>
                <p className="text-muted-foreground mb-4">
                  Nous utilisons vos données pour :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Fournir et améliorer nos services</li>
                  <li>Faciliter les échanges entre pharmacies</li>
                  <li>Assurer la conformité réglementaire</li>
                  <li>Communiquer avec vous sur nos services</li>
                  <li>Protéger la sécurité de la plateforme</li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">3. Protection des données</h2>
                <p className="text-muted-foreground mb-4">
                  Nous mettons en place des mesures de sécurité strictes :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Chiffrement SSL/TLS pour toutes les communications</li>
                  <li>Sauvegardes automatiques et sécurisées</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Formation du personnel à la protection des données</li>
                  <li>Audits de sécurité réguliers</li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">4. Partage des informations</h2>
                <p className="text-muted-foreground mb-4">
                  Nous ne partageons vos données qu'avec :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Les autres pharmacies du réseau (avec votre consentement)</li>
                  <li>Les autorités compétentes (obligations légales)</li>
                  <li>Nos prestataires techniques (sous contrat de confidentialité)</li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">5. Vos droits</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément au RGPD et à la loi tunisienne, vous avez le droit de :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Accéder à vos données personnelles</li>
                  <li>Rectifier les informations inexactes</li>
                  <li>Demander la suppression de vos données</li>
                  <li>Limiter le traitement de vos données</li>
                  <li>Demander la portabilité de vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">6. Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Nous utilisons des cookies pour :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>Assurer le bon fonctionnement de la plateforme</li>
                  <li>Mémoriser vos préférences</li>
                  <li>Analyser l'utilisation de la plateforme</li>
                  <li>Améliorer la sécurité</li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">7. Contact</h2>
                <p className="text-muted-foreground mb-4">
                  Pour toute question concernant cette politique de confidentialité :
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Email :</strong> privacy@pharmacie.tn<br />
                    <strong className="text-foreground">Téléphone :</strong> +216 12 345 678<br />
                    <strong className="text-foreground">Adresse :</strong> 123 Avenue Habib Bourguiba, 1000 Tunis, Tunisie
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Cette politique de confidentialité peut être mise à jour. Nous vous informerons de tout changement important.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}