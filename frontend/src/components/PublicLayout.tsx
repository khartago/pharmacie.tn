import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default PublicLayout; 