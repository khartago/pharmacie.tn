'use client';

import React, { useState } from 'react';
import PublicLayout from '@/components/PublicLayout';
import { 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/enhanced-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    pharmacie: '',
    sujet: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        pharmacie: '',
        sujet: '',
        message: ''
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+216 12 345 678',
      description: 'Lun-Ven: 8h-18h'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@pharmacie.tn',
      description: 'Réponse sous 24h'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: '123 Avenue Habib Bourguiba, Tunis',
      description: 'Tunisie'
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: 'Lundi - Vendredi',
      description: '8h00 - 18h00'
    }
  ];

  const subjects = [
    'Demande d\'information',
    'Support technique',
    'Demande de démonstration',
    'Partenariat',
    'Autre'
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une question ? Un besoin spécifique ? Notre équipe est là pour vous accompagner
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">
                Informations de contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <info.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {info.title}
                          </h3>
                          <p className="text-foreground font-medium mb-1">
                            {info.content}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Message envoyé !
                      </h3>
                      <p className="text-muted-foreground">
                        Nous vous répondrons dans les plus brefs délais.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nom">Nom complet *</Label>
                          <Input
                            id="nom"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="telephone">Téléphone</Label>
                          <Input
                            id="telephone"
                            name="telephone"
                            type="tel"
                            value={formData.telephone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pharmacie">Nom de la pharmacie</Label>
                          <Input
                            id="pharmacie"
                            name="pharmacie"
                            value={formData.pharmacie}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sujet">Sujet *</Label>
                        <Select name="sujet" value={formData.sujet} onValueChange={(value) => setFormData({...formData, sujet: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un sujet" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Décrivez votre demande..."
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Prêt à rejoindre Pharmacie.tn ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez comment notre plateforme peut transformer vos échanges pharmaceutiques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/landing/tarifs">Voir nos tarifs</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/landing/a-propos">En savoir plus</a>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}