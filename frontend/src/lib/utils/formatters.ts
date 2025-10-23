'use client';

// Date formatting
export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) {
    return 'Date non disponible';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return dateObj.toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
}

export function formatDateShort(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Date non disponible';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Il y a moins d\'une minute';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else {
    return formatDateShort(dateObj);
  }
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'TND'): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Status formatting
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    // Announcement statuses
    'AVAILABLE': 'Disponible',
    'RESERVED': 'Réservé',
    'EXPIRED': 'Expiré',
    'RETURN_PENDING': 'Retour en attente',
    'RETURN_ACCEPTED': 'Retour accepté',
    'RETURN_REFUSED': 'Retour refusé',
    
    // Request statuses
    'OPEN': 'Ouvert',
    'ACCEPTED': 'Accepté',
    'CLOSED': 'Fermé',
    
    // Interest statuses
    'PENDING': 'En attente',
    'ACCEPTED': 'Accepté',
    'REFUSED': 'Refusé',
    
    // Request response statuses
    'PENDING': 'En attente',
    'ACCEPTED': 'Accepté',
    'REFUSED': 'Refusé',
    
    // Support ticket statuses
    'OPEN': 'Ouvert',
    'IN_PROGRESS': 'En cours',
    'RESOLVED': 'Résolu',
    
    // User statuses
    'ACTIVE': 'Actif',
    'INACTIVE': 'Inactif',
  };

  return statusMap[status] || status;
}

// Region formatting
export function formatRegion(region: string): string {
  const regionMap: Record<string, string> = {
    'TUNIS': 'Tunis',
    'ARIANA': 'Ariana',
    'BEN_AROUS': 'Ben Arous',
    'MANOUBA': 'Manouba',
    'NABEUL': 'Nabeul',
    'ZAGHOUAN': 'Zaghouan',
    'BIZERTE': 'Bizerte',
    'BEJA': 'Béja',
    'JENDOUBA': 'Jendouba',
    'KEF': 'Le Kef',
    'SILIANA': 'Siliana',
    'SOUSSE': 'Sousse',
    'MONASTIR': 'Monastir',
    'MAHDIA': 'Mahdia',
    'SFAX': 'Sfax',
    'KAIROUAN': 'Kairouan',
    'KASSERINE': 'Kasserine',
    'SIDI_BOUZID': 'Sidi Bouzid',
    'GABES': 'Gabès',
    'MEDENINE': 'Médenine',
    'TATAOUINE': 'Tataouine',
    'GAFSA': 'Gafsa',
    'TOZEUR': 'Tozeur',
    'KEBILI': 'Kébili',
  };

  return regionMap[region] || region;
}

// Time remaining formatting
export function formatTimeRemaining(expiryDate: string | Date): string {
  const dateObj = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();

  if (diffInMs <= 0) {
    return 'Expiré';
  }

  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Number formatting
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Tunisian phone numbers
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  } else if (cleaned.length === 9 && cleaned.startsWith('2')) {
    return `+216 ${cleaned.slice(1, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  }
  
  return phone;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format medicine name
export function formatMedicineName(medicine: { dci: string; brandName: string; dosage: string; form: string }): string {
  return `${medicine.brandName} (${medicine.dci}) - ${medicine.dosage} ${medicine.form}`;
}
