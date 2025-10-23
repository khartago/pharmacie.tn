'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardLayout from '@/components/AdminDashboardLayout';

export default function AdminLayout({
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
    if (user?.role?.name !== 'ADMIN') {
      // Redirect to appropriate dashboard based on role
      if (user?.role?.name === 'PHARMACY') {
        router.push('/dashboard/pharmacie');
      } else if (user?.role?.name === 'SUPPLIER') {
        router.push('/dashboard/fournisseur');
      } else {
        router.push('/connexion');
      }
    }
  }, [router]);

  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
