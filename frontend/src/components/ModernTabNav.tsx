'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  key: string;
  label: string;
  count?: number;
  badge?: string;
}

export interface ModernTabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export default function ModernTabNav({
  tabs,
  activeTab,
  onTabChange,
  className
}: ModernTabNavProps) {
  return (
    <div className={cn("border-b border-border", className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 hover-lift whitespace-nowrap',
              activeTab === tab.key
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-muted/50'
            )}
          >
            <span className="flex items-center space-x-2">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  tab.badge === 'warning' && "bg-yellow-100 text-yellow-800",
                  tab.badge === 'error' && "bg-red-100 text-red-800",
                  tab.badge === 'success' && "bg-green-100 text-green-800",
                  tab.badge === 'info' && "bg-blue-100 text-blue-800"
                )}>
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
