'use client';

import { useState, useRef, useEffect } from 'react';
import { searchAirports, formatAirportDisplay, type Airport } from '@/lib/airportData';

interface AirportAutocompleteProps {
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function AirportAutocomplete({ 
  value, 
  onChange, 
  placeholder = "e.g., London, Oslo, LIS",
  autoFocus = false 
}: AirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length >= 2) {
      const results = searchAirports(newValue);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectAirport = (airport: Airport) => {
    const displayText = `${airport.city}, ${airport.country}`;
    setInputValue(displayText);
    onChange(displayText, airport);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectAirport(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((airport, index) => (
            <button
              key={`${airport.code}-${index}`}
              onClick={() => selectAirport(airport)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{airport.city}</div>
                  <div className="text-sm text-gray-600">{airport.name}</div>
                </div>
                <div className="text-sm font-semibold text-blue-600 ml-4">
                  {airport.code}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Helper text */}
      {inputValue.length > 0 && inputValue.length < 2 && (
        <p className="mt-1 text-xs text-gray-500">Type at least 2 characters to search</p>
      )}
    </div>
  );
}
