import { useRef, useEffect, useState, useCallback } from 'react';
import { Input } from './ui/input';
import { loadGoogleMapsScript, getGoogleMapsApiKey, isGoogleMapsAvailable } from '../lib/google-maps';

export interface AddressSuggestion {
  formattedAddress: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  disabled?: boolean;
}

/**
 * Address input with live suggestions restricted to Switzerland (CH).
 * Uses Google Places Autocomplete with componentRestrictions: { country: 'ch' }.
 * When no API key: plain input so typing still works and user can proceed.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  id,
  className,
  'aria-invalid': ariaInvalid,
  disabled,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(isGoogleMapsAvailable());

  useEffect(() => {
    const apiKey = getGoogleMapsApiKey();
    if (!apiKey || scriptsLoaded) return;

    loadGoogleMapsScript(apiKey)
      .then(() => setScriptsLoaded(true))
      .catch(() => {
        // No-op: fall back to plain input
      });
  }, [scriptsLoaded]);

  useEffect(() => {
    if (!scriptsLoaded || !inputRef.current || !window.google?.maps?.places) return;

    const input = inputRef.current;
    if (autocompleteRef.current) return; // already bound

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'ch' },
      fields: ['formatted_address', 'geometry'],
      types: ['address', 'establishment', 'geocode'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const addr = place.formatted_address ?? '';
      const location = place.geometry?.location;
      if (addr) {
        onChange(addr);
        if (location) {
          onSelect(addr, location.lat(), location.lng());
        }
      }
    });

    autocompleteRef.current = autocomplete;
    return () => {
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
      autocompleteRef.current = null;
    };
  }, [scriptsLoaded, onChange, onSelect]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      aria-invalid={ariaInvalid}
      disabled={disabled}
      autoComplete="off"
    />
  );
}
