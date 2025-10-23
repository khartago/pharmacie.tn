import crypto from 'crypto';

export class PasswordGenerator {
  /**
   * Generate a secure random password
   * @param length - Password length (default: 12)
   * @returns Secure password with uppercase, lowercase, numbers, and symbols
   */
  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    
    // Ensure at least one character from each category
    let password = '';
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += symbols[crypto.randomInt(symbols.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }
    
    // Shuffle the password to avoid predictable patterns
    return this.shuffleString(password);
  }

  /**
   * Shuffle a string to randomize character positions
   */
  private static shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      const temp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = temp;
    }
    return arr.join('');
  }

  /**
   * Generate a password with specified length (12-16 characters)
   */
  static generatePassword(length?: number): string {
    const minLength = 12;
    const maxLength = 16;
    
    if (length && (length < minLength || length > maxLength)) {
      throw new Error(`Password length must be between ${minLength} and ${maxLength} characters`);
    }
    
    const actualLength = length || crypto.randomInt(minLength, maxLength + 1);
    return this.generateSecurePassword(actualLength);
  }
} 