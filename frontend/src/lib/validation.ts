/**
 * Validation utilities for form inputs
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Tunisian phone number format: +216 or 0 followed by 8 digits starting with 2-9
  const phoneRegex = /^(\+216|0)?[2-9]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return value.trim() !== '';
  return false;
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateTunisianPhone = (phone: string): boolean => {
  // Remove all spaces and validate Tunisian format
  const cleanPhone = phone.replace(/\s/g, '');
  return /^(\+216|0)?[2-9]\d{7}$/.test(cleanPhone);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\s/g, '');
  if (cleanPhone.startsWith('+216')) {
    return cleanPhone;
  } else if (cleanPhone.startsWith('0')) {
    return '+216' + cleanPhone.substring(1);
  } else if (cleanPhone.length === 8) {
    return '+216' + cleanPhone;
  }
  return cleanPhone;
};

