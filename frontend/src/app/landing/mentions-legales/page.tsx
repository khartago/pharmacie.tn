import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield, FileText, Phone, Mail, MapPin } from 'lucide-react';

export default function LegalMentionsPage() {
  const currentYear = new Date().getFullYear();

  const companyInfo = [
    {
      icon: Building2,
      title: 'Raison sociale',
      content: 'Pharmacie.tn SARL'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: '123 Avenue Habib Bourguiba, 1000 Tunis, Tunisie'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+216 12 345 678'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@pharmacie.tn'
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Mentions Légales
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Informations légales et réglementaires concernant Pharmacie.tn
            </p>
          </div>
        </div>
      </section>

      {/* Company Info Cards */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {companyInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {info.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {info.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Content */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Mentions Légales
              </CardTitle>
              <CardDescription>
                Informations légales et réglementaires
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">1. Éditeur du site</h2>
                <Card className="bg-muted">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">Raison sociale :</strong> Pharmacie.tn SARL
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">Adresse :</strong> 123 Avenue Habib Bourguiba, 1000 Tunis, Tunisie
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">Téléphone :</strong> +216 12 345 678
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">Email :</strong> contact@pharmacie.tn
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">Capital social :</strong> 50 000 DT
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">RCS Tunis :</strong> B 123456789
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">N° TVA :</strong> TN 12345678
                        </p>
                        <p className="text-muted-foreground mb-2">
                          <strong className="text-foreground">Directeur de publication :</strong> Dr. Ahmed Ben Salem
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">2. Hébergement</h2>
                <Card className="bg-muted">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-2">
                      <strong className="text-foreground">Hébergeur :</strong> OVH SAS
                    </p>
                    <p className="text-muted-foreground mb-2">
                      <strong className="text-foreground">Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France
                    </p>
                    <p className="text-muted-foreground mb-2">
                      <strong className="text-foreground">Téléphone :</strong> +33 9 72 10 10 07
                    </p>
                    <p className="text-muted-foreground mb-2">
                      <strong className="text-foreground">Site web :</strong> www.ovh.com
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">3. Propriété intellectuelle</h2>
                <p className="text-muted-foreground mb-4">
                  L'ensemble des éléments du site Pharmacie.tn (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) 
                  est la propriété exclusive de Pharmacie.tn SARL, sauf mention contraire.
                </p>
                <p className="text-muted-foreground mb-4">
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments 
                  du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">4. Responsabilité</h2>
                <p className="text-muted-foreground mb-4">
                  Pharmacie.tn SARL s'efforce de fournir des informations exactes et à jour sur le site. 
                  Cependant, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations.
                </p>
                <p className="text-muted-foreground mb-4">
                  L'utilisation des informations et contenus disponibles sur l'ensemble du site se fait 
                  sous l'entière responsabilité de l'utilisateur.
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">5. Conformité réglementaire</h2>
                <p className="text-muted-foreground mb-4">
                  Pharmacie.tn respecte strictement :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                  <li>La législation pharmaceutique tunisienne</li>
                  <li>Les réglementations de l'Ordre des Pharmaciens</li>
                  <li>La loi tunisienne sur la protection des données personnelles</li>
                  <li>Le RGPD (Règlement Général sur la Protection des Données)</li>
                  <li>Les normes de sécurité informatique</li>
                </ul>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">6. Cookies et données personnelles</h2>
                <p className="text-muted-foreground mb-4">
                  Le site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
                  Les données personnelles sont collectées et traitées conformément à notre 
                  <a href="/landing/politique-confidentialite" className="text-primary hover:text-primary/80 underline">
                    Politique de Confidentialité
                  </a>.
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">7. Droit applicable</h2>
                <p className="text-muted-foreground mb-4">
                  Le présent site est soumis au droit tunisien. En cas de litige, les tribunaux tunisiens 
                  seront seuls compétents.
                </p>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">8. Contact</h2>
                <p className="text-muted-foreground mb-4">
                  Pour toute question concernant ces mentions légales :
                </p>
                <Card className="bg-muted">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-2">
                      <Mail className="w-4 h-4 text-primary mr-2" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Email :</strong> legal@pharmacie.tn
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Phone className="w-4 h-4 text-primary mr-2" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Téléphone :</strong> +216 12 345 678
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-primary mr-2" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Adresse :</strong> 123 Avenue Habib Bourguiba, 1000 Tunis, Tunisie
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Dernière mise à jour : {currentYear}. Ces mentions légales peuvent être modifiées à tout moment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}