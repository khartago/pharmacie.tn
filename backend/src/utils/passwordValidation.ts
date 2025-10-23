import validator from 'validator';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordValidation {
  /**
   * Validate password against policy
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    // Check minimum length
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  /**
   * Generate a strong password suggestion
   */
  static generatePasswordSuggestion(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';

    // Ensure at least one of each required character type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest with random characters
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Check if password is common/weak
   */
  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'password1', '12345678', 'qwerty123',
      'admin123', 'password123', '123456789', 'qwerty', 'abc123'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Comprehensive password validation
   */
  static validatePasswordComprehensive(password: string): PasswordValidationResult {
    const basicValidation = this.validatePassword(password);
    
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // Check for common passwords
    if (this.isCommonPassword(password)) {
      basicValidation.errors.push('Ce mot de passe est trop commun, veuillez en choisir un autre');
      basicValidation.isValid = false;
    }

    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) {
      basicValidation.errors.push('Le mot de passe ne doit pas contenir de caractères répétés consécutifs');
      basicValidation.isValid = false;
    }

    return basicValidation;
  }
} 