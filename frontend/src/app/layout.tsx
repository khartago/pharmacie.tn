import type { Metadata } from 'next';
import './globals.css';

// Use system fonts for static export compatibility
const fontClass = 'font-sans';

export const metadata: Metadata = {
  title: 'Pharmacie.tn - Plateforme de Gestion Pharmaceutique',
  description: 'Plateforme de gestion et d\'échange pharmaceutique en Tunisie',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={fontClass}>
        {children}
      </body>
    </html>
  );
} 