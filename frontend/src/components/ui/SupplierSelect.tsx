'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}

interface SupplierSelectProps {
  value?: string;
  onChange: (value: string, supplier?: Supplier) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function SupplierSelect({
  value = '',
  onChange,
  placeholder = 'Sélectionner ou saisir un fournisseur...',
  error,
  disabled = false,
  className,
}: SupplierSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load suppliers on mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Load suppliers from API
  const loadSuppliers = async () => {
    setLoading(true);
    try {
      // Use a public endpoint for suppliers that doesn't require admin rights
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSuppliers(data.data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Search suppliers with debounce
  const searchSuppliers = async (query: string) => {
    if (!query || query.length < 1) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/suppliers?search=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSuppliers(data.data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to search suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm && searchTerm.length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        searchSuppliers(searchTerm);
      }, 300);
    } else {
      loadSuppliers();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // If user clears the input, clear selection
    if (!newValue) {
      setSelectedSupplier(null);
      onChange('', undefined);
    } else {
      // Check if the input matches a supplier name
      const matchingSupplier = suppliers.find(s => 
        s.name.toLowerCase() === newValue.toLowerCase() ||
        s.companyName?.toLowerCase() === newValue.toLowerCase()
      );
      
      if (matchingSupplier) {
        setSelectedSupplier(matchingSupplier);
        onChange(newValue, matchingSupplier);
      } else {
        setSelectedSupplier(null);
        onChange(newValue, undefined);
      }
    }
  };

  // Handle supplier selection from dropdown
  const handleSupplierSelect = (supplier: Supplier) => {
    setSearchTerm(supplier.name);
    setSelectedSupplier(supplier);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(supplier.name, supplier);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suppliers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suppliers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suppliers.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suppliers[highlightedIndex]) {
          handleSupplierSelect(suppliers[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear selection
  const handleClear = () => {
    setSearchTerm('');
    setSelectedSupplier(null);
    setIsOpen(false);
    onChange('', undefined);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white",
            className
          )}
        />
        <ChevronDown className="absolute right-3 top-2.5 text-gray-400 h-4 w-4 pointer-events-none" />
        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-2.5 flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-8 top-2.5 flex items-center justify-center w-4 h-4">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Recherche en cours...
            </div>
          ) : suppliers.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                Fournisseurs sur la plateforme
              </div>
              {suppliers.map((supplier, index) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => handleSupplierSelect(supplier)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0",
                    index === highlightedIndex ? "bg-gray-50" : ""
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {supplier.name}
                      </div>
                      {supplier.companyName && (
                        <div className="text-sm text-gray-600 truncate">
                          {supplier.companyName}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 truncate">
                        {supplier.email}
                      </div>
                    </div>
                    {selectedSupplier?.id === supplier.id && (
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </button>
              ))}
              <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                Ou saisissez manuellement un fournisseur externe
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Aucun fournisseur trouvé
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
