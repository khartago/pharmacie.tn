import { Region } from '@prisma/client';

/**
 * Region mapping utilities for frontend-backend compatibility
 * Maps display names (e.g., "Ariana") to enum values (e.g., "ARIANA")
 */

// Mapping from display names to enum values
export const REGION_TO_ENUM: { [key: string]: Region } = {
  'Tunis': 'TUNIS',
  'Ariana': 'ARIANA',
  'Ben Arous': 'BEN_AROUS',
  'Manouba': 'MANOUBA',
  'Nabeul': 'NABEUL',
  'Zaghouan': 'ZAGHOUAN',
  'Bizerte': 'BIZERTE',
  'Béja': 'BEJA',
  'Jendouba': 'JENDOUBA',
  'Kef': 'KEF',
  'Siliana': 'SILIANA',
  'Sousse': 'SOUSSE',
  'Monastir': 'MONASTIR',
  'Mahdia': 'MAHDIA',
  'Sfax': 'SFAX',
  'Kairouan': 'KAIROUAN',
  'Kasserine': 'KASSERINE',
  'Sidi Bouzid': 'SIDI_BOUZID',
  'Gabès': 'GABES',
  'Médenine': 'MEDENINE',
  'Tataouine': 'TATAOUINE',
  'Gafsa': 'GAFSA',
  'Tozeur': 'TOZEUR',
  'Kébili': 'KEBILI'
};

// Reverse mapping from enum values to display names
export const ENUM_TO_REGION: { [key: string]: string } = {
  'TUNIS': 'Tunis',
  'ARIANA': 'Ariana',
  'BEN_AROUS': 'Ben Arous',
  'MANOUBA': 'Manouba',
  'NABEUL': 'Nabeul',
  'ZAGHOUAN': 'Zaghouan',
  'BIZERTE': 'Bizerte',
  'BEJA': 'Béja',
  'JENDOUBA': 'Jendouba',
  'KEF': 'Kef',
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
  'KEBILI': 'Kébili'
};

/**
 * Converts a display region name to the corresponding enum value
 * @param region Display name (e.g., "Ariana")
 * @returns Enum value (e.g., "ARIANA")
 */
export const mapRegionToEnum = (region: string): Region => {
  const enumValue = REGION_TO_ENUM[region];
  if (enumValue) {
    return enumValue;
  }
  // If not found, try uppercasing (for enum values passed directly)
  return region.toUpperCase() as Region;
};

/**
 * Converts an enum value to the corresponding display name
 * @param enumValue Enum value (e.g., "ARIANA")
 * @returns Display name (e.g., "Ariana")
 */
export const mapEnumToRegion = (enumValue: string): string => {
  return ENUM_TO_REGION[enumValue] || enumValue;
};

