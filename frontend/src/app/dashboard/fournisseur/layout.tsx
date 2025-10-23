'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FournisseurDashboardLayout from '@/components/FournisseurDashboardLayout';

export default function FournisseurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and role
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      router.push('/connexion');
      return;
    }

    const user = JSON.parse(userData);
    if (user?.role?.name !== 'SUPPLIER') {
      // Redirect to appropriate dashboard based on role
      if (user?.role?.name === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (user?.role?.name === 'PHARMACY') {
        router.push('/dashboard/pharmacie');
      } else {
        router.push('/connexion');
      }
    }
  }, [router]);

  return <FournisseurDashboardLayout>{children}</FournisseurDashboardLayout>;
}
