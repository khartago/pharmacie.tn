'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'À propos', href: '/landing/a-propos' },
    { name: 'Tarifs', href: '/landing/tarifs' },
    { name: 'FAQ', href: '/landing/faq' },
    { name: 'Contact', href: '/landing/contact' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Pharmacie</span>
            <span className="text-xl font-bold text-foreground">.tn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-primary bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/landing/connexion">
                Connexion
              </Link>
            </Button>
            <Button asChild>
              <Link href="/landing/contact">
                Nous contacter
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 p-0"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200',
                    isActive(item.href)
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link
                    href="/landing/connexion"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link
                    href="/landing/contact"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Nous contacter
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;