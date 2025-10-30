'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { 
  Mail,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary">Pharmacie</span>
                <span className="text-2xl font-bold text-foreground">.tn</span>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              Mot de passe oublié
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Réinitialisation du mot de passe</CardTitle>
              <CardDescription>
                Nous vous enverrons un lien pour créer un nouveau mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Email envoyé !
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Si un compte existe avec l'adresse <strong>{email}</strong>, 
                    vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
                  </p>
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link href="/landing/connexion">
                        Retour à la connexion
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/">
                        Retour à l'accueil
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="pl-11"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <Link
              href="/landing/connexion"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
            <p className="text-sm text-muted-foreground">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link href="/landing/connexion" className="text-primary hover:text-primary/80">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}