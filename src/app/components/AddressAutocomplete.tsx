import { useRef, useState, useCallback, useEffect } from 'react';
import { Input } from './ui/input';
import { searchAddressSwitzerland, type NominatimResult } from '../lib/nominatim';

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

const DEBOUNCE_MS = 300;

/**
 * Free address autocomplete for Switzerland using OpenStreetMap Nominatim (no API key).
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
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddressSwitzerland(q);
      setSuggestions(results);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      onChange(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchSuggestions(v), DEBOUNCE_MS);
    },
    [onChange, fetchSuggestions]
  );

  const handleSelect = useCallback(
    (item: NominatimResult) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      onChange(item.display_name);
      onSelect(item.display_name, lat, lng);
      setSuggestions([]);
      setOpen(false);
    },
    [onChange, onSelect]
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className={className}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-1 w-full rounded-md border border-[#d4af37]/30 bg-white py-1 shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {suggestions.map((item, i) => (
            <li
              key={`${item.lat}-${item.lon}-${i}`}
              role="option"
              className="cursor-pointer px-3 py-2 text-sm hover:bg-[#f4e4b7]/30 focus:bg-[#f4e4b7]/30"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ...
        </span>
      )}
    </div>
  );
}
