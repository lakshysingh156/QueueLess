import { useState } from 'react';
import { LoaderCircle, MapPin, Navigation } from 'lucide-react';
import { SEARCH_AREAS, type SearchLocation } from '../searchLocation';

type LocationPickerProps = {
  value: SearchLocation;
  onChange: (location: SearchLocation) => void;
};

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setError('Location access is not available in this browser. Choose a supported city instead.');
      return;
    }

    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({
          latitude: coords.latitude,
          longitude: coords.longitude,
          label: 'Current device location',
          source: 'device',
        });
        setIsLocating(false);
      },
      (positionError) => {
        const message =
          positionError.code === positionError.PERMISSION_DENIED
            ? 'Location permission was declined. Choose a supported city to continue.'
            : positionError.code === positionError.TIMEOUT
              ? 'Location request timed out. Try again or choose a supported city.'
              : 'Could not determine your location. Try again or choose a supported city.';
        setError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  }

  function selectArea(label: string) {
    const area = SEARCH_AREAS.find((item) => item.label === label);
    if (area) {
      setError('');
      onChange(area);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-label="Search location">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            Search near
          </div>
          <p className="mt-1 text-xs text-slate-500" aria-live="polite">
            {value.source === 'device'
              ? 'Using your device location for this search.'
              : `Using approximate ${value.label}.`}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="search-area">
            Choose an approximate search area
          </label>
          <select
            id="search-area"
            value={value.source === 'manual' ? value.label : ''}
            onChange={(event) => selectArea(event.target.value)}
            className="input min-w-56 py-2.5 text-sm"
          >
            {value.source === 'device' && (
              <option value="" disabled>
                Choose a supported area
              </option>
            )}
            {SEARCH_AREAS.map((area) => (
              <option key={area.label} value={area.label}>
                {area.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={useDeviceLocation}
            disabled={isLocating}
            className="btn btn-secondary btn-sm justify-center whitespace-nowrap px-3.5 py-2.5"
          >
            {isLocating ? (
              <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Navigation className="mr-1.5 h-4 w-4" aria-hidden="true" />
            )}
            {isLocating ? 'Finding location…' : 'Use my location'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-rose-700" role="alert">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        The directory currently covers Delhi-NCR, Chandigarh, and Patiala. Searches show hospitals
        within 50 km; distances are straight-line estimates, not road travel times. Your device
        location is requested only when you choose “Use my location.”
      </p>
    </section>
  );
}
