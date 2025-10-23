'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      
      // Redirect based on user role
      if (user?.role?.name === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (user?.role?.name === 'PHARMACY') {
        router.push('/dashboard/pharmacie');
      } else if (user?.role?.name === 'SUPPLIER') {
        router.push('/dashboard/fournisseur');
      } else {
        // Default fallback - redirect to login
        router.push('/connexion');
      }
    } else {
      // No user data - redirect to login
      router.push('/connexion');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirection en cours...</p>
      </div>
    </div>
  );
} 