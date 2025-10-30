'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { AuthAPI } from '@/lib/api';
import { 
  Eye, 
  EyeOff,
  Lock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await AuthAPI.login(formData);
      if (response.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on user role
        if (response.data.user?.role?.name === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (response.data.user?.role?.name === 'PHARMACY') {
          router.push('/dashboard/pharmacie');
        } else if (response.data.user?.role?.name === 'SUPPLIER') {
          router.push('/dashboard/fournisseur');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(response.error || 'Email ou mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'pharmacy' | 'supplier') => {
    const credentials = {
      admin: { email: 'admin@pharmacie.tn', password: 'password123' },
      pharmacy: { email: 'pharmacy.carthage@pharmacie.tn', password: 'password123' },
      supplier: { email: 'supplier.medical@pharmacie.tn', password: 'password123' }
    };
    setFormData(credentials[type]);
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
              Connexion
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Accédez à votre espace Pharmacie.tn
            </p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Accédez à votre espace Pharmacie.tn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-11"
                      placeholder="votre@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-11 pr-11"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href="/landing/mot-de-passe-oublie"
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comptes de démonstration</CardTitle>
              <CardDescription>
                Utilisez ces comptes pour tester la plateforme (mot de passe: password123)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillDemoCredentials('admin')}
              >
                <User className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Administrateur</div>
                  <div className="text-xs text-muted-foreground">admin@pharmacie.tn</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillDemoCredentials('pharmacy')}
              >
                <User className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Pharmacie Carthage</div>
                  <div className="text-xs text-muted-foreground">pharmacy.carthage@pharmacie.tn</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillDemoCredentials('supplier')}
              >
                <User className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Fournisseur Médical Plus</div>
                  <div className="text-xs text-muted-foreground">supplier.medical@pharmacie.tn</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Additional Test Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Autres comptes de test</CardTitle>
              <CardDescription>
                Plus d'utilisateurs pour tester différents scénarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Pharmacies (20 comptes)</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• pharmacy.tunis@pharmacie.tn (Pharmacie Tunis Centre)</div>
                  <div>• pharmacy.sousse@pharmacie.tn (Pharmacie Sousse Centre)</div>
                  <div>• pharmacy.sfax@pharmacie.tn (Pharmacie Sfax Centre)</div>
                  <div>• pharmacy.bizerte@pharmacie.tn (Pharmacie Bizerte)</div>
                  <div>• pharmacy.nabeul@pharmacie.tn (Pharmacie Nabeul)</div>
                  <div className="text-muted-foreground/70">... et 15 autres pharmacies</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Fournisseurs (10 comptes)</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• supplier.sante@pharmacie.tn (Distributeur Santé Tunisie)</div>
                  <div>• supplier.import@pharmacie.tn (Importateur Médicaments)</div>
                  <div>• supplier.grossiste@pharmacie.tn (Grossiste Pharmaceutique)</div>
                  <div>• supplier.central@pharmacie.tn (Distributeur Central)</div>
                  <div className="text-muted-foreground/70">... et 6 autres fournisseurs</div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>Note:</strong> Tous les comptes utilisent le mot de passe <code className="bg-muted px-1 rounded">password123</code>
              </div>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link href="/landing/contact" className="text-primary hover:text-primary/80">
                Contactez-nous
              </Link>
            </p>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}