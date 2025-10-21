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
  const [manualEntryMode, setManualEntryMode] = useState(false);
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

    // If in manual entry mode, don't show suggestions
    if (manualEntryMode) {
      return;
    }

    if (newValue.length >= 2) {
      const results = searchAirports(newValue);
      setSuggestions(results);
      setShowSuggestions(results.length > 0 || newValue.length >= 2); // Show even if no results (to show manual option)
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
    setManualEntryMode(false);
  };

  const enableManualEntry = () => {
    setManualEntryMode(true);
    setShowSuggestions(false);
    setSuggestions([]);
    // Keep current input value so user can continue typing
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
      <div className="relative">
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
        {manualEntryMode && (
          <span className="absolute right-3 top-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Manual Entry
          </span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && !manualEntryMode && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((airport, index) => (
            <button
              key={`${airport.code}-${index}`}
              onClick={() => selectAirport(airport)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 ${
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
          
          {/* Manual Entry Option */}
          <button
            onClick={enableManualEntry}
            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t-2 border-gray-300"
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">✏️</span>
              <div>
                <div className="font-medium text-gray-700">Can't find your airport?</div>
                <div className="text-xs text-gray-500">Click to enter manually (e.g., "Toulouse, France")</div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Helper text */}
      {!manualEntryMode && inputValue.length > 0 && inputValue.length < 2 && (
        <p className="mt-1 text-xs text-gray-500">Type at least 2 characters to search</p>
      )}
      {manualEntryMode && (
        <p className="mt-1 text-xs text-green-600">
          ✓ Manual entry mode: Type your airport/city name (e.g., "Toulouse, France")
        </p>
      )}
    </div>
  );
}
