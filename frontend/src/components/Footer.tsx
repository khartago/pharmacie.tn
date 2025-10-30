import React from 'react';
import Link from 'next/link';
import { Facebook, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative mt-0 mb-0">
      <div className="container-2025 pt-28 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-primary">Pharmacie</span>
              <span className="text-xl font-bold text-white">.tn</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Plateforme de gestion et d'échange pharmaceutique en Tunisie. 
              Connectons les pharmacies et les fournisseurs pour optimiser la distribution des médicaments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Facebook</span>
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/landing/a-propos" className="text-gray-300 hover:text-white transition-colors duration-200">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/landing/tarifs" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/landing/faq" className="text-gray-300 hover:text-white transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/landing/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/landing/mentions-legales" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/landing/politique-confidentialite" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/landing/connexion" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Pharmacie.tn. Tous droits réservés.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Conçu et développé en{' '}
              <span className="font-semibold bg-gradient-to-r from-red-600 to-white bg-clip-text text-transparent">
                Tunisie
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;