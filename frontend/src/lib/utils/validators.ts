'use client';

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Tunisian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+216|00216|216)?[2-9][0-9]{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Password validation
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Required field validation
export function isRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined;
}

// Date validation
export function isValidDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

// Future date validation
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return dateObj > now;
}

// Quantity validation
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}

// Medicine name validation
export function isValidMedicineName(name: string): boolean {
  return name.trim().length >= 2;
}

// Address validation
export function isValidAddress(address: string): boolean {
  return address.trim().length >= 5;
}

// Company name validation
export function isValidCompanyName(name: string): boolean {
  return name.trim().length >= 2;
}

// Form validation helper
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => string | null>
): Record<keyof T, string> {
  const errors: Record<keyof T, string> = {} as Record<keyof T, string>;
  
  Object.keys(rules).forEach((key) => {
    const rule = rules[key as keyof T];
    const value = data[key as keyof T];
    const error = rule(value);
    
    if (error) {
      errors[key as keyof T] = error;
    }
  });
  
  return errors;
}

// Common validation rules
export const validationRules = {
  required: (value: any) => {
    if (!isRequired(value)) {
      return 'Ce champ est requis';
    }
    return null;
  },
  
  email: (value: string) => {
    if (value && !isValidEmail(value)) {
      return 'Format d\'email invalide';
    }
    return null;
  },
  
  phone: (value: string) => {
    if (value && !isValidPhone(value)) {
      return 'Format de téléphone invalide';
    }
    return null;
  },
  
  password: (value: string) => {
    if (value) {
      const { isValid, errors } = isValidPassword(value);
      if (!isValid) {
        return errors[0];
      }
    }
    return null;
  },
  
  futureDate: (value: string | Date) => {
    if (value && !isFutureDate(value)) {
      return 'La date doit être dans le futur';
    }
    return null;
  },
  
  positiveNumber: (value: number) => {
    if (value !== undefined && value <= 0) {
      return 'La valeur doit être positive';
    }
    return null;
  },
  
  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Minimum ${min} caractères`;
    }
    return null;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `Maximum ${max} caractères`;
    }
    return null;
  },
};
