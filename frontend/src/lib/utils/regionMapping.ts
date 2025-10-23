/**
 * Region mapping utilities for frontend-backend compatibility
 */

// Mapping des régions frontend (format normal) vers backend (format majuscule)
export const REGION_MAPPING: { [key: string]: string } = {
  'Tunis': 'TUNIS',
  'Ariana': 'ARIANA',
  'Béja': 'BEJA',
  'Ben Arous': 'BEN_AROUS',
  'Bizerte': 'BIZERTE',
  'Gabès': 'GABES',
  'Gafsa': 'GAFSA',
  'Jendouba': 'JENDOUBA',
  'Kairouan': 'KAIROUAN',
  'Kasserine': 'KASSERINE',
  'Kébili': 'KEBILI',
  'Kef': 'KEF',
  'Mahdia': 'MAHDIA',
  'Manouba': 'MANOUBA',
  'Médenine': 'MEDENINE',
  'Monastir': 'MONASTIR',
  'Nabeul': 'NABEUL',
  'Sfax': 'SFAX',
  'Sidi Bouzid': 'SIDI_BOUZID',
  'Siliana': 'SILIANA',
  'Sousse': 'SOUSSE',
  'Tataouine': 'TATAOUINE',
  'Tozeur': 'TOZEUR',
  'Zaghouan': 'ZAGHOUAN'
};

// Mapping inverse (backend vers frontend)
export const REVERSE_REGION_MAPPING: { [key: string]: string } = Object.fromEntries(
  Object.entries(REGION_MAPPING).map(([frontend, backend]) => [backend, frontend])
);

/**
 * Convertit une région frontend vers le format backend
 */
export const mapRegionToBackend = (frontendRegion: string): string => {
  return REGION_MAPPING[frontendRegion] || frontendRegion;
};

/**
 * Convertit une région backend vers le format frontend
 */
export const mapRegionToFrontend = (backendRegion: string): string => {
  return REVERSE_REGION_MAPPING[backendRegion] || backendRegion;
};

/**
 * Filtre les villes par région en gérant le mapping automatiquement
 */
export const filterCitiesByRegion = (cities: any[], selectedRegion: string): any[] => {
  if (!selectedRegion) return cities;
  
  const backendRegion = mapRegionToBackend(selectedRegion);
  return cities.filter(city => city.region === backendRegion);
};
