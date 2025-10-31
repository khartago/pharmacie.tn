'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { MedicinesAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Medicine {
  id: number;
  dci: string;
  brandName: string;
  dosage: string;
  form: string;
  laboratoire: string;
  atcCode?: string;
}

interface MedicineAutocompleteProps {
  value?: string;
  onChange: (value: string, medicine?: Medicine) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export default function MedicineAutocomplete({
  value = '',
  onChange,
  placeholder = 'Rechercher un médicament...',
  error,
  disabled = false,
  className,
}: MedicineAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format medicine name for display
  const formatMedicineName = (medicine: Medicine): string => {
    const parts = [];
    
    if (medicine.brandName && medicine.brandName.trim()) {
      parts.push(medicine.brandName);
    }
    
    if (medicine.dci && medicine.dci.trim()) {
      parts.push(`(${medicine.dci})`);
    }
    
    if (medicine.dosage && medicine.dosage.trim()) {
      parts.push(`- ${medicine.dosage}`);
    }
    
    if (medicine.form && medicine.form.trim()) {
      parts.push(medicine.form);
    }
    
    return parts.join(' ');
  };

  // Search medicines with debounce
  const searchMedicines = async (query: string) => {
    if (!query || query.length < 2) {
      setMedicines([]);
      return;
    }

    setLoading(true);
    try {
      const response = await MedicinesAPI.search({ query });
      if (response.success && response.data) {
        // Support both { data: { medicines, pagination } } and { data: { data, pagination } }
        const list = (response as any).data?.medicines ?? (response as any).data?.data ?? [];
        setMedicines(list);
      }
    } catch (error) {
      console.error('Failed to search medicines:', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchMedicines(searchTerm);
    }, 300);

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
      setSelectedMedicine(null);
      onChange('', undefined);
    }
  };

  // Handle medicine selection
  const handleMedicineSelect = (medicine: Medicine) => {
    const formattedName = formatMedicineName(medicine);
    setSearchTerm(formattedName);
    setSelectedMedicine(medicine);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(formattedName, medicine);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || medicines.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < medicines.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : medicines.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && medicines[highlightedIndex]) {
          handleMedicineSelect(medicines[highlightedIndex]);
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
    setSelectedMedicine(null);
    setIsOpen(false);
    onChange('', undefined);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none z-10">
          <Search className="text-gray-400 h-4 w-4 flex-shrink-0" />
        </div>
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
            "flex h-10 w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm leading-normal",
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white",
            className
          )}
        />
        {searchTerm && !disabled && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-0 bottom-0 flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded z-10 my-auto"
          >
            <X className="h-4 w-4 flex-shrink-0" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-0 bottom-0 flex items-center justify-center w-4 h-4 pointer-events-none z-10 my-auto">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
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
          ) : medicines.length > 0 ? (
            medicines.map((medicine, index) => (
              <button
                key={medicine.id}
                type="button"
                onClick={() => handleMedicineSelect(medicine)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0",
                  index === highlightedIndex ? "bg-gray-50" : ""
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {medicine.brandName || medicine.dci}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {medicine.dci && medicine.brandName && `DCI: ${medicine.dci}`}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {[medicine.dosage, medicine.form, medicine.laboratoire]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  </div>
                  {selectedMedicine?.id === medicine.id && (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              Aucun médicament trouvé pour "{searchTerm}"
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Tapez au moins 2 caractères pour rechercher
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
