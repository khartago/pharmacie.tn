'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  ShoppingCart, 
  Archive,
  HelpCircle, 
  User,
  LogOut,
  Menu,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from './NotificationDropdown';
import { ToastContainer } from './Toast';

interface FournisseurDashboardLayoutProps {
  children: React.ReactNode;
}

export default function FournisseurDashboardLayout({ children }: FournisseurDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/landing/connexion');
  };

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard/fournisseur', icon: Home, current: pathname === '/dashboard/fournisseur' },
    { name: 'Demandes', href: '/dashboard/fournisseur/demandes', icon: ShoppingCart, current: pathname.startsWith('/dashboard/fournisseur/demandes') },
    { name: 'Retours', href: '/dashboard/fournisseur/retours', icon: Archive, current: pathname.startsWith('/dashboard/fournisseur/retours') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard/fournisseur" className="flex items-center">
              <span className="text-xl font-bold text-primary">Pharmacie</span>
              <span className="text-xl font-bold text-foreground">.tn</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-12 w-auto px-4 py-2 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name || 'Fournisseur'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Fournisseur
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-semibold">Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard/fournisseur/profil')} className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-gray-600" />
                    <span>Mon profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/fournisseur/support')} className="flex items-center cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4 text-gray-600" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {sidebarOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-2 py-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-md ${
                      item.current ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
