export type SearchLocation = {
  latitude: number;
  longitude: number;
  label: string;
  source: 'device' | 'manual';
};

export const DEFAULT_SEARCH_LOCATION: SearchLocation = {
  latitude: 28.6139,
  longitude: 77.209,
  label: 'New Delhi demo centre',
  source: 'manual',
};

export const SEARCH_AREAS: SearchLocation[] = [
  { latitude: 30.7333, longitude: 76.7794, label: 'Chandigarh demo centre', source: 'manual' },
  { latitude: 30.3398, longitude: 76.3869, label: 'Patiala demo centre', source: 'manual' },
  DEFAULT_SEARCH_LOCATION,
  { latitude: 28.4595, longitude: 77.0266, label: 'Gurugram demo centre', source: 'manual' },
  { latitude: 28.5355, longitude: 77.391, label: 'Noida demo centre', source: 'manual' },
  { latitude: 28.6692, longitude: 77.4538, label: 'Ghaziabad demo centre', source: 'manual' },
  { latitude: 28.4089, longitude: 77.3178, label: 'Faridabad demo centre', source: 'manual' },
];

export function getSearchLocation(state: unknown): SearchLocation {
  if (typeof state !== 'object' || state === null || !('searchLocation' in state)) {
    return DEFAULT_SEARCH_LOCATION;
  }

  const location = state.searchLocation;
  if (
    typeof location === 'object' &&
    location !== null &&
    'latitude' in location &&
    'longitude' in location &&
    'label' in location &&
    'source' in location &&
    typeof location.latitude === 'number' &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    typeof location.longitude === 'number' &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180 &&
    typeof location.label === 'string' &&
    (location.source === 'device' || location.source === 'manual')
  ) {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      label: location.label,
      source: location.source,
    };
  }

  return DEFAULT_SEARCH_LOCATION;
}

export function withSearchLocation(state: unknown, searchLocation: SearchLocation) {
  const existingState =
    typeof state === 'object' && state !== null
      ? (state as Record<string, unknown>)
      : {};

  return { ...existingState, searchLocation };
}
