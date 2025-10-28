'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Megaphone, 
  ClipboardList,
  Users,
  BarChart3,
  Archive,
  HelpCircle,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Building2,
  Truck,
  Heart,
  FileText,
  Settings,
  Activity,
  Shield,
  Database,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from './NotificationDropdown';
import { ToastContainer } from './Toast';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    email?: string;
    role?: {
      name?: string;
    };
  };
}

export default function AdminDashboardLayout({ children, user }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['management', 'analytics', 'system']));
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/landing/connexion');
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const navigationSections = [
    {
      id: 'overview',
      title: 'Vue d\'ensemble',
      icon: Home,
      items: [
         {
           name: 'Tableau de bord',
           href: '/dashboard/admin',
           icon: Activity,
           current: pathname === '/dashboard/admin',
           badge: null
         },
        {
          name: 'Analytics',
          href: '/dashboard/admin/analytics',
          icon: BarChart3,
          current: pathname === '/dashboard/admin/analytics',
          badge: null
        }
      ]
    },
    {
      id: 'management',
      title: 'Gestion',
      icon: Settings,
      items: [
        {
          name: 'Pharmacies',
          href: '/dashboard/admin/pharmacies',
          icon: Building2,
          current: pathname === '/dashboard/admin/pharmacies',
          badge: null
        },
        {
          name: 'Fournisseurs',
          href: '/dashboard/admin/fournisseurs',
          icon: Truck,
          current: pathname === '/dashboard/admin/fournisseurs',
          badge: null
        },
        {
          name: 'Comptes',
          href: '/dashboard/admin/comptes',
          icon: Users,
          current: pathname === '/dashboard/admin/comptes',
          badge: null
        },
        {
          name: 'Médicaments',
          href: '/dashboard/admin/medicaments',
          icon: Heart,
          current: pathname === '/dashboard/admin/medicaments',
          badge: null
        },
        {
          name: 'Villes',
          href: '/dashboard/admin/villes',
          icon: Globe,
          current: pathname === '/dashboard/admin/villes',
          badge: null
        }
      ]
    },
    {
      id: 'content',
      title: 'Contenu',
      icon: Megaphone,
      items: [
        {
          name: 'Annonces',
          href: '/dashboard/admin/annonces',
          icon: Megaphone,
          current: pathname === '/dashboard/admin/annonces',
          badge: null
        },
        {
          name: 'Demandes',
          href: '/dashboard/admin/demandes',
          icon: ClipboardList,
          current: pathname === '/dashboard/admin/demandes',
          badge: null
        }
      ]
    },
    {
      id: 'system',
      title: 'Système',
      icon: Shield,
      items: [
        {
          name: 'Audit Logs',
          href: '/dashboard/admin/audit-logs',
          icon: FileText,
          current: pathname === '/dashboard/admin/audit-logs',
          badge: null
        },
        {
          name: 'Santé du Système',
          href: '/dashboard/admin/health',
          icon: Activity,
          current: pathname === '/dashboard/admin/health',
          badge: null
        },
        {
          name: 'Support',
          href: '/dashboard/admin/support',
          icon: HelpCircle,
          current: pathname === '/dashboard/admin/support',
          badge: null
        }
      ]
    },
    {
      id: 'account',
      title: 'Compte',
      icon: User,
      items: [
        {
          name: 'Mon Profil',
          href: '/dashboard/admin/profil',
          icon: User,
          current: pathname === '/dashboard/admin/profil',
          badge: null
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

       {/* Modern Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-2xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 lg:sticky lg:top-0 lg:h-screen flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
      `}>
                {/* Sidebar Header - Fixed at top */}
                <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-slate-200/60 bg-gradient-to-r from-white to-slate-50/50">
          {!sidebarCollapsed && (
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                   <Shield className="h-4 w-4 text-white" />
                 </div>
                 <div>
                   <h1 className="text-base font-bold text-slate-900">Admin</h1>
                   <p className="text-xs text-slate-500">Pharmacie.tn</p>
                 </div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex h-9 w-9 p-0 rounded-lg hover:bg-slate-100 hover:scale-105 transition-all duration-200"
            >
              <Menu className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden h-9 w-9 p-0 rounded-lg hover:bg-slate-100 hover:scale-105 transition-all duration-200"
            >
              <X className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </div>

              {/* Navigation - Scrollable */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
             {navigationSections.map((section, sectionIndex) => {
               const SectionIcon = section.icon;
               const isExpanded = expandedSections.has(section.id);
               
               return (
                 <div key={section.id} className="mb-4">
                   {/* Section Header - Only show in normal mode */}
                   {!sidebarCollapsed && (
                     <button
                       onClick={() => toggleSection(section.id)}
                       className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-200 hover:scale-[1.02]"
                     >
                       <div className="flex items-center space-x-3">
                         <SectionIcon className="h-4 w-4 text-slate-500" />
                         <span>{section.title}</span>
                       </div>
                       <div className="transition-transform duration-200">
                         {isExpanded ? (
                           <ChevronDown className="h-4 w-4 text-slate-400" />
                         ) : (
                           <ChevronRight className="h-4 w-4 text-slate-400" />
                         )}
                       </div>
                     </button>
                   )}

                   {/* Section Items - Normal Mode */}
                   {!sidebarCollapsed && isExpanded && (
                     <div className="ml-3 space-y-0.5 mt-1">
                       {section.items.map((item, itemIndex) => {
                         const Icon = item.icon;
                         return (
                           <Link
                             key={item.name}
                             href={item.href}
                             className={`
                               flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] group
                               ${item.current 
                                 ? 'bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 shadow-sm border-l-2 border-green-500 font-semibold' 
                                 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                               }
                             `}
                             style={{ animationDelay: `${(sectionIndex * 0.1) + (itemIndex * 0.05)}s` }}
                           >
                             <Icon className={`h-4 w-4 flex-shrink-0 transition-all duration-200 ${item.current ? 'text-green-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                             <div className="flex items-center justify-between flex-1">
                               <span className="truncate">{item.name}</span>
                               {item.badge && (
                                 <Badge variant="secondary" className="ml-2 text-xs">
                                   {item.badge}
                                 </Badge>
                               )}
                             </div>
                           </Link>
                         );
                       })}
                     </div>
                   )}
                   
                   {/* Compact Mode - Show all items as icons with tooltips */}
                   {sidebarCollapsed && (
                     <div className="space-y-1">
                       {/* Section indicator in compact mode */}
                       <div className="flex items-center justify-center mb-2">
                         <div className="w-6 h-px bg-slate-300"></div>
                       </div>
                       {section.items.map((item, itemIndex) => {
                         const Icon = item.icon;
                         return (
                           <Link
                             key={item.name}
                             href={item.href}
                             className={`
                               flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] group
                               ${item.current 
                                 ? 'bg-gradient-to-r from-green-50 to-green-100/50 text-green-700 shadow-sm border-l-2 border-green-500 font-semibold' 
                                 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                               }
                             `}
                             title={`${section.title} - ${item.name}`}
                           >
                             <Icon className={`h-4 w-4 flex-shrink-0 transition-all duration-200 ${item.current ? 'text-green-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                           </Link>
                         );
                       })}
                     </div>
                   )}
                 </div>
               );
             })}
           </nav>
         </div>

                {/* User Section - Fixed at bottom */}
                <div className="flex-shrink-0 p-3 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-white">
           <div className="space-y-2">
             {/* Profile */}
             <Link 
               href="/dashboard/admin/profil" 
               className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-[1.02] group"
             >
               <div className="flex-shrink-0">
                 <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                   <User className="h-4 w-4 text-white" />
                 </div>
               </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || user?.email || 'Administrateur'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Super Administrateur
                  </p>
                </div>
              )}
            </Link>
            
             {/* Logout */}
             <Button
               variant="ghost"
               onClick={handleLogout}
               className={`
                 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-[1.02] text-sm py-1.5 px-2
                 ${sidebarCollapsed ? 'justify-center px-2' : ''}
               `}
             >
               <LogOut className="h-4 w-4" />
               {!sidebarCollapsed && <span className="ml-2 font-medium">Déconnexion</span>}
             </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
         {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-10 w-10 p-0 rounded-xl hover:bg-slate-100 hover:scale-105 transition-all duration-200"
              >
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
              
               <div className="hidden sm:block">
                 <h2 className="text-lg font-bold text-slate-900">
                   {pathname === '/dashboard/admin' ? 'Tableau de bord' :
                    pathname.includes('/pharmacies') ? 'Gestion des Pharmacies' :
                    pathname.includes('/fournisseurs') ? 'Gestion des Fournisseurs' :
                    pathname.includes('/comptes') ? 'Gestion des Comptes' :
                    pathname.includes('/medicaments') ? 'Gestion des Médicaments' :
                    pathname.includes('/villes') ? 'Gestion des Villes' :
                    pathname.includes('/annonces-demandes') ? 'Annonces & Demandes' :
                    pathname.includes('/analytics') ? 'Analytiques' :
                    pathname.includes('/audit-logs') ? 'Journaux d\'Audit' :
                    pathname.includes('/health') ? 'Santé du Système' :
                    pathname.includes('/support') ? 'Support' : 'Administration'}
                 </h2>
                 <p className="text-xs text-slate-500">
                   {new Date().toLocaleDateString('fr-FR', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   })}
                 </p>
               </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2 bg-slate-100 rounded-xl px-4 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder-slate-400"
                />
              </div>

              {/* Notifications */}
              <NotificationDropdown />
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-12 w-auto px-4 py-2 rounded-xl hover:bg-slate-100 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.name || user?.email || 'Administrateur'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Super Administrateur
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-semibold">Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard/admin/profil" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard/admin/parametres" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

         {/* Page Content */}
         <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
           <div className="max-w-7xl mx-auto">
             {children}
           </div>
         </main>

        {/* Modern Footer */}
        <footer className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60 py-4 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-slate-500">
                © 2024 Pharmacie.tn. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <a href="#" className="hover:text-slate-700 transition-colors">Aide</a>
                <a href="#" className="hover:text-slate-700 transition-colors">Contact</a>
                <a href="#" className="hover:text-slate-700 transition-colors">Confidentialité</a>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Système opérationnel</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <ToastContainer />
    </div>
  );
}
